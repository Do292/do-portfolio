<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="horizontalConfigs">
				<template v-slot:left>
					<Splitter
						:paneConfigs="verticalConfigs"
						orientation="Vertical"
					>
						<template v-slot:top>
							<div class="row">
								<div class="col-8 item-title">
									<label>
										{{ $t(TABLE.PROCESS_SPEC) }}
									</label>
									<BreadcrumbTemplate
										:isSelectable="false"
										:items="[userFactory]"
									/>
								</div>
								<div class="col-4 text-right">
									<div class="item-box right-space">
										<ButtonCombo
											:items="[ACTION.CLONE]"
											:needsAuthority="true"
											@onSelect="openModalCloneContent"
										/>
									</div>
								</div>
							</div>
							<TreeTemplate
								:treeItems="specItems"
								@clickItem="selectProcessSpec"
								@refresh="fetchSpecItems"
							/>
						</template>
						<template v-slot:bottom>
							<GridForm
								:key="currentRef"
								:customItems="filteredFlowList"
								:dragging="true"
								:dropTargetId="PROCESS_SPEC_CONTENT"
								:menuId="MENU.PROCESS_SPEC_DESIGN"
								:needsComboButton="false"
								:tableId="TABLE.PROCESS_FLOW"
								@onCrossGridDrop="openModalConfirmContent"
								@onSelectionChanged="setInformation"
							>
								<template v-slot:grid-button>
									<span></span>
								</template>
							</GridForm>
						</template>
					</Splitter>
				</template>
				<template v-slot:right>
					<TabTemplate :isRemovable="false" :tabKeys="contentKeys">
						<template v-slot:[PROCESS_SPEC_CONTENT]>
							<GridForm
								ref="contentRef"
								:condition="selectedSpec"
								:customPosition="POSITION"
								:dragging="true"
								:menuId="MENU.PROCESS_SPEC_DESIGN"
								:needsComboButton="false"
								:needsDefaultFactory="false"
								:tableId="PROCESS_SPEC_CONTENT"
								@onSelectionChanged="setInformation"
							>
								<template v-slot:grid-button>
									<div
										class="btn-group"
										@click.capture="validateProcessSpec"
									>
										<ButtonAddList
											:gridId="TABLE.PROCESS_FLOW"
											:items="filteredFlowList"
											:tableId="PROCESS_SPEC_CONTENT"
											@apply="createContentAtPosition"
										/>
										<ButtonBasic
											:needsAuthority="true"
											:type="ACTION.DELETE"
											class="text-red"
											@onClick="openModalDeleteContent"
										/>
									</div>
								</template>
							</GridForm>
						</template>
						<template v-slot:[PROCESS_FLOW_CONTENT]>
							<ProcessFlowContentForm
								:spec="selectedSpec"
								:specContentList="contentList"
							/>
						</template>
					</TabTemplate>
				</template>
			</Splitter>
		</div>

		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import TabTemplate from "~/system/modeler/components/common/template/TabTemplate";
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";

import GridForm from "~/system/modeler/components/common/form/GridForm";
import ProcessFlowContentForm from "~/system/modeler/components/process/processSpecification/processSpecDesign/ProcessFlowContentForm";
import ButtonAddList from "~/system/modeler/components/common/button/ButtonAddList";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonCombo from "~/system/modeler/components/common/button/ButtonCombo";

import { ref, computed, watch, onMounted } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useFetchData,
	useUpdateData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useTree } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useUserInfo } from "~/system/modeler/plugins/composables/modeler-authority";
