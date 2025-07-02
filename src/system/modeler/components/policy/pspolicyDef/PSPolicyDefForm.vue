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
								ref="psConditionRef"
								:tableId="TABLE.PS_CONDITION_DEF"
								@create="$emit('create', $event)"
								@delete="checkAccessType('delete', $event)"
								@modify="checkAccessType('modify', $event)"
								@onSelectionChanged="selectPsCondition"
							/>
						</template>
						<template v-slot:bottom>
							<GridForm
								ref="psTableRef"
								:customItems="filteredPsTableList"
								:dragging="true"
								:dropTargetId="TABLE.PS_TABLE_CONDITION_DEF"
								:tableId="TABLE.PS_TABLE_DEF"
								@create="$emit('create', $event)"
								@delete="checkAccessType('delete', $event)"
								@modify="checkAccessType('modify', $event)"
								@onCrossGridDrop="
									openModalConfirmTableCondition
								"
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
						ref="psTableConditionRef"
						:condition="selectedPsCondition"
						:customPosition="POSITION"
						:dragging="true"
						:tableId="TABLE.PS_TABLE_CONDITION_DEF"
						@delete="$emit('delete', $event)"
						@onSelectionChanged="setInformation"
					>
						<template v-slot:grid-button>
							<div
								class="btn-group"
								@click.capture="validatePsCondition"
							>
								<ButtonAddList
									:items="filteredPsTableList"
									:tableId="TABLE.PS_TABLE_DEF"
									@apply="createTableConditionAtPosition"
								/>
								<ButtonBasic
									:needsAuthority="true"
									:type="ACTION.DELETE"
									class="text-red"
									@onClick="openModalDeleteTableCondition"
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

import { ref, computed, onMounted } from "vue";
import {
	useModalAlert,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useFetchData,
	useUpdateData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import {
	ID,
	TABLE,
	ACTION,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";
import {
	PS_CONDITION_DEF,
	PS_TABLE_DEF,
	PS_TABLE_CONDITION_DEF,
} from "~/system/modeler/constants/table_constants.js";

export default {
	name: "PSPolicyDefForm",
	components: {
		GridForm,
		ButtonAddList,
		ButtonBasic,
	},
	emits: ["create", "modify", "delete"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const horizontalConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];
		const verticalConfigs = [{ key: "top" }, { key: "bottom" }];

		//==================== Common
		const { openModalWarning } = useModalAlert();

		function checkAccessType(event, config) {
			const items = getCheckItems(config.tableId);
			const isAccessible = items.some(item => item[ID.ACCESS_TYPE] === 1);
			if (!isAccessible) {
				openModalWarning("warning.inaccessibleData");
				return;
			}
			emit(event, config);
		}

		function getCheckItems(tableId) {
			const gridRef =
				tableId === TABLE.PS_CONDITION_DEF
					? psConditionRef
					: psTableRef;
			return gridRef.value.cloneCheckItems();
		}

		//==================== PsCondition
		const { ID: CONDITION_ID } = PS_CONDITION_DEF;

		const psConditionRef = ref(null);
		const { filterItem } = useItem();
		const selectedPsCondition = ref(definePsCondition({}));
		const isPsConditionValid = computed(
			() => !!selectedPsCondition.value[CONDITION_ID],
		);

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object} config.row
		 */
		function selectPsCondition({ tableId, columns, row = {} }) {
			selectedPsCondition.value = definePsCondition(row);
			setInformation({ tableId, columns, row });
		}

		/**
		 * @param {Object} item
		 * @returns {Object}
		 */
		function definePsCondition(item) {
			return filterItem(item, [CONDITION_ID]);
		}

		/**
		 * PsCondition이 유효한지 검증하여 이벤트 활성화 여부를 결정한다.
		 * @param {PointerEvent} e
		 */
		function validatePsCondition(e) {
			if (!isPsConditionValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PS_CONDITION_DEF,
				});
				e.stopPropagation();
			}
		}

		//==================== PsTable
		const { ID: TABLE_ID } = PS_TABLE_DEF;

		const psTableRef = ref(null);
		const { fetchList, assignDataState } = useFetchData();
		const psTableList = ref([]);
		const filteredPsTableList = computed(() =>
			psTableList.value.filter(
				table =>
					!psTableConditionList.value.find(
						item => item[TABLE_ID] === table[TABLE_ID],
					),
			),
		);

		/**
		 * PsTable 리스트 가져오기
		 */
		async function fetchPsTableList() {
			psTableList.value = await fetchList(() =>
				COMMON.getBy(TABLE.PS_TABLE_DEF, assignDataState()),
			);
		}

		onMounted(async () => {
			await fetchPsTableList();
		});

		//==================== PsTableCondition
		const psTableConditionRef = ref(null);
		const { POSITION } = PS_TABLE_CONDITION_DEF;
		const psTableConditionList = computed(() =>
			psTableConditionRef.value.gridItems.filter(
				item => item[CONDITION_ID],
			),
		);

		const { openModalConfirmBy } = useModalConfirm();
		const { deepCloneItems } = useItem();
		const { createList } = useUpdateData();

		/**
		 * @param {Object[]} tableItems
		 * @param {Number|null} forceIndex
		 */
		function openModalConfirmTableCondition(tableItems, forceIndex) {
			// 그리드 데이터 원복
			const items = deepCloneItems(psTableConditionList.value);
			psTableConditionRef.value.setGridItems(items);

			// PsCondition 검증
			if (!isPsConditionValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PS_CONDITION_DEF,
				});
				return;
			}

			// Confirm 모달 활성화
			openModalConfirmBy(
				ACTION.CREATE,
				TABLE.PS_TABLE_CONDITION_DEF,
				tableItems,

				// Apply function
				comment =>
					createTableConditionAtPosition(
						tableItems,
						comment,
						forceIndex,
					),
			);
		}

		/**
		 * @param {Object[]} policies
		 * @param {String} comment
		 * @param {Number|null} startIndex
		 */
		async function createTableConditionAtPosition(
			policies,
			comment,
			startIndex,
		) {
			// PsTableCondition 그리드 데이터 복사
			const psItems = deepCloneItems(psTableConditionList.value);
			startIndex = startIndex ?? psItems.length;

			// PsTableCondition 생성
			const items = policies.map((item, index) => ({
				[TABLE_ID]: item[TABLE_ID],
				[POSITION]: startIndex + index + DEFAULT_POSITION,
				...selectedPsCondition.value,
			}));
			const createItems = await createList(
				TABLE.PS_TABLE_CONDITION_DEF,
				items,
				comment,
			);

			// 생성 데이터가 있을 경우, ChangePosition 수행
			if (createItems.length > 0) {
				// 지정된 Index에 생성된 데이터 삽입
				psItems.splice(startIndex, 0, ...createItems);

				// index 기준으로 Position 부여
				psTableConditionRef.value.changePosition(createItems, psItems);
			}
		}

		function openModalDeleteTableCondition() {
			psTableConditionRef.value.openModalDelete();
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
			checkAccessType,

			// PsCondition
			psConditionRef,
			selectPsCondition,
			selectedPsCondition,
			validatePsCondition,

			// PsTable
			psTableRef,
			filteredPsTableList,

			// PsTableCondition
			POSITION,
			psTableConditionRef,
			openModalConfirmTableCondition,
			createTableConditionAtPosition,
			openModalDeleteTableCondition,
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
