<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<GridForm
						:checkbox="false"
						:condition="menuConfig"
						:menuId="TABLE.MENU_RELATION"
						:needsDataState="false"
						:tableId="TABLE.MENU"
						@onSelectionChanged="selectMenu"
					>
						<template v-slot:grid-path>
							<BreadcrumbTemplate
								:isSelectable="false"
								:items="[selectedSystemId]"
							/>
						</template>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</GridForm>
				</template>
				<template v-slot:right>
					<div class="row">
						<div class="col-10 item-title">
							<label>MenuRelation</label>
							<BreadcrumbTemplate
								:isSelectable="false"
								:items="menuPaths"
							/>
						</div>
						<div class="col-2 text-right mt-2">
							<div class="item-box right-space">
								<ButtonText
									:needsAuthority="true"
									type="apply"
									@onClick="updateMenuRelation"
								/>
							</div>
						</div>
					</div>
					<TreeTemplate
						:key="currentRef"
						ref="treeRef"
						:fieldText="MENU_NAME"
						:treeItems="treeItems"
						sortOrder="None"
						@refresh="fetchTreeItems"
					>
						<template v-slot:tree-node="data">
							<div class="tree-node">
								<CheckboxTemplate
									v-if="checkMenuAction(data)"
									v-model="relationConfig[data[NODE_ID]]"
									:field="data[NODE_ID]"
									:header="data[MENU_NAME] ?? data[NODE_ID]"
								/>
								<span v-else>
									<i class="aim aimcons_folder_2"></i>
									{{ data[MENU_NAME] ?? data[NODE_ID] }}
								</span>
							</div>
						</template>
					</TreeTemplate>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import CheckboxTemplate from "~/system/modeler/components/common/template/CheckboxTemplate";

import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import GridForm from "~/system/modeler/components/common/form/GridForm";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";

