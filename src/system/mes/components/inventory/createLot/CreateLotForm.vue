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
											ref="inputRef"
											v-model="panelItem[item.field]"
											:fieldConfig="item"
											@keyup.enter="getInformation(item)"
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
								@click="resetData"
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
					</div>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="prodGridRef"
						:customItems="products"
						:gridId="prodGridId"
						:menuId="menuId"
						:metaDataId="metaDataId"
					>
						<template v-slot:default-grid-button>
							<div class="btn-group">
								<ButtonText
									:type="ACTION.APPLY"
									@onClick="openModalConfirm"
								/>
								<ButtonText
									:type="ACTION.CLEAR"
									@onClick="clear"
								/>
							</div>
						</template>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</FormGrid>
					<FormGrid
						ref="lotGridRef"
						:checkbox="true"
						:customItems="lots"
						:gridId="lotGridId"
						:menuId="menuId"
						:metaDataId="metaDataId"
					>
						<template v-slot:default-grid-button>
							<div></div>
						</template>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</FormGrid>
				</template>
			</Splitter>
		</div>
	</div>
</template>

<script>
import { ref, computed, watch, onBeforeMount } from "vue";

import {
	useColumnDef,
	useFieldColumn,
	useSetDefaults,
	useCustomQuery,
} from "~/plugins/composables/tableHandler";

import { getByCustomQuery } from "~/api/system-common.js";

import { useInputFocusGenerator } from "~/plugins/composables/eventHandler";
import {
	useModalAlert,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";

import {
	useItem,
	useFetchData,
	useExecuteData,
} from "~/plugins/composables/dataHandler";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useSpinner } from "~/plugins/composables/uiControl";

import { COLUMN_TYPE } from "~/constants/common_constants.js";
import { ACTION, INPUT_TYPE, USER } from "~/plugins/wfb-constants.js";

import { useUserInfo } from "~/plugins/composables/authority";
import * as MES_COMMON from "~/system/mes/api/mes-common";
import { LOT, PRODUCT } from "../../../constants/mes_meta_constants";

