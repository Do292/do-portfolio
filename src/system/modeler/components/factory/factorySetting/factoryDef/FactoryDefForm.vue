<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<Splitter :paneConfigs="horizontalConfigs">
						<template v-slot:left>
							<TreeTemplate
								ref="treeRef"
								:treeItems="treeItems"
								class="mt-2"
								@clickItem="selectParentNode"
								@refresh="initTreeItems"
							/>
						</template>
						<template v-slot:right>
							<!-- 레이아웃 변경시 스플리터 재랜더링 -->
							<Splitter
								:key="verticalKey"
								:paneConfigs="verticalConfigs"
								orientation="Vertical"
							>
								<template
									v-for="config in gridConfigs"
									:key="config.getKey()"
									v-slot:[config.getKey()]
								>
									<GridForm
										v-bind="config"
										@create="openModalCreate"
										@delete="$emit('delete', $event)"
										@modify="$emit('modify', $event)"
										@onChangeFlag="initTreeItems"
										@onSelectionChanged="setInformation"
									>
										<template v-slot:grid-path>
											<BreadcrumbTemplate
												:items="nodePaths"
												@clickItem="searchParentNode"
											/>
										</template>
									</GridForm>
								</template>
							</Splitter>
						</template>
					</Splitter>
				</div>
			</div>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";
import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref, computed, watch, onMounted } from "vue";
import {
	useUpdateData,
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useTree,
	useGrid,
} from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";

import * as TREE from "~/system/modeler/api/tree.js";
import { MENU } from "~/system/modeler/constants/modeler_constants.js";
import {
	ROOT,
	NODE_FIELD,
	FACTORY,
	FACTORY_TABLE,
} from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "FactoryDefForm",
	components: {
		BreadcrumbTemplate,
		TreeTemplate,
		GridForm,
	},
	setup(_, { emit }) {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		//==================== Factory Tree
		const treeRef = ref(null);
		const treeItems = ref([]);
		const { assignDataState, fetchList } = useFetchData();
		const { updateState } = useUpdateData();
		const { defineTreeNodesWithRoot } = useTree();
		const { TYPE, CHILD_CONFIG, CONDITION_CONFIG } = FACTORY;

		// Node
		const selectedNode = ref({});
		const nodePaths = ref([]);
		const childItems = computed(
			() => selectedNode.value[NODE_FIELD.CHILDREN],
		);

		/**
		 * 노드 선택은 유지하고 트리 데이터 갱신
		 */
		async function initTreeItems() {
			const parentId = selectedNode.value[NODE_FIELD.ID];
			await fetchTreeItems();
			searchParentNode(parentId);
		}

		/**
		 * 메뉴 트리를 system id 기준으로 그룹핑
		 */
		async function fetchTreeItems() {
			const param = assignDataState();
			const data = await fetchList(() => TREE.getFactory(param));
			treeItems.value = defineTreeNodesWithRoot(data);
		}

		/**
		 * @param {Object} config
		 * @param {Object} config.item
		 */
		function selectParentNode({ item, paths }) {
			if (item[TYPE] !== FACTORY_TABLE.PORT.toUpperCase()) {
				selectedNode.value = item;
				nodePaths.value = paths.slice(1); // Root 제외
			}
		}

		/**
		 * @param {String} value
		 */
		function searchParentNode(value) {
			treeRef.value.searchNode(value);
		}

		onMounted(async () => {
			await fetchTreeItems();
			// Factory 그리드 바인딩
			selectedNode.value = treeItems.value[0];
		});

		// 그리드 데이터 변경에 의한 트리 바인딩
		watch(
			() => updateState.tableId,
			tableId => {
				if (Object.values(FACTORY_TABLE).includes(tableId)) {
					initTreeItems();
				}
			},
		);

		//==================== Factory Grid
		const { GridBase } = useGrid();

		class GridFactory extends GridBase {
			constructor(key) {
				const items =
					childItems.value?.filter(
						item => item[TYPE] === key.toUpperCase(),
					) ?? [];
				super(key, selectedNode.value, items);

				this.needsDefaultFactory = false;
				this.menuId = MENU.FACTORY_DEF;
			}
		}

		const gridTypes = computed(() => {
			const key = selectedNode.value[TYPE] ?? ROOT;
			return CHILD_CONFIG[key];
		});
		const gridConfigs = computed(() =>
			gridTypes.value.map(type => new GridFactory(type)),
		);

		// Splitter
		const verticalConfigs = computed(() =>
			gridTypes.value.map(key => ({ key })),
		);
		const verticalKey = computed(() => gridTypes.value.join("-"));

		//==================== Factory Create
		const { createItem } = useItem();

		/**
		 * table type에 따라 readOnlySetting을 지정해준다.
		 * @param {Object} config
		 */
		function openModalCreate(config) {
			const { tableId: key } = config;
			if (key === FACTORY_TABLE.FACTORY) {
				emit("create", config);
				return;
			}

			const conditionConfig = CONDITION_CONFIG[key];
			const readOnlySetting = createItem(
				Object.keys(conditionConfig),
				key => selectedNode.value[conditionConfig[key]],
			);

			emit("create", config, readOnlySetting);
		}

		return {
			// Information
			isShowInformation,
			setInformation,
			infoConfig,

			// Tree
			treeRef,
			treeItems,
			nodePaths,
			initTreeItems,
			fetchTreeItems,
			searchParentNode,
			selectParentNode,

			// Grid Config
			gridConfigs,
			verticalConfigs,
			verticalKey,
			openModalCreate,
		};
	},
	data() {
		return {
			horizontalConfigs: [
				{ key: "left", size: 20, min: "280px" },
				{ key: "right", size: 80, min: 50 },
			],
		};
	},
};
</script>
<style scoped>
:deep(.e-pane-vertical.e-scrollable.e-resizable .grid-form) {
	height: 100%;
}
:deep(#right-pane .e-pane-vertical.e-scrollable.e-resizable .e-grid) {
	height: calc(100% - 48px) !important;
}
:deep(#right-pane .e-pane-vertical.e-scrollable.e-resizable .e-gridcontent) {
	height: calc(100% - 86px) !important;
}
</style>
