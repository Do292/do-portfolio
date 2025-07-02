<template>
	<div class="card">
		<div class="card-body suite-form">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<div class="item-title ml-1">
						<label>
							{{ $t(metaDataId) }}
						</label>
					</div>
					<div class="left-area ml-1">
						<Accordion :panelConfig="panelConfig">
							<template v-slot:item="item">
								<template v-if="checkColumnPrimary(item)">
									<div class="item-input">
										<FormInput
											v-model="orderId"
											:fieldConfig="item"
											@keyup.enter="findOrder"
										/>
									</div>
								</template>
								<template v-else>
									<div class="item-field">
										<Checkbox
											:field="item.field"
											:header="item.headerText"
											:modelValue="item.checked"
											@update:modelValue="
												toggleField(item.field)
											"
										/>
									</div>
									<div class="item-input">
										<FormInput
											ref="inputRef"
											v-model="panelItem[item.field]"
											:fieldConfig="item"
											:hasLabel="false"
											:isDisabled="!item.checked"
											:target="panelItem"
											floatLabelType="Never"
											@click="initGenerator"
											@keyup.enter="nextGenerator"
										/>
									</div>
								</template>
							</template>
						</Accordion>
						<div class="item-box-button">
							<ButtonBasic
								class="btn-con-dblue"
								type="reset"
								@onClick="resetPanelItem"
							>
								Reset
							</ButtonBasic>
							<ButtonBasic
								type="addData"
								@onClick="applyPanelItem"
							>
								Change Data
							</ButtonBasic>
						</div>
					</div>
				</template>

				<template v-slot:right>
					<Grid
						ref="gridRef"
						:checkbox="false"
						:columns="sortedColumns"
						:deleting="true"
						:excelQueryCellInfo="customizeExcel"
						:freezing="true"
						:gridId="gridId"
						:gridItems="orders"
						:gridName="gridId"
						:selecting="false"
						@onQueryCellInfo="customizeCell"
					>
						<template v-slot:header-content>
							<div class="btn-group">
								<ButtonText
									:type="ACTION.APPLY"
									@onClick="openModalConfirmOrder"
								/>
								<ButtonText
									:type="ACTION.CLEAR"
									@onClick="clearOrder"
								/>
							</div>
						</template>
					</Grid>
				</template>
			</Splitter>
		</div>
	</div>
</template>

<script>
import {
	inject,
	readonly,
	ref,
	reactive,
	computed,
	watch,
	watchPostEffect,
	onBeforeMount,
} from "vue";
import { useExecuteData, useItem } from "~/plugins/composables/dataHandler";
import {
	useColumnDef,
	useFieldColumn,
	useFields,
	useCustomQuery,
} from "~/plugins/composables/tableHandler";
import {
	useEventListener,
	useKeyEvent,
	useInputFocusGenerator,
} from "~/plugins/composables/eventHandler";
import { useSpinner } from "~/plugins/composables/uiControl";
import { useCustomization } from "~/plugins/composables/syncfusionHelper";

