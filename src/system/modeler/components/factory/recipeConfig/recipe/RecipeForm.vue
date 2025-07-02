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
								@refresh="fetchTreeItems"
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
									v-for="config of gridConfigs"
									:key="config.getKey()"
									v-slot:[config.getKey()]
								>
									<GridForm
										v-bind="config"
										@create="openModalCreate"
										@delete="$emit('delete', $event)"
										@modify="$emit('modify', $event)"
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
import {
	ROOT,
	NODE_FIELD,
	RECIPE_TABLE,
	RECIPE,
	RECIPE_TYPE,
	RECIPE_ID_CONFIG,
} from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "RecipeForm",
	components: {
		BreadcrumbTemplate,
		TreeTemplate,
		GridForm,
	},
	setup(_, { emit }) {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		//==================== Recipe Tree
		const treeRef = ref(null);
		const treeItems = ref([]);
		const { assignDataState, fetchList } = useFetchData();
		const { updateState } = useUpdateData();
		const { defineTreeNodesWithRoot } = useTree();
		const { TYPE, CHILD_CONFIG, CONDITION_CONFIG } = RECIPE;

		const selectedNode = ref({});
		const nodePaths = ref([]);

		/**
		 * 메뉴 트리를 system id 기준으로 그룹핑
		 */
		async function fetchTreeItems() {
			const param = assignDataState();
			const data = await fetchList(() => TREE.getRecipe(param));
			treeItems.value = defineTreeNodesWithRoot(data);
		}

		/**
		 * @param {Object} config
		 * @param {Object} config.item
		 */
		function selectParentNode({ item, paths }) {
			selectedNode.value = item;
			nodePaths.value = paths.slice(1); // Root 제외
		}

		/**
		 * @param {String} value
		 */
		function searchParentNode(value) {
			treeRef.value.searchNode(value);
		}

		onMounted(async () => {
			await fetchTreeItems();

			// RecipeGroup 그리드 바인딩
			selectedNode.value = treeItems.value[0];
		});
		watch(
			() => updateState.tableId,
			async tableId => {
				if (Object.values(RECIPE_TABLE).includes(tableId)) {
					const parentId = selectedNode.value[NODE_FIELD.ID];
					await fetchTreeItems();
					searchParentNode(parentId);
				}
			},
		);

		//==================== Factory Grid
		const { GridBase } = useGrid();
		const { createItem } = useItem();

		const isRecipeGroup = table => table === RECIPE_TABLE.RECIPE_GROUP;

		class GridRecipeGroup extends GridBase {
			constructor() {
				// RecipeGroup은 tree에서 가지고 있으므로, customItems 사용
				const items = selectedNode.value[NODE_FIELD.CHILDREN] ?? [];
				super(RECIPE_TABLE.RECIPE_GROUP, selectedNode.value, items);

				// MenuId 지정
				this.menuId = RECIPE_TABLE.RECIPE;
			}
		}

		class GridRecipe extends GridBase {
			constructor(table) {
				const config = CONDITION_CONFIG[table];
				const condition = createItem(
					Object.keys(config),
					key => selectedNode.value[config[key]],
				);
				super(table, condition);

				// MenuId 지정
				this.menuId = RECIPE_TABLE.RECIPE;
			}
		}

		const gridTables = computed(() => {
			const key = selectedNode.value[TYPE] ?? ROOT;
			return CHILD_CONFIG[key];
		});
		const gridConfigs = computed(() =>
			gridTables.value.map(table =>
				isRecipeGroup(table)
					? new GridRecipeGroup()
					: new GridRecipe(table),
			),
		);
		const verticalConfigs = computed(() =>
			gridTables.value.map(table => ({
				key: table,
				size: 100 / gridTables.value.length,
			})),
		);
		const verticalKey = computed(() => gridTables.value.join("-"));

		//==================== Recipe Create
		/**
		 * table type에 따라 readOnlySetting을 지정해준다.
		 * @param {Object} config
		 */
		function openModalCreate(config) {
			const { tableId } = config;
			const conditionConfig = CONDITION_CONFIG[tableId];
			const readOnlySetting = createItem(
				Object.keys(conditionConfig),
				key => selectedNode.value[conditionConfig[key]],
			);

			if (isRecipeGroup(tableId)) {
				// RecipeGroup의 경우 type 별도 지정
				readOnlySetting[TYPE] = selectedNode.value[TYPE]
					? RECIPE_TYPE.EQUIPMENT
					: RECIPE_TYPE.LOGICAL;
			} else {
				// Equipment의 Logical readonly setting을 위함.
				readOnlySetting[RECIPE_ID_CONFIG.LOGICAL_GROUP_ID] =
					selectedNode.value[RECIPE_ID_CONFIG.PARENT_GROUP_ID];
			}

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
