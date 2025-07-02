<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<GridForm
						:checkbox="false"
						:condition="selectedSystem"
						menuId="Authority"
						tableId="Authority"
						@onSelectionChanged="selectAuthority"
					>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</GridForm>
				</template>
				<template v-slot:right>
					<div class="row">
						<div class="col-10 item-title">
							<label> Menu </label>
							<BreadcrumbTemplate
								:isSelectable="false"
								:items="authorityPaths"
							/>
						</div>
						<div class="col-2 text-right mt-2">
							<div class="item-box right-space">
								<ButtonText
									:needsAuthority="true"
									type="apply"
									@onClick="updateMenuAuth"
								/>
							</div>
						</div>
					</div>
					<TreeTemplate
						:key="currentRef"
						ref="treeRef"
						:checkedNodes="checkedNodes"
						:fieldText="MENU_NAME"
						:hasBadge="false"
						:showCheckBox="true"
						:treeItems="treeItems"
						sortOrder="None"
						@checkNode="checkAll"
						@refresh="fetchTreeItems"
					/>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";

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

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import * as TREE from "~/system/modeler/api/tree.js";
import {
	TABLE,
	ID,
	FLAG,
} from "~/system/modeler/constants/modeler_constants.js";
import {
	MENU,
	MENU_TYPE,
	NODE_FIELD,
} from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "AuthorityMenuForm",
	components: {
		TreeTemplate,
		BreadcrumbTemplate,
		HeaderSystem,
		GridForm,
		ButtonText,
	},
	setup() {
		//==================== Config
		const {
			SYSTEM_ID,
			ID: MENU_ID,
			NAME: MENU_NAME,
			POSITION,
			TYPE,
		} = MENU;
		const { AUTHORITY_MENU } = TABLE;
		const { AUTHORITY_ID } = ID;
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const selectedSystem = ref({ [SYSTEM_ID]: "" });

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		function selectSystemId(systemId) {
			// 기존 선택된 시스템과 다를 경우만
			if (selectedSystem.value[SYSTEM_ID] !== systemId) {
				selectedSystem.value = { [SYSTEM_ID]: systemId };
				selectedAuthority.value = { [SYSTEM_ID]: systemId };
				fetchTreeItems();
			}
		}

		//==================== Authority
		const { executeWithSpinner } = useSpinner();
		const { fetchList } = useFetchData();
		const { filterItem } = useItem();

		const currentRef = ref(0);
		const selectedAuthority = ref({});
		const authorityPaths = computed(() =>
			Object.values(selectedAuthority.value),
		);

		/**
		 * Authority 선택 변경
		 */
		async function selectAuthority({ tableId, columns, row = {} }) {
			selectedAuthority.value = {
				[SYSTEM_ID]: selectedSystem.value[SYSTEM_ID],
				[AUTHORITY_ID]: row[AUTHORITY_ID] ?? "",
			};
			setInformation({ tableId, columns, row });

			await fetchMenuAuth();
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
			treeItems.value = [];
			const condition = filterItem(selectedAuthority.value, [SYSTEM_ID]);
			const dto = formatTreeDTO(MENU, condition);

			await executeWithSpinner(async () => {
				const data = await fetchList(() => TREE.getBy(dto));
				treeItems.value = data.map(item =>
					Object.assign({ expanded: false }, item),
				);
				sortTreeItem(treeItems.value);
			});

			// Menu Auth 초기화
			fetchMenuAuth();
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

		//==================== Tree Node
		const nodeConfigs = ref([]);
		const checkConfig = computed(() =>
			nodeConfigs.value.reduce((acc, { id, checked }) => {
				acc[id] = checked;
				return acc;
			}, {}),
		);
		const checkedNodes = computed(() =>
			Object.entries(checkConfig.value).reduce((acc, [id, checked]) => {
				if (checked) {
					acc.push(id);
				}
				return acc;
			}, []),
		);

		/**
		 * @param {String} id
		 * @param {Boolean|null} checked
		 * @param {Boolean|null} force 자식 노드까지 체크 상태 변경할지
		 */
		function checkNode(id, checked) {
			const node = nodeConfigs.value.find(config => config.id === id);
			// Action type만 check 토글
			if (node.item[TYPE] === MENU_TYPE.ACTION) {
				node.checked = checked;
			}

			// 자식 노드 재귀 처리
			for (const child of node.item[CHILDREN]) {
				checkNode(child[NODE_ID], checked);
			}
		}

		/**
		 * @param {MouseEvent} e
		 */
		function checkAll(checked, data) {
			const { id } = data[0];
			checkNode(id, checked);
		}

		//==================== MenuAuth
		const { ACCESS_FLAG } = ID;
		const { createList, modifyList } = useUpdateData();
		const menuAuthConfig = ref({});

		/**
		 * 선택된 authority 기준으로 메뉴 권한 정의
		 */
		async function fetchMenuAuth() {
			const authorities = await fetchList(() =>
				COMMON.getBy(AUTHORITY_MENU, selectedAuthority.value),
			);
			menuAuthConfig.value = authorities.reduce((acc, cur) => {
				acc[cur[MENU_ID]] = cur[ACCESS_FLAG];
				return acc;
			}, {});
			nodeConfigs.value = treeRef.value.nodeConfigs.map(config =>
				Object.assign(
					{ checked: menuAuthConfig.value[config.id] === FLAG.Y },
					config,
				),
			);
		}

		/**
		 * @todo api 만들어지면 로직 고치기
		 */
		async function updateMenuAuth() {
			const createMenuAuths = [];
			const updateMenuAuths = [];

			for (const [key, newValue] of Object.entries(checkConfig.value)) {
				const oldValue = menuAuthConfig.value[key] === FLAG.Y;
				if (oldValue === newValue) {
					continue;
				}

				const menuAuth = {
					[MENU_ID]: key,
					[ACCESS_FLAG]: newValue ? FLAG.Y : FLAG.N,
					...selectedAuthority.value,
				};

				// 이미 있는데, 값이 기존이랑 달라진 경우
				if (key in menuAuthConfig.value) {
					updateMenuAuths.push(menuAuth);
				} else {
					createMenuAuths.push(menuAuth);
				}
			}

			await executeWithSpinner(async () => {
				if (createMenuAuths.length) {
					await createList(AUTHORITY_MENU, createMenuAuths);
				}
				if (updateMenuAuths.length) {
					await modifyList(
						AUTHORITY_MENU,
						updateMenuAuths,
						"",
						false,
					);
				}
			});

			fetchMenuAuth();
		}

		return {
			// Config
			isShowInformation,
			infoConfig,
			setInformation,
			selectedSystem,
			selectSystemId,

			// Authority
			currentRef,
			authorityPaths,
			selectAuthority,
			selectedAuthority,
			checkedNodes,

			// Tree
			NODE_ID,
			MENU_NAME,
			CHILDREN,
			treeRef,
			treeItems,
			fetchTreeItems,

			// Tree Node
			nodeConfigs,
			checkConfig,
			checkNode,
			checkAll,

			// Menu Auth
			updateMenuAuth,
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

/* Node Icon */
:deep(.tree-node label .e-label) {
	transform: translateX(-3px);
}

/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 340px) !important;
}

/* Filter */
:deep(.modal-dialog-top.setting) {
	transform: translate(73px, -25px) !important;
}
</style>
