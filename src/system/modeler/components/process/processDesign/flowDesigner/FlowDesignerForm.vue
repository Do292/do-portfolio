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
							<GridForm
								:checkbox="false"
								:tableId="TABLE.PROCESS_FLOW"
								@clone="openModalCloneContent"
								@onSelectionChanged="selectProcessFlow"
							>
								<template v-slot:grid-button>
									<span></span>
								</template>
							</GridForm>
						</template>
						<template v-slot:bottom>
							<GridForm
								:customItems="filteredOperationList"
								:dragging="true"
								:dropTargetId="TABLE.PROCESS_FLOW_CONTENT"
								:needsComboButton="false"
								:tableId="TABLE.PROCESS_OPERATION"
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
					<GridForm
						ref="contentRef"
						:condition="selectedFlow"
						:customItems="contentList"
						:customPosition="POSITION"
						:dragging="true"
						:needsComboButton="false"
						:needsDefaultFactory="false"
						:tableId="TABLE.PROCESS_FLOW_CONTENT"
						menuId="FlowDesigner"
						@delete="$emit('delete', $event)"
						@init="fetchContentList"
						@onSelectionChanged="setInformation"
					>
						<template v-slot:grid-button>
							<div
								class="btn-group"
								@click.capture="validateProcessFlow"
							>
								<ButtonAddList
									:gridId="TABLE.PROCESS_OPERATION"
									:items="filteredOperationList"
									:tableId="TABLE.PROCESS_FLOW_CONTENT"
									@apply="createContentAtPosition"
								/>
								<ButtonBasic
									:needsAuthority="true"
									:type="ACTION.DELETE"
									class="text-red"
									@onClick="openModalDelete"
								/>
							</div>
						</template>
					</GridForm>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import GridForm from "~/system/modeler/components/common/form/GridForm";
import ButtonAddList from "~/system/modeler/components/common/button/ButtonAddList";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";