import {
	useModalAlert,
	useModalDelete,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import {
	ID,
	TABLE,
	MENU,
	ACTION,
	DATA_STATE,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";
import {
	PROCESS_SPEC,
	PROCESS_FLOW,
} from "~/system/modeler/constants/table_constants.js";
import { NODE_FIELD } from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "ProcessSpecDesignForm",
	components: {
		TabTemplate,
		TreeTemplate,
		BreadcrumbTemplate,

		ProcessFlowContentForm,
		GridForm,
		ButtonAddList,
		ButtonBasic,
		ButtonCombo,
	},
	setup(_, { emit }) {
		//==================== Information
		const { PROCESS_SPEC_CONTENT, PROCESS_FLOW_CONTENT } = TABLE;
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		// Modal Alert
		const { openModalWarning } = useModalAlert();

		// Splitter
		const verticalConfigs = [
			{ key: "top", size: 45, min: "200px" },
			{ key: "bottom" },
		];
		const horizontalConfigs = [
			{ key: "left", size: 30, min: "400px" },
			{ key: "right", size: 70 },
		];

		//==================== Factory
		const { FACTORY_ID } = ID;
		const { userFactory } = useUserInfo();
		const selectedFactory = computed(() => ({
			[FACTORY_ID]: userFactory.value,
			[ID.DATA_STATE]: DATA_STATE.CREATED,
		}));

		// Flow 그리드 즉각 갱신위해 사용
		const currentRef = ref(0);

		// default factory 변경 시 초기화
		watch(
			() => userFactory.value,
			() => {
				currentRef.value++;
				fetchSpecItems();
				fetchProcessFlowList();
				selectedSpec.value = defineProcessSpec({});
			},
		);

		onMounted(() => {
			fetchSpecItems();
			fetchProcessFlowList();
		});

		//==================== ProcessSpec
		const { ID: SPEC_ID, VERSION, POSITION } = PROCESS_SPEC;

		// Process Spec Tree
		const specItems = ref([]);

		const { fetchList } = useFetchData();
		const { groupIntoTreeNodes } = useTree();
		const { deepCloneItems, filterItem } = useItem();

		/**
		 * 트리데이터 정의
		 */
		async function fetchSpecItems() {
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.PROCESS_SPEC, selectedFactory.value),
			);
			data.forEach(item => {
				item[NODE_FIELD.ID] = `${item[SPEC_ID]} [${item[VERSION]}]`;
			});

			specItems.value = groupIntoTreeNodes(SPEC_ID, data);
			specItems.value.forEach(item => (item.selectable = false));
		}

		// Selected Process Spec
		const selectedSpec = ref(defineProcessSpec({}));
		const isSpecValid = computed(() => !!selectedSpec.value[SPEC_ID]);

		/**
		 * @param {Object} config
		 * @param {Object} config.item
		 */
		function selectProcessSpec({ item }) {
			if (selectedSpec.value !== item) {
				selectedSpec.value = defineProcessSpec(item);
			}
		}

		/**
		 * @param {Object} item
		 * @returns {Object}
		 */
		function defineProcessSpec(item) {
			return filterItem(item, [FACTORY_ID, SPEC_ID, VERSION]);
		}

		/**
		 * ProcessSpec이 유효한지 검증하여 이벤트 활성화 여부를 결정한다.
		 * @param {PointerEvent} e
		 */
		function validateProcessSpec(e) {
			if (!isSpecValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_SPEC,
				});
				e.stopPropagation();
			}
		}

		//==================== ProcessFlow
		const { ID: FLOW_ID } = PROCESS_FLOW;
		const flowList = ref([]);
		const filteredFlowList = computed(() =>
			flowList.value.filter(
				flow =>
					!contentList.value.find(
						item => item[FLOW_ID] === flow[FLOW_ID],
					),
			),
		);

		/**
		 * FlowList 가져오기
		 */
		async function fetchProcessFlowList() {
			flowList.value = await fetchList(() =>
				COMMON.getBy(TABLE.PROCESS_FLOW, selectedFactory.value),
			);
		}

		//==================== Content
		const contentKeys = [
			TABLE.PROCESS_SPEC_CONTENT,
			TABLE.PROCESS_FLOW_CONTENT,
		];
		const contentRef = ref(null);
		const contentList = computed(() =>
			contentRef.value?.gridItems.filter(item => item[SPEC_ID]),
		);

		// Delete
		const { openModalDelete } = useModalDelete();

		/**
		 * 선택 아이템이 하나 이상인지 확인 후 삭제 이벤트 전송
		 */
		function openModalDeleteContent() {
			const checkItems = contentRef.value.cloneCheckItems();
			if (checkItems.length == 0) {
				openModalWarning("warning.selectData");
				return;
			}

			// 키 데이터
			const items = checkItems.map(item =>
				contentRef.value.createKeyItem(item),
			);
			const config = contentRef.value.mergeTableConfig({ items });

			// 모달 활성화
			openModalDelete(config);
		}

		// Clone
		/**
		 * Spec 기준으로 Content를 생성하기 위해 이벤트를 전송한다.
		 */
		function openModalCloneContent() {
			// ProcessSpec 검증
			if (!isSpecValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_SPEC,
				});
				return;
			}

			// Target 정의
			emit("clone", selectedSpec.value);
		}

		// Create
		const { createList } = useUpdateData();
		const { openModalConfirmBy } = useModalConfirm();

		/**
		 * @param {Object[]} flowItems
		 * @param {Number|null} forceIndex
		 */
		function openModalConfirmContent(flowItems, forceIndex) {
			// 그리드 데이터 원복
			const contentItems = deepCloneItems(contentList.value);
			contentRef.value.setGridItems(contentItems);

			// ProcessSpec 검증
			if (!isSpecValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_SPEC,
				});
				return;
			}

			// Confirm 모달 활성화
			openModalConfirmBy(
				ACTION.CREATE,
				PROCESS_SPEC_CONTENT,
				flowItems,

				// Apply function
				comment =>
					createContentAtPosition(flowItems, comment, forceIndex),
			);
		}

		/**
		 * @param {Object[]} flowItems
		 * @param {String} comment
		 * @param {Number|null} startIndex
		 */
		async function createContentAtPosition(flowItems, comment, startIndex) {
			// Content 그리드 데이터 복사
			const contentItems = deepCloneItems(contentList.value);
			startIndex = startIndex ?? contentItems.length;

			// ProcessSpecContent 생성
			const items = flowItems.map((item, index) => ({
				[FLOW_ID]: item[FLOW_ID],
				[POSITION]: startIndex + index + DEFAULT_POSITION,
				...selectedSpec.value,
			}));
			const createItems = await createList(
				PROCESS_SPEC_CONTENT,
				items,
				comment,
			);

			// 생성 데이터가 있을 경우, ChangePosition 수행
			if (createItems.length > 0) {
				// 지정된 Index에 생성된 데이터 삽입
				contentItems.splice(startIndex, 0, ...createItems);

				// index 기준으로 Position 부여
				contentRef.value.changePosition(createItems, contentItems);
			}
		}

		return {
			// Config
			ACTION,
			TABLE,
			MENU,
			PROCESS_SPEC_CONTENT,
			PROCESS_FLOW_CONTENT,
			isShowInformation,
			infoConfig,
			setInformation,
			verticalConfigs,
			horizontalConfigs,

			// Factory
			currentRef,
			userFactory,
			selectedFactory,

			// ProcessSpec
			POSITION,
			specItems,
			fetchSpecItems,
			selectedSpec,
			isSpecValid,
			selectProcessSpec,
			validateProcessSpec,
			defineProcessSpec,

			// ProcessFlow
			filteredFlowList,
			fetchProcessFlowList,

			// Content
			contentRef,
			contentKeys,
			contentList,
			openModalDeleteContent,
			openModalCloneContent,
			openModalConfirmContent,
			createContentAtPosition,
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(.e-pane-vertical.e-scrollable.e-resizable .grid-form) {
	height: 100%;
}
:deep(.e-pane-vertical.e-scrollable.e-resizable .e-grid) {
	height: calc(100% - 49px) !important;
}
:deep(.e-pane-vertical.e-scrollable.e-resizable .e-gridcontent) {
	height: calc(100% - 83px) !important;
}
/* Grid */
:deep(#right-pane .e-gridcontent) {
	height: calc(100vh - 317px) !important;
}

/* Tree */
:deep(#left-pane #tree-container > .tree-header) {
	margin-top: 0 !important;
}
:deep(#left-pane #tree-container) {
	height: calc(100% - 42px) !important;
}
:deep(#left-pane #tree-container > .tree-body) {
	height: calc(100% - 46px) !important;
}
</style>