import { ref, computed } from "vue";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useTree } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import {
	useSpinner,
	useInformation,
} from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useMenu } from "~/system/modeler/plugins/composables/modeler-authority";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import * as TREE from "~/system/modeler/api/tree.js";
import {
	MENU,
	MENU_TYPE,
	NODE_FIELD,
} from "~/system/modeler/constants/tree_constants.js";
import { TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { MENU_RELATION } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "MenuRelationForm",
	components: {
		TreeTemplate,
		BreadcrumbTemplate,
		CheckboxTemplate,
		HeaderSystem,
		GridForm,
		ButtonText,
	},
	setup() {
		//==================== Config
		const { SYSTEM_ID, NAME: MENU_NAME, TYPE, POSITION } = MENU;
		const menuConfig = ref({
			[TYPE]: MENU_TYPE.ACTION,
			[SYSTEM_ID]: "",
		});
		const selectedSystemId = computed(() => menuConfig.value[SYSTEM_ID]);

		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { executeWithSpinner } = useSpinner();
		const { fetchList } = useFetchData();
		const { filterItem } = useItem();
		const { checkMenuAction } = useMenu();

		const currentRef = ref(0);
		const selectedMenu = ref({});
		const menuPaths = computed(() => Object.values(selectedMenu.value));

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		function selectSystemId(systemId) {
			// 기존 시스템과 같을 경우 무시
			if (selectedMenu.value[SYSTEM_ID] === systemId) {
				return;
			}

			menuConfig.value = {
				[TYPE]: MENU_TYPE.ACTION,
				[SYSTEM_ID]: systemId,
			};
			selectedMenu.value = {
				[SYSTEM_ID]: systemId,
				[MENU_RELATION.SOURCE]: "",
			};
			fetchTreeItems();
		}

		/**
		 * Authority 선택 변경
		 */
		async function selectMenu({ tableId, columns, row = {} }) {
			selectedMenu.value = {
				[SYSTEM_ID]: menuConfig.value[SYSTEM_ID],
				[MENU_RELATION.SOURCE]: row[MENU.ID] ?? "",
			};
			setInformation({ tableId, columns, row });

			await fetchMenuRelation();
		}

		//==================== Tree Menu
		const treeRef = ref(null);
		const treeItems = ref([]);
		const { formatTreeDTO } = useTree();
		const { ID: NODE_ID, CHILDREN } = NODE_FIELD;

		/**
		 * 메뉴 트리를 system id 기준으로 그룹핑
		 */
		async function fetchTreeItems() {
			const condition = filterItem(selectedMenu.value, [SYSTEM_ID]);
			const dto = formatTreeDTO(MENU, condition);

			await executeWithSpinner(async () => {
				const data = await fetchList(() => TREE.getBy(dto));
				treeItems.value = data.map(item =>
					Object.assign({ expanded: false }, item),
				);
				sortTreeItem(treeItems.value);
			});

			// Relation 초기화
			await fetchMenuRelation();
		}

		/**
		 * 재귀적으로 트리 데이터를 정렬한다.
		 * @param {Object} items
		 */
		function sortTreeItem(items) {
			items
				.sort((a, b) => a[POSITION] - b[POSITION])
				.forEach(item => sortTreeItem(item[CHILDREN]));
		}

		//==================== MenuAuth
		const { createList, deleteList } = useUpdateData();
		const destinationMenus = ref({});
		const relationConfig = ref({});

		/**
		 * 선택된 authority 기준으로 메뉴 권한 정의
		 */
		async function fetchMenuRelation() {
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.MENU_RELATION, selectedMenu.value),
			);
			destinationMenus.value = data.map(
				item => item[MENU_RELATION.DESTINATION],
			);
			initRelationConfig();
		}

		function initRelationConfig() {
			relationConfig.value = treeRef.value.nodeConfigs.reduce(
				(acc, { id }) => {
					acc[id] = destinationMenus.value.includes(id);
					return acc;
				},
				{},
			);
		}

		/**
		 * @todo api 만들어지면 로직 고치기
		 */
		async function updateMenuRelation() {
			const createRelations = [];
			const deleteRelations = [];

			for (const [key, value] of Object.entries(relationConfig.value)) {
				if (destinationMenus.value.includes(key) === value) {
					continue;
				}

				const relation = {
					[MENU_RELATION.DESTINATION]: key,
					...selectedMenu.value,
				};

				if (value) {
					createRelations.push(relation);
				} else {
					deleteRelations.push(relation);
				}
			}

			await executeWithSpinner(async () => {
				if (createRelations.length) {
					await createList(TABLE.MENU_RELATION, createRelations);
				}
				if (deleteRelations.length) {
					await deleteList(TABLE.MENU_RELATION, deleteRelations);
				}
			});
			fetchMenuRelation();
		}

		return {
			// Config
			TABLE,
			MENU_NAME,
			menuConfig,
			selectedSystemId,
			isShowInformation,
			setInformation,
			infoConfig,
			currentRef,
			menuPaths,
			selectSystemId,
			selectMenu,
			checkMenuAction,

			// Tree
			NODE_ID,
			CHILDREN,
			treeRef,
			treeItems,
			fetchTreeItems,

			// Menu Auth
			relationConfig,
			updateMenuRelation,
		};
	},
	data() {
		return {
			paneConfigs: [
				{ key: "left", size: 70, min: 50 },
				{ key: "right", size: 30, min: 20 },
			],
		};
	},
};
</script>

<style scoped>
/* Apply Button */
#button-apply {
	position: absolute;
	z-index: 100;
	bottom: 13px;
	right: 9px;
}

/* Tree View */
:deep(#tree-container),
:deep(#tree-container > .tree-header) {
	margin-top: 0 !important;
}
:deep(#tree-container > .tree-body) {
	height: calc(100vh - 225px);
}
:deep(.tree-node input[type="checkbox"]) {
	display: none;
}

/* Node Icon */
:deep(.tree-node) {
	transform: translateX(-8px);
}
:deep(.tree-node label .e-label) {
	transform: translateX(-3px);
}
:deep(.tree-node > span > i) {
	font-size: 16px;
	margin: 0px 1px 0px 2px;
	color: #ffb14b;
}

/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 343px) !important;
}

/* Filter */
:deep(.modal-dialog-top.setting) {
	transform: translate(73px, -25px) !important;
}
</style>
