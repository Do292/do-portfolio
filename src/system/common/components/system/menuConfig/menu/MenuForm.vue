<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem
						v-if="currentSystem"
						@select="selectSystemId"
					/>
					<FormTree
						ref="treeRef"
						:treeItems="treeItems"
						sortOrder="None"
						@clickItem="selectParentMenu"
						@refresh="fetchTreeItems"
					/>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="gridRef"
						:dragging="true"
						gridId="Menu"
						menuId="Menu"
						@create="openModalCreateMenu"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="setInformation"
					>
					</FormGrid>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
// import { ref, computed, watch, onMounted } from "vue";
import { ref, computed, onMounted } from "vue";
import { useFetchData } from "~/plugins/composables/dataHandler";
import { useSystem } from "~/plugins/composables/authority";
import { useTree } from "~/plugins/composables/syncfusionHelper";
import { useInformation } from "~/plugins/composables/uiControl";

import { NODE_FIELD, MENU, MENU_TYPE } from "~/plugins/wfb-constants.js";
import * as MENU_API from "~/api/system-common.js";
export default {
	name: "MenuForm",
	components: {},
	setup() {
		const { ID: MENU_ID, TYPE, PARENT_ID, SYSTEM_ID, POSITION } = MENU;

		const { systemInfo } = useSystem();
		const currentSystem = computed(() =>
			systemInfo.id == "modeler" || systemInfo.id == "mes" ? true : false,
		);

		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		//==================== System
		const selectedSystemId = ref("");

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		async function selectSystemId(systemId) {
			selectedSystemId.value = systemId;

			// 선택 초기화
			treeRef.value.selectedNode = "";
			await fetchTreeItems();

			// 그리드 데이터 바인딩
			treeRef.value.selectedNode = systemId;
			gridRef.value.initGridItems();
		}

		//==================== Tree Menu
		const treeRef = ref(null);
		const treeItems = ref([]);
		const { fetchList } = useFetchData();
		// const { updateState } = useUpdateData();
		const { formatTreeDTO, defineTreeNodesWithRoot } = useTree();
		const { CHILDREN } = NODE_FIELD;

		/**
		 * 메뉴 트리를 system id 기준으로 그룹핑
		 */
		async function fetchTreeItems() {
			const dto = formatTreeDTO(MENU, {
				[SYSTEM_ID]: selectedSystemId.value,
			});
			const data = await fetchList(() => MENU_API.getBy(dto));
			treeItems.value = defineTreeNodesWithRoot(
				data,
				selectedSystemId.value,
			);
			formatTreeItem(treeItems.value);
		}

		/**
		 * 재귀적으로 트리 데이터를 변환한다.
		 * @param {Object} items
		 */
		function formatTreeItem(items) {
			for (const item of items) {
				if (item[TYPE] === MENU_TYPE.ACTION) {
					item.selectable = false;
				}
				item[CHILDREN].sort((a, b) => a[POSITION] - b[POSITION]);
				formatTreeItem(item[CHILDREN]);
			}
		}

		function searchParentNode(value) {
			treeRef.value.searchNode(value);
		}

		// watch(
		// 	() => updateState.tableId === TABLE_ID,
		// 	async isMenuUpdated => {
		// 		if (isMenuUpdated) {
		// 			const parentId = parentMenu.value[MENU_ID];
		// 			await fetchTreeItems();
		// 			searchParentNode(parentId);
		// 		}
		// 	},
		// );

		onMounted(fetchTreeItems);

		//==================== Menu Config
		const gridRef = ref(null);
		const parentMenu = ref({});
		const menuPaths = ref([]);

		const menuItems = computed(() => parentMenu.value[CHILDREN] ?? []);

		const menuConfig = computed(() => ({
			[SYSTEM_ID]: parentMenu.value[SYSTEM_ID],
			[PARENT_ID]: parentMenu.value[MENU_ID],
		}));

		/**
		 * @param {Object} config
		 * @param {Object} config.item
		 * @param {String[]} config.paths
		 */
		function selectParentMenu({ item, paths }) {
			if (parentMenu.value !== item) {
				// System node 클릭 시, systemId가 없으므로 임의 할당
				parentMenu.value = Object.assign(
					{ [SYSTEM_ID]: selectedSystemId.value },
					item ?? {},
				);
				menuPaths.value = paths ?? [];
			}
		}

		//==================== Menu Grid
		// const { pascalToCamel } = useNaming();

		// /**
		//  * @param {Object} config
		//  */
		// function openModalCreateMenu(config) {
		// 	const { length } = parentMenu.value[CHILDREN];
		// 	const defaultPath = pascalToCamel(parentMenu.value[SYSTEM_ID]);
		// 	const path = (parentMenu.value[PATH] ?? defaultPath) + "/";

		// 	const readOnlySetting = {
		// 		...menuConfig.value,
		// 		[POSITION]: length + DEFAULT_POSITION,
		// 		[PATH]: path,
		// 	};

		// 	emit("create", config, readOnlySetting);
		// }

		return {
			// Information
			SYSTEM_ID,
			isShowInformation,
			setInformation,
			infoConfig,

			currentSystem,

			// System
			selectedSystemId,
			selectSystemId,

			// Tree
			treeRef,
			treeItems,
			fetchTreeItems,
			searchParentNode,

			// Menu Config
			gridRef,
			menuConfig,
			menuItems,
			menuPaths,
			parentMenu,
			selectParentMenu,

			// Menu Grid
			// openModalCreateMenu,
		};
	},
	data() {
		return {
			paneConfigs: [
				{ key: "left", size: 20, min: "280px" },
				{ key: "right", size: 80, min: 50 },
			],
		};
	},
};
</script>

<style scoped>
:deep(#left-pane #tree-container > .tree-header) {
	margin-top: 5px !important;
}
:deep(#left-pane #tree-container > .tree-body) {
	height: calc(100vh - 246px) !important;
}
</style>
