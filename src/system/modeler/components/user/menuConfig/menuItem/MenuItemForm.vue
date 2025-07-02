<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<TreeTemplate
						ref="treeRef"
						:fieldText="MENU_NAME"
						:treeItems="treeItems"
						sortOrder="None"
						@clickItem="selectParentMenu"
						@refresh="fetchTreeItems"
					/>
				</template>
				<template v-slot:right>
					<GridForm
						:condition="menuConfig"
						:dragging="true"
						menuId="MenuItem"
						tableId="MenuItem"
						@create="openModalCreateItem"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="setInformation"
					>
						<template v-slot:grid-path>
							<BreadcrumbTemplate
								:items="menuPaths"
								@clickItem="searchParentNode"
							/>
						</template>
					</GridForm>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";
import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref, computed, onMounted, watch } from "vue";
import {
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useTree } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import * as TREE from "~/system/modeler/api/tree.js";
import {
	NODE_FIELD,
	MENU,
	MENU_TYPE,
} from "~/system/modeler/constants/tree_constants.js";
import { TABLE } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "MenuItemForm",
	components: {
		BreadcrumbTemplate,
		TreeTemplate,
		HeaderSystem,
		GridForm,
	},
	setup(_, { emit }) {
		//==================== Information
		const {
			ID,
			NAME: MENU_NAME,
			TYPE,
			TABLE_ID,
			SYSTEM_ID,
			POSITION,
		} = MENU;
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
			selectParentMenu({});
		}

		//==================== Tree Menu
		const treeRef = ref(null);
		const treeItems = ref([]);
		const { fetchList } = useFetchData();
		const { updateState } = useUpdateData();
		const { formatTreeDTO, defineTreeNodesWithRoot } = useTree();
		const { CHILDREN } = NODE_FIELD;

		/**
		 * 메뉴 트리를 system id 기준으로 그룹핑
		 */
		async function fetchTreeItems() {
			const dto = formatTreeDTO(MENU, {
				[SYSTEM_ID]: selectedSystemId.value,
			});
			const data = await fetchList(() => TREE.getBy(dto));

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
				if (item[TYPE] !== MENU_TYPE.ACTION) {
					item.selectable = false;
				}
				item[CHILDREN].sort((a, b) => a[POSITION] - b[POSITION]);
				formatTreeItem(item[CHILDREN]);
			}
		}

		function searchParentNode(value) {
			if (parentMenu.value[SYSTEM_ID] !== value) {
				treeRef.value.searchNode(value);
			}
		}

		onMounted(fetchTreeItems);
		watch(
			() => updateState.tableId === TABLE_ID,
			async isMenuUpdated => {
				if (isMenuUpdated) {
					const parentId = parentMenu.value[ID];
					await fetchTreeItems();
					searchParentNode(parentId);
				}
			},
		);

		onMounted(fetchTreeItems);

		//==================== Menu Config
		const parentMenu = ref({});
		const menuPaths = ref([]);

		const menuItems = computed(() => parentMenu.value[CHILDREN]);

		const menuConfig = computed(() => ({
			[SYSTEM_ID]: parentMenu.value[SYSTEM_ID],
			[ID]: parentMenu.value[ID],
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
		const { openModalWarning } = useModalAlert();

		/**
		 * @param {Object} config
		 */
		function openModalCreateItem(config) {
			// Menu 미선택시
			if (!menuConfig.value[ID]) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.MENU,
				});
				return;
			}

			const readOnlySetting = { ...menuConfig.value };

			emit("create", config, readOnlySetting);
		}

		return {
			// Information
			SYSTEM_ID,
			MENU_NAME,
			isShowInformation,
			setInformation,
			infoConfig,

			// System
			selectedSystemId,
			selectSystemId,

			// Tree
			treeRef,
			treeItems,
			fetchTreeItems,
			searchParentNode,

			// Menu Config
			menuConfig,
			menuItems,
			menuPaths,
			parentMenu,
			selectParentMenu,

			// Menu Item
			openModalCreateItem,
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
:deep(.breadcrumb.selectable:first-child:hover) {
	text-decoration: none !important;
	cursor: default !important;
}
:deep(#left-pane #tree-container > .tree-header) {
	margin-top: 5px !important;
}
:deep(#left-pane #tree-container > .tree-body) {
	height: calc(100vh - 256px) !important;
}
</style>
