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
								<div class="item-input">
									<FormInput
										ref="inputRef"
										v-model="panelItem[item.field]"
										:fieldConfig="item"
										:isDisabled="checkColumnDisabled(item)"
										:target="panelItem"
										@click="initGenerator"
										@keyup.enter="nextGenerator"
									/>
								</div>
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
								Add Data
							</ButtonBasic>
						</div>
					</div></template
				>
				<template v-slot:right>
					<FormGrid
						ref="gridRef"
						:checkbox="false"
						:customItems="orders"
						:deleting="true"
						:gridId="gridId"
						:menuId="menuId"
						:metaDataId="metaDataId"
					>
						<template v-slot:grid-button>
							<div class="btn-group">
								<ButtonText
									:type="ACTION.APPLY"
									@onClick="openModalConfirmOrder"
								/>
								<ButtonText
									:type="ACTION.CLEAR"
									@onClick="clearOrder"
								/></div
						></template>
					</FormGrid>
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
	computed,
	watch,
	watchPostEffect,
	onBeforeMount,
} from "vue";
import { useItem, useExecuteData } from "~/plugins/composables/dataHandler";
import {
	useColumnDef,
	useFieldColumn,
	useFields,
	useSetDefaults,
} from "~/plugins/composables/tableHandler";
import {
	useEventListener,
	useKeyEvent,
	useInputFocusGenerator,
} from "~/plugins/composables/eventHandler";
import { useSpinner } from "~/plugins/composables/uiControl";

import * as COMMON from "~/api/common.js";
import { COLUMN_TYPE } from "~/constants/common_constants.js";
import { ACTION, INPUT_TYPE } from "~/plugins/wfb-constants.js";
import { META } from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "FormCreateOrder",
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
		});

		// Modal Injection
		const { openModalConfirmBy } = inject("confirm");
		const { isShowModalAlert, openModalWarning } = inject("alert");

		const paneConfigs = [
			{ key: "left", size: 40, min: "250px" },
			{ key: "right", size: 60, min: 50 },
		];

		//==================== Column Config
		const { ID, metaColumns, fetchMetaColumns } = useColumnDef();
		const { gridColumns, fetchGridColumns } = useColumnDef();
		const { checkColumnVisible } = useFieldColumn();
		const { setDefaults } = useSetDefaults();

		/**
		 * InputType이 never인 경우 비활성화
		 * @param {Object} column
		 */
		function checkColumnDisabled(column) {
			return column[ID.INPUT_TYPE] === INPUT_TYPE.NEVER;
		}

		onBeforeMount(async () => {
			await fetchGridColumns(props.menuId, props.gridId);
			await fetchMetaColumns(props.metaDataId);
		});

		//==================== Panel
		const { groupByItems } = useItem();
		const panelRef = ref(null);
		const isPanelCollapsed = ref(false);

		// type 별로 field 데이터를 분류한 패널 객체
		const panelConfig = computed(() =>
			groupByItems(
				ID.COLUMN_TYPE,
				metaColumns.value.filter(checkColumnVisible),
				COLUMN_TYPE.STANDARD,
			),
		);

		// Panel default값 셋팅(MetaDetailId 기준)
		watch(
			() => panelConfig.value,
			newValue => setDefaultValue(newValue, panelItem),
		);
		function setDefaultValue(newValue, panelItem) {
			const defaultItem = setDefaults(newValue);
			Object.keys(defaultItem).forEach(key => {
				defaultItem[key].forEach(item => {
					panelItem.value[item.field] = item.defaultValue;
				});
			});
		}

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
				panelItem.value = {};
			});
			setDefaultValue(panelConfig.value, panelItem);
		}

		/**
		 * 그리드에 데이터 추가
		 */
		function applyPanelItem() {
			if (!validateEmptyFields(panelItem.value)) {
				return;
			} else if (!validateDuplicates(panelItem.value)) {
				return;
			}

			orders.value = [...orders.value, panelItem.value];
			resetPanelItem();
		}

		//==================== Field
		const { checkColumnRequired } = useFieldColumn();
		const { compareKeyField } = useFields(metaColumns);

		/**
		 * Empty 필드에 대한 검증
		 * @param {Object} target
		 * @return {Boolean}
		 */
		function validateEmptyFields(target) {
			const emptyColumns = metaColumns.value.filter(
				({ field }) => !`${target[field] ?? ""}`,
			);

			//필수일 경우 검증 실패
			if (emptyColumns.some(checkColumnRequired)) {
				openModalWarning("modal.create.requiredKey");
				return false;
			}

			return true;
		}

		/**
		 * 중복 데이터에 대한 검증
		 * @param {Object} newItem 새로운 아이템
		 * @param {Object[]} items 비교할 아이템 배열
		 * @return {Boolean}
		 */
		function validateDuplicates(newItem, items = orders.value) {
			for (const item of items) {
				//pk field만 비교
				if (compareKeyField(item, newItem)) {
					openModalWarning("modal.create.existData");
					return false;
				}
			}
			return true;
		}

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

		// 모달이 닫히면 첫 번째 Input으로 포커스 이동
		watch(
			() => isShowModalAlert.value,
			isShowModal => {
				if (!isShowModal) {
					initAndFocusGenerator(0);
				}
			},
		);

		/**
		 * @param {Function} callback
		 */
		async function focusInputAfterExecute(callback) {
			await executeWithSpinner(callback);
			// 스피너 끝나고 300ms 후에 포커싱되는 게 자연스러움.
			setTimeout(initAndFocusGenerator, DELAY.FOCUS);
		}

		//==================== Orders
		const { executeList } = useExecuteData();
		const orders = ref([]);

		/**
		 * 사용자 확인 후 생성
		 */
		function openModalConfirmOrder() {
			openModalConfirmBy(
				ACTION.CREATE,
				props.gridId,
				orders.value,
				async () => {
					const result = await executeList(() =>
						COMMON.create(props.tableId, orders.value),
					);

					// 성공한 경우에만 panel 초기화
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

		// F3로 addData
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
			gridColumns,
			metaColumns,
			checkColumnDisabled,

			// Panel
			panelRef,
			panelConfig,
			isPanelCollapsed,

			// PanelItem
			panelItem,
			applyPanelItem,
			resetPanelItem,

			// Input
			inputRef,
			initGenerator,
			nextGenerator,

			// Order
			orders,
			clearOrder,
			openModalConfirmOrder,
		};
	},
};
</script>
<style scoped>
:deep(.search-field button) {
	margin-top: 20px !important;
}
</style>