export default {
	name: "CreateLotForm",
	components: {},
	props: {
		menuId: { type: String },
		prodGridId: { type: String },
		lotGridId: { type: String },
		tableId: { type: String },
		metaDataId: { type: String },
	},

	setup(props) {
		const DELAY = { FOCUS: 300 };
		const { fetchList } = useFetchData();
		const { executeList } = useExecuteData();

		const { checkColumnPrimary } = useFieldColumn();

		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const {
			ID,
			metaColumns,
			gridColumns,
			// fetchGridColumns,
			fetchMetaColumns,
		} = useColumnDef();
		const { checkColumnVisible } = useFieldColumn();
		const { setDefaults } = useSetDefaults();
		const { executeWithSpinner } = useSpinner();
		const { initGenerator, nextGenerator, initAndFocusGenerator } =
			useInputFocusGenerator();

		const { openModalWarning } = useModalAlert();
		const { initQueryConfig, formatQueryResult } = useCustomQuery();
		const { openModalConfirmBy } = useModalConfirm();

		const paneConfigs = [
			{ key: "left", size: 40, min: "250px" },
			{ key: "right", size: 60, min: 50 },
		];

		// Panel
		const { groupByItems } = useItem();
		const panelRef = ref(null);
		const isPanelCollapsed = ref(false);

		// Grid Column
		const prodGridColumns = ref([]);
		const sortedColumns = ref([]);
		const panelItem = ref({});
		const lots = ref([]);
		const products = ref([]);

		const { userInfo } = useUserInfo();
		const userId = userInfo.value[USER.ID];

		const horizontalConfigs = [
			{ key: "left", size: 30, min: "600px" },
			{ key: "right", size: 70, min: "600px" },
		];

		const verticalConfigs = [
			{ key: "top", size: 30 },
			{ key: "bottom", size: 70 },
		];

		// Config
		const isValid = ref(true); // Modal 비활성화 후 포커싱위함.

		// const { keyFields } = useFields(metaColumns);

		const queryInfos = ref({});

		/**
		 * InputType이 never인 경우 비활성화
		 * @param {Object} column
		 */
		function checkColumnDisabled(column) {
			return column[ID.INPUT_TYPE] === INPUT_TYPE.NEVER;
		}

		onBeforeMount(async () => {
			/*
			//Product
			await fetchGridColumns(props.menuId, props.prodGridId);

			// gridColumn -> prodGridColumns 로 데이터를 옮긴다.
			prodGridColumns.value = JSON.parse(
				JSON.stringify(gridColumns.value),
			);

			// Lot
			await fetchGridColumns(props.menuId, props.lotGridId);
			*/
			await fetchMetaColumns(props.metaDataId);

			queryInfos[PRODUCT.ID] = initQueryConfig(
				props.menuId,
				props.prodGridId,
			);

			queryInfos[LOT.ID] = initQueryConfig(props.menuId, props.lotGridId);
		});

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

		/**
		 * orgItem 값을 newItem에 할당
		 */
		function resetData() {
			executeWithSpinner(() => {
				panelItem.value = [];
			});
		}

		/**
		 * 정보를 조회한다.
		 */
		function getInformation(item) {
			isValid.value = false;

			const isExist = ref(false);
			const isLot = ref(false);
			const parameters = {
				[item.field]: panelItem.value[item.field],
			};

			if (LOT.ID == item.field) {
				// Lot Field 확인
				isExist.value = lots?.value.find(
					lot => lot[LOT.ID] == panelItem.value[item.field],
				);

				isLot.value = true;
			} else if (PRODUCT.ID == item.field) {
				// Workorder Field 확인
				isExist.value = products?.value.find(
					product =>
						product[PRODUCT.ID] == panelItem.value[item.field],
				);
			}

			if (isExist.value) {
				openModalWarning("이미 존재하는 Data입니다.");
				return;
			}

			executeWithSpinner(async () => {
				const queryInfo = await queryInfos[item.field];
				const searchCondition = { ...queryInfo, parameters };

				let condition = { searchCondition };

				// 커스텀 쿼리 조회
				const [queryItem] = await fetchList(() =>
					getByCustomQuery(condition),
				);

				if (!queryItem) {
					openModalWarning("Item Not Found");
					return;
				}

				// if (!validateAction(item, props.action)) return;

				if (isLot.value) {
					// Lot Data Binding
					lots.value = [];
					lots.value = [...lots.value, queryItem];
				} else {
					// WorkOrder DataBinding
					products.value = [];
					products.value = [...products.value, queryItem];
				}

				isValid.value = true;
			});
		}

		/**
		 * 사용자 확인 후 생성
		 */
		function openModalConfirm() {
			const id = toCamelCase(props.gridId);
			lots.value.forEach(i => {
				i.eventUser = userId;
				Object.assign(i, panelItem.value);
			});

			openModalConfirmBy(
				props.action,
				props.metaDataId,
				lots.value,
				async () => {
					const result = await executeList(() =>
						MES_COMMON.doAction(id, [props.action], lots.value),
					);

					// 성공한 경우에만 panel 초기화 후 유효 처리
					if (result) {
						clear();
					}
				},
			);
		}

		function toCamelCase(str) {
			return str.charAt(0).toLowerCase() + str.slice(1);
		}

		/**
		 * 초기화.
		 */
		function clear() {
			products.value = [];
			lots.value = [];
			panelItem.value = [];
		}

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
			lots.value = [...lots.value, panelItem.value];
			resetPanelItem();
		}

		/**
		 * @param {Function} callback
		 */
		async function focusInputAfterExecute(callback) {
			await executeWithSpinner(callback);
			// 스피너 끝나고 300ms 후에 포커싱되는 게 자연스러움.
			setTimeout(initAndFocusGenerator, DELAY.FOCUS);
		}

		return {
			// Config
			ACTION,
			prodGridColumns,
			gridColumns,
			metaColumns,
			sortedColumns,
			checkColumnPrimary,
			checkColumnDisabled,

			initGenerator,
			nextGenerator,
			initAndFocusGenerator,

			paneConfigs,

			// Panel
			panelRef,
			panelConfig,
			isPanelCollapsed,

			// Panel Item
			panelItem,
			resetData,

			products,
			lots,

			checkColumnVisible,
			useFieldColumn,

			useSetDefaults,
			useItem,

			isShowInformation,
			infoConfig,
			setInformation,

			horizontalConfigs,
			verticalConfigs,

			fetchList,
			executeList,

			getInformation,

			useCustomQuery,

			getByCustomQuery,
			openModalWarning,
			openModalConfirm,

			initQueryConfig,
			formatQueryResult,

			clear,

			applyPanelItem,
			focusInputAfterExecute,
		};
	},
};
</script>

<style scoped>
:deep(#right-pane .e-gridcontent) {
	height: calc(50vh - 203px) !important;
}
</style>