import { ref, computed, watch, onMounted } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useUserInfo } from "~/system/modeler/plugins/composables/modeler-authority";
import {
	useModalConfirm,
	useModalAlert,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useFetchData,
	useUpdateData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import {
	PROCESS_FLOW,
	PROCESS_OPERATION,
	PROCESS_FLOW_CONTENT,
} from "~/system/modeler/constants/table_constants.js";
import {
	ID,
	DATA_STATE,
	TABLE,
	ACTION,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "FlowDesignerForm",
	components: {
		GridForm,
		ButtonAddList,
		ButtonBasic,
	},
	emits: ["delete"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const horizontalConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];
		const verticalConfigs = [{ key: "top" }, { key: "bottom" }];

		const { openModalConfirmBy } = useModalConfirm();
		const { createList } = useUpdateData();
		const { deepCloneItems } = useItem();
		const { openModalWarning } = useModalAlert();

		//==================== Factory
		const { FACTORY_ID } = ID;
		const { userFactory } = useUserInfo();
		const selectedFactory = computed(() => ({
			[FACTORY_ID]: userFactory.value,
			[ID.DATA_STATE]: DATA_STATE.CREATED,
		}));

		watch(
			() => userFactory.value,
			() => {
				fetchProcessOperationList();
				selectedFlow.value = defineProcessFlow({});
			},
		);

		//==================== ProcessFlow
		const { ID: FLOW_ID } = PROCESS_FLOW;

		const { filterItem } = useItem();
		const selectedFlow = ref(defineProcessFlow({}));
		const isFlowValid = computed(() => !!selectedFlow.value[FLOW_ID]);

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object} config.row
		 */
		function selectProcessFlow({ tableId, columns, row = {} }) {
			selectedFlow.value = defineProcessFlow(row);
			setInformation({ tableId, columns, row });
			fetchContentList();
		}

		/**
		 * @param {Object} item
		 * @returns {Object}
		 */
		function defineProcessFlow(item) {
			return filterItem(item, [FACTORY_ID, FLOW_ID]);
		}

		/**
		 * ProcessFlow가 유효한지 검증하여 이벤트 활성화 여부를 결정한다.
		 * @param {PointerEvent} e
		 */
		function validateProcessFlow(e) {
			if (!isFlowValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_FLOW,
				});
				e.stopPropagation();
			}
		}

		//==================== ProcessOperation
		const { ID: OPERATION_ID, DESCRIPTION } = PROCESS_OPERATION;

		const { assignDataState, fetchList } = useFetchData();
		const operationList = ref([]);
		const filteredOperationList = computed(() =>
			operationList.value.filter(
				flow =>
					!contentList.value.find(
						item => item[OPERATION_ID] === flow[OPERATION_ID],
					),
			),
		);

		/**
		 * OperationList 가져오기
		 */
		async function fetchProcessOperationList() {
			const param = assignDataState({ ...selectedFactory.value });
			operationList.value = await fetchList(() =>
				COMMON.getBy(TABLE.PROCESS_OPERATION, param),
			);
		}

		onMounted(fetchProcessOperationList);

		//==================== ProcessFlowContent
		const { POSITION } = PROCESS_FLOW_CONTENT;

		const contentRef = ref(null);
		const contentList = ref([]);

		/**
		 * contentList 가져오기
		 * @param target 새로운 데이터
		 */
		async function fetchContentList(target = []) {
			// Flow가 유효하지 않으면 content 비우기
			if (!isFlowValid.value) {
				contentList.value = [];
				return;
			}
			const param = assignDataState({ ...selectedFlow.value });
			contentList.value = await fetchList(() =>
				COMMON.getBy(TABLE.PROCESS_FLOW_CONTENT, param),
			);

			// Description 추가
			for (const content of contentList.value) {
				const operation = operationList.value.find(
					item => item[OPERATION_ID] === content[OPERATION_ID],
				);
				content[DESCRIPTION] = operation[DESCRIPTION];
			}

			// target이 있으면 그리드 초기화
			if (target.length) {
				contentRef.value.setGridItems(contentList.value, target);
			}
		}

		/**
		 * @param {Object[]} operations
		 * @param {Number|null} forceIndex
		 */
		function openModalConfirmContent(operations, forceIndex) {
			// 그리드 데이터 원복
			const contentItems = deepCloneItems(contentList.value);
			contentRef.value.setGridItems(contentItems);

			// ProcessFlow 검증
			if (!isFlowValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_FLOW,
				});
				return;
			}

			// Confirm 모달 활성화
			openModalConfirmBy(
				ACTION.CREATE,
				TABLE.PROCESS_FLOW_CONTENT,
				operations,

				// Apply function
				comment =>
					createContentAtPosition(operations, comment, forceIndex),
			);
		}

		/**
		 * @param {Object[]} operations
		 * @param {String} comment
		 * @param {Number|null} startIndex
		 */
		async function createContentAtPosition(
			operations,
			comment,
			startIndex,
		) {
			// Content 그리드 데이터 복사
			const contentItems = deepCloneItems(contentList.value);
			startIndex = startIndex ?? contentItems.length;

			// ProcessSpecContent 생성
			const items = operations.map((item, index) => ({
				[OPERATION_ID]: item[OPERATION_ID],
				[POSITION]: startIndex + index + DEFAULT_POSITION,
				...selectedFlow.value,
			}));
			const createItems = await createList(
				TABLE.PROCESS_FLOW_CONTENT,
				items,
				comment,
			);

			// 생성 데이터가 있을 경우, ChangePosition 수행
			if (createItems.length > 0) {
				// content 초기화
				await fetchContentList();

				// index 기준으로 Position 부여
				contentRef.value.changePosition(createItems, contentList.value);
			}
		}

		function openModalDelete() {
			contentRef.value.openModalDelete();
		}

		/**
		 * Flow 기준으로 Content를 생성하기 위해 이벤트를 전송한다.
		 */
		function openModalCloneContent() {
			// ProcessFlow 검증
			if (!isFlowValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_FLOW,
				});
				return;
			}

			// Target 정의
			emit("clone", selectedFlow.value);
		}

		return {
			// Config
			ACTION,
			TABLE,
			isShowInformation,
			infoConfig,
			setInformation,
			horizontalConfigs,
			verticalConfigs,

			// ProcessFlow
			selectProcessFlow,
			selectedFlow,
			isFlowValid,
			validateProcessFlow,
			defineProcessFlow,

			// ProcessOperation
			filteredOperationList,

			// ProcessFlowContent
			POSITION,
			contentRef,
			contentList,
			fetchContentList,
			openModalConfirmContent,
			openModalDelete,
			openModalCloneContent,
			createContentAtPosition,
		};
	},
};
</script>

<style scoped>
:deep(.e-pane-vertical.e-scrollable.e-resizable .grid-form) {
	height: 100%;
}
:deep(.e-pane-vertical.e-scrollable.e-resizable .e-grid) {
	height: calc(100% - 48px) !important;
}
:deep(.e-pane-vertical.e-scrollable.e-resizable .e-gridcontent) {
	height: calc(100% - 86px) !important;
}
</style>
