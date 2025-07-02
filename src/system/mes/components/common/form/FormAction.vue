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
									<div class="item-input">
										<FormInput
											ref="inputRef"
											v-model="panelItem[item.field]"
											:fieldConfig="item"
											:isDisabled="
												checkColumnDisabled(item)
											"
											:target="panelItem"
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
								@onClick="resetData"
							>
								Reset
							</ButtonBasic>
						</div>
					</div>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="gridRef"
						:checkbox="false"
						:customItems="items"
						:deleting="true"
						:gridId="gridId"
						:menuId="menuId"
						:metaDataId="metaDataId"
						:selecting="false"
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
								/>
							</div>
						</template>
					</FormGrid>
				</template>
			</Splitter>
		</div>
	</div>
</template>

<script>
import {
	readonly,
	ref,
	computed,
	watch,
	watchPostEffect,
	onBeforeMount,
} from "vue";
import { useExecuteData, useItem } from "~/plugins/composables/dataHandler";
import { useUserInfo } from "~/plugins/composables/authority";
import {
	useColumnDef,
	useFieldColumn,
	useCustomQuery,
	useFields,
} from "~/plugins/composables/tableHandler";
import { useInputFocusGenerator } from "~/plugins/composables/eventHandler";
import {
	useModalConfirm,
	useModalAlert,
} from "~/plugins/composables/modalHandler";
import { useSpinner } from "~/plugins/composables/uiControl";

import * as MES_COMMON from "~/system/mes/api/mes-common";
import { COLUMN_TYPE } from "~/constants/common_constants.js";
import { INPUT_TYPE, USER } from "~/plugins/wfb-constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import { META } from "~/system/mes/constants/mes_meta_constants.js";
// import { checkValidation } from "~/system/mes/plugins/mes-actionHandeler.js";

export default {
	name: "FormAction",
	props: {
		isModal: { type: Boolean, default: false },
		metaDataId: { type: String },
		menuId: { type: String },
		gridId: { type: String },
		orderKey: { type: String },
		action: { type: String },
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
		const { groupByItems } = useItem();
		const {
			ID,
			metaColumns,
			fetchMetaColumns,
			// gridColumns,
			// fetchGridColumns,
		} = useColumnDef();
		const { userInfo } = useUserInfo();
		const userId = userInfo.value[USER.ID];
		const gridRef = ref(null);
		const gridColumnList = computed(() => gridRef.value?.gridColumns);

		const { checkColumnPrimary, checkColumnVisible } = useFieldColumn();
		const { initQueryConfig, formatQueryResult } = useCustomQuery();
		// const { validateAction } = checkValidation();

		//==================== Field
		const { keyFields } = useFields(metaColumns);

		/**
		 * InputType이 never인 경우 비활성화
		 * @param {Object} column
		 */
		function checkColumnDisabled(column) {
			return column[ID.INPUT_TYPE] === INPUT_TYPE.NEVER;
		}

		// Panel Column
		onBeforeMount(async () => {
			// await fetchGridColumns(props.menuId, props.gridId);
			await fetchMetaColumns(props.metaDataId);
			initQueryConfig(props.menuId, props.gridId);
		});

		//==================== Input
		const { executeWithSpinner } = useSpinner();
		const { initGenerator, nextGenerator, initAndFocusGenerator } =
			useInputFocusGenerator();
		const inputRef = ref(null);

		/* 마지막 Input이 랜더링 확인되면 첫 번째 Input으로 포커싱한다. */
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
		const panelConfig = computed(() =>
			groupByItems(
				ID.COLUMN_TYPE,
				metaColumns.value.filter(checkColumnVisible),
				COLUMN_TYPE.STANDARD,
			),
		);

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

		//==================== Items
		const { executeList } = useExecuteData();
		const { isShowModalAlert, openModalWarning } = useModalAlert();
		const { openModalConfirmBy } = useModalConfirm();
		const items = ref([]);

		// Config
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

			const gridData = gridRef.value.gridItems;
			const isOrderExist = gridData.find(
				order => order[orderKey.value] === orderId.value,
			);
			if (isOrderExist) {
				openModalWarning("이미 존재하는 Data입니다.");
				return;
			}

			executeWithSpinner(async () => {
				// Custom Query 사용
				const [item] = await formatQueryResult(
					orderConfig.value,
					gridColumnList,
				);

				if (!item) {
					openModalWarning("Item Not Found");
					return;
				}

				// if (!validateAction(item, props.action)) return;

				orderId.value = "";
				items.value = [];
				items.value = [...gridData, item];
				isOrderIdValid.value = true;
			});
		}
		/**
		 * panelConfig에서 category가 parameter인 부분을 반환
		 */
		// function getParameters() {
		// 	return panelConfig.value[COLUMN_TYPE.PARAMETER]
		// 		? Object.keys(panelItem.value).reduce((filteredObject, key) => {
		// 				if (
		// 					panelConfig.value[COLUMN_TYPE.PARAMETER].some(
		// 						obj => obj.field === key,
		// 					)
		// 				) {
		// 					filteredObject[key] = panelItem.value[key];
		// 				}
		// 				return filteredObject;
		// 		  }, {})
		// 		: {};
		// }

		/**
		 * 사용자 확인 후 생성
		 */
		function openModalConfirmOrder() {
			const id = toCamelCase(props.gridId);
			items.value.forEach(i => {
				i.eventUser = userId;
				Object.assign(i, panelItem.value);
			});

			openModalConfirmBy(
				props.action,
				props.metaDataId,
				items.value,
				async () => {
					const result = await executeList(() =>
						MES_COMMON.doAction(id, [props.action], items.value),
					);

					// 성공한 경우에만 panel 초기화 후 유효 처리
					if (result) {
						clearOrder();
						panelItem.value = [];
					}
				},
			);
		}
		function toCamelCase(str) {
			return str.charAt(0).toLowerCase() + str.slice(1);
		}

		/**
		 * Detail과 그리드 데이터 초기화
		 */
		function clearOrder() {
			items.value = [];
		}

		/**
		 * orgItem 값을 newItem에 할당
		 */
		function resetData() {
			executeWithSpinner(() => {
				panelItem.value = [];
			});
		}

		return {
			paneConfigs,
			// Config
			META,
			ACTION,
			metaColumns,
			gridRef,
			gridColumnList,
			checkColumnPrimary,
			checkColumnDisabled,

			// Panel
			panelRef,
			panelConfig,
			isPanelCollapsed,

			// Panel Item
			panelItem,
			resetData,

			// Input
			inputRef,
			initGenerator,
			nextGenerator,

			// Item Config
			orderId,

			// Item
			items,
			findOrder,
			clearOrder,
			openModalConfirmOrder,
		};
	},
};
</script>
<style scoped>
.modal-body {
	display: flex;
	width: 100%;
	height: 100%;
}
.modal-body .modal-left {
	position: relative;
	margin-top: 43px;
}
.modal-body .modal-right {
	flex-grow: 1;
	position: relative;
}
.modal-body .modal-right .grid-form {
	width: 50vw;
}
.modal-body .modal-panel {
	position: relative;
	width: calc(50vw - 150px);
	height: calc(100vh - 293px);
	overflow: hidden;
}
</style>