import * as COMMON from "~/api/common.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import { META } from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "FormModifyOrder",
	props: {
		metaDataId: { type: String },
		menuId: { type: String },
		gridId: { type: String },
		tableId: { type: String },
	},
	setup(props) {
		//==================== Common
		const DELAY = readonly({
			FOCUS: 300,
			INPUT: 100,
		});

		const paneConfigs = [
			{ key: "left", size: 40, min: "250px" },
			{ key: "right", size: 60, min: 50 },
		];

		//==================== Column Config
		const { createItem, deepCloneItems, sortItems, filterItem } = useItem();
		const { metaColumns, fetchMetaColumns } = useColumnDef();
		const { gridColumns, fetchGridColumns } = useColumnDef();
		const {
			checkColumnPrimary,
			checkColumnRequired,
			checkColumnModifiable,
			checkColumnVisible,
		} = useFieldColumn();
		const { initQueryConfig, formatQueryResult } = useCustomQuery();

		// Grid Column
		const sortedColumns = ref([]);

		// Panel Column
		const keyColumns = computed(() =>
			metaColumns.value.filter(checkColumnPrimary),
		);
		const modifyColumns = reactive([]);

		onBeforeMount(async () => {
			await fetchGridColumns(props.menuId, props.gridId);
			await fetchMetaColumns(props.metaDataId);
			initQueryConfig(props.menuId, props.gridId);
			sortedColumns.value = deepCloneItems(gridColumns.value);

			// Modify Column Checked 초기화
			metaColumns.value
				.filter(checkColumnModifiable)
				.filter(checkColumnVisible)
				.forEach(column =>
					modifyColumns.push({ ...column, checked: false }),
				);
		});

		//==================== Input
		const { executeWithSpinner } = useSpinner();
		const { initGenerator, nextGenerator, initAndFocusGenerator } =
			useInputFocusGenerator();
		const inputRef = ref(null);

		// 마지막 Input이 랜더링 확인되면 첫 번째 Input으로 포커싱한다.
		const unwatch = watchPostEffect(() => {
			if (inputRef.value) {
				// 포커싱은 랜더링 후 단 한 번 실행
				focusInputAfterExecute(unwatch);
			}
		});

		/**
		 * @param {Function} callback
		 */
		async function focusInputAfterExecute(callback) {
			await executeWithSpinner(callback);
			// 스피너 끝나고 300ms 후에 포커싱되는 게 자연스러움.
			setTimeout(initAndFocusGenerator, DELAY.FOCUS);
		}

		//==================== Panel
		const panelRef = ref(null);
		const isPanelCollapsed = ref(false);

		// type 별로 field 데이터를 분류한 패널 객체
		const panelConfig = computed(() => ({
			key: keyColumns.value,
			modify: modifyColumns,
		}));

		// Panel 열리면 Input 포커싱
		watch(
			() => isPanelCollapsed.value,
			collapsed => {
				if (!collapsed) {
					setTimeout(initAndFocusGenerator);
				}
			},
		);

		// Panel Item
		const panelItem = ref({});

		/**
		 * Panel의 Item 리셋
		 */
		function resetPanelItem() {
			focusInputAfterExecute(() => {
				orderId.value = "";
				panelItem.value = {};
				modifiedItem.value = {};

				// 그리드 초기화
				orders.value = deepCloneItems(orders.value);

				// Check 해제
				modifyColumns.forEach(field => (field.checked = false));
			});
		}

		/**
		 * 수정된 panelItem 내용을 반영한다.
		 */
		function applyPanelItem() {
			if (!checkedFields.value.length) {
				openModalWarning("modal.create.noData");
				return;
			} else if (!validateEmptyFields(panelItem.value)) {
				return;
			}

			// 데이터 초기화
			orders.value = deepCloneItems(orders.value);

			// ModifiedItem 정의
			executeWithSpinner(() => {
				modifiedItem.value = filterItem(
					panelItem.value,
					checkedFields.value,
				);
			});
		}

		//==================== Field
		const {
			// Field
			fields,
			extractFields,
			findColumnByField,

			// Key
			keyFields,
		} = useFields(metaColumns);

		// checked field만 추출
		const checkedFields = computed(() =>
			extractFields(modifyColumns, field => field.checked),
		);

		/**
		 * 체크 상태 전환
		 * @param {String} field
		 */
		function toggleField(field) {
			const index = modifyColumns.findIndex(
				column => column.field === field,
			);
			const target = modifyColumns[index];

			//체크 전환에 따른 Field 값 초기화
			panelItem.value[field] = "";
			target.checked = !target.checked;

			// input 활성화 되면 자동 포커싱
			if (target.checked) {
				setTimeout(() => {
					const { length } = keyColumns.value;
					initAndFocusGenerator(index + length);
				}, DELAY.INPUT);
			}
		}

		/**
		 * Empty 필드에 대한 검증
		 * @param {Object} target
		 * @return {Boolean}
		 */
		function validateEmptyFields(target) {
			const emptyFieldColumns = checkedFields.value
				.filter(field => !`${target[field] ?? ""}`)
				.map(field => findColumnByField(field));

			//필수일 경우 검증 실패
			if (emptyFieldColumns.some(checkColumnRequired)) {
				openModalWarning("modal.create.requiredKey");
				return false;
			}

			//empty field 안내
			if (emptyFieldColumns.length) {
				openModalInfo("info.emptyData", {
					param: extractFields(emptyFieldColumns),
				});
			}

			return true;
		}

		//==================== Modified Item
		const modifiedItem = ref({}); // Change 버튼 클릭 기점으로 그리드에 반영

		// modified 칼럼 우선 정렬
		watch(modifiedItem, modifiedItem => {
			// field가 수정 대상에 포함되는지 확인
			const checkFieldModified = ({ field }) =>
				modifiedItem[field] !== undefined;

			sortedColumns.value = sortItems(
				deepCloneItems(gridColumns.value),
				checkFieldModified,
			);
		});

		//==================== Grid Custom
		const MODIFY_FIELD = "modify-field";
		const { createBadge, prependIcon } = useCustomization();

		/**
		 * 새로운 값이 있는 경우 엑셀 내부에 화살표로 표기해준다.
		 * @param {Object} config
		 */
		function customizeExcel(config) {
			const newValue = validateNewValue(config);

			if (newValue) {
				config.value += ` -> ${newValue}`;
				config.style = { backColor: "#f9bf9c" };
			}
		}

		/**
		 * 새로운 값이 있는 경우 셀 내부 화살표 표기
		 * @param {Object} event
		 * @param {HTMLTableCellElement} event.cell
		 */
		function customizeCell({ cell, ...config }) {
			const newValue = validateNewValue(config);

			// 빈 값도 Arrow 표기되어야 하므로 null만 체크
			if (newValue !== null) {
				const $span = createBadge(newValue);
				// 화살표 아이콘을 텍스트 노드 이전으로 삽입
				prependIcon($span, "arrow");
				cell.appendChild($span);
				cell.classList.add(MODIFY_FIELD);
			}
		}

		/**
		 * 새로운 값이 있는지 검증 후 반환; modifyField에 해당되지 않으면 null 반환
		 * @param {Object} config
		 * @param {Object} config.data
		 * @param {String} config.column.field
		 * @returns {String|null}
		 */
		function validateNewValue({ data, column: { field } }) {
			const { [field]: newValue } = modifiedItem.value;
			const oldValue = data[field] ?? "";

			// newValue가 undefined이면 수정되지 않은 것.
			if (newValue !== undefined && newValue !== oldValue) {
				return newValue;
			}
			return null;
		}

		//==================== Orders
		const { executeList } = useExecuteData();

		// Modal Injection
		const { isShowModalAlert, openModalWarning, openModalInfo } =
			inject("alert");
		const { openModalConfirmBy } = inject("confirm");

		// Config
		const orders = ref([]);
		const orderId = ref("");
		const isOrderIdValid = ref(true); // Modal 비활성화 후 포커싱위함.

		// Order Key는 하나이다.
		const orderKey = computed(() => keyFields.value[0]);
		const orderConfig = computed(() => ({
			[orderKey.value]: orderId.value,
		}));

		watch(
			() => isShowModalAlert.value,
			isShowModal => {
				// 모달이 닫히고 orderId가 유효하지 않으면
				if (!isShowModal && !isOrderIdValid.value) {
					initAndFocusGenerator(0);
				}
			},
		);

		/**
		 * orderId 기준으로 order를 찾아 추가한다.
		 */
		function findOrder() {
			isOrderIdValid.value = false;

			const isOrderExist = orders.value.find(
				order => order[orderKey.value] === orderId.value,
			);
			if (isOrderExist) {
				openModalWarning("이미 존재하는 Order입니다.");
				return;
			}

			executeWithSpinner(async () => {
				// Custom Query 사용
				const [order] = await formatQueryResult(
					orderConfig.value,
					gridColumns,
				);

				if (!order) {
					openModalWarning("Order Not Found");
					return;
				}

				orderId.value = "";
				orders.value = [...orders.value, order];
				isOrderIdValid.value = true;
			});
		}

		/**
		 * 사용자 확인 후 생성
		 */
		function openModalConfirmOrder() {
			const newOrders = orders.value.map(order =>
				createItem(
					fields.value,
					key => modifiedItem.value[key] ?? order[key],
				),
			);

			openModalConfirmBy(
				ACTION.MODIFY,
				props.gridId,
				orders.value,
				async () => {
					const result = await executeList(() =>
						COMMON.modify(props.tableId, newOrders),
					);

					// 성공한 경우에만 panel 초기화 후 유효 처리
					if (result) {
						clearOrder();
					}
				},
			);
		}

		/**
		 * Detail과 그리드 데이터 초기화
		 */
		function clearOrder() {
			orders.value = [];
			resetPanelItem();
		}

		//==================== Event
		const {
			// Panel
			EVENT,
			KEY,
			keyHandlerWithCtrl,

			// Button
			activateApplyEvent,
			activateUpdateEvent,
			activateResetEvent,
		} = useKeyEvent();

		// F2로 create 수행
		activateApplyEvent(window, openModalConfirmOrder);

		// F3로 changeData
		activateUpdateEvent(window, applyPanelItem);

		// ESC키로 리셋
		activateResetEvent(window, resetPanelItem);

		// Ctrl + I Panel 토글
		const panelToggler = keyHandlerWithCtrl(
			KEY.INFO,
			() => (isPanelCollapsed.value = !isPanelCollapsed.value),
		);
		useEventListener(window, EVENT.KEY_DOWN, panelToggler);

		return {
			paneConfigs,

			// Config
			META,
			ACTION,
			metaColumns,
			sortedColumns,
			checkColumnPrimary,

			// Panel
			panelRef,
			panelConfig,
			isPanelCollapsed,

			// Panel Item
			panelItem,
			resetPanelItem,
			applyPanelItem,

			// Field
			toggleField,

			// Input
			inputRef,
			initGenerator,
			nextGenerator,

			// Order Config
			orderId,

			// Grid Custom
			customizeExcel,
			customizeCell,

			// Order
			orders,
			findOrder,
			clearOrder,
			openModalConfirmOrder,
		};
	},
};
</script>
<style scoped>
/* Modify Field */
:deep(.modify-field) {
	padding-right: 14px !important;
}
:deep(.modify-field span) {
	font-weight: 500;
	color: #f96103 !important;
}
:deep(.modify-field i) {
	margin: 0px 5px;
	transform: translateY(1px);
	color: black !important;
}

:deep(.input-field-box .e-control-wrapper) {
	width: 100% !important;
}
</style>
