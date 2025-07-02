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
								@onClick="resetData"
							>
								Reset
							</ButtonBasic>
						</div>
					</div>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="woGridRef"
						:customItems="workorders"
						:gridId="woGridId"
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
						:gridId="gridId"
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
	useFields,
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

import {
	COLUMN_TYPE,
	UPPER_ID,
	CAMEL_ID,
} from "~/constants/common_constants.js";
import { INPUT_TYPE, USER } from "~/plugins/wfb-constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import { WORK_ORDER, LOT } from "~/system/mes/constants/mes_meta_constants.js";
import { useSystem } from "~/plugins/composables/authority.js";
import { useUserInfo } from "~/plugins/composables/authority";
import * as MES_COMMON from "~/system/mes/api/mes-common";

export default {
	name: "ReleaseWorkOrderForLotForm",
	components: {},
	props: {
		action: { type: String },
		gridId: { type: String },
		menuId: { type: String },
		metaDataId: { type: String },
		orderKey: { type: String },
		woGridId: { type: String },
	},

	setup(props) {
		const { fetchList } = useFetchData();
		const { executeList } = useExecuteData();

		const { checkColumnPrimary } = useFieldColumn();
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const {
			ID,
			metaColumns,
			gridColumns,
			//fetchGridColumns,
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

		const items = ref([]);

		const paneConfigs = [
			{ key: "left", size: 40, min: "250px" },
			{ key: "right", size: 60, min: 50 },
		];

		// Panel
		const { groupByItems } = useItem();
		const panelRef = ref(null);
		const isPanelCollapsed = ref(false);

		// Grid Column
		const woGridColumns = ref([]);
		const sortedColumns = ref([]);
		const panelItem = ref({});

		const lots = ref([]);
		const workorders = ref([]);

		const fucusedInput = ref("");

		const { userInfo } = useUserInfo();
		const userId = userInfo.value[USER.ID];

		const workOrderQuery = ref({
			[CAMEL_ID.QUERY_ID]: "WorkorderInfo",
			[CAMEL_ID.QUERY_VERSION]: "000001",
		});

		const lotQuery = ref({
			[CAMEL_ID.QUERY_ID]: "ReleaseWorkOrderLotList",
			[CAMEL_ID.QUERY_VERSION]: "000001",
		});

		const horizontalConfigs = [
			{ key: "left", size: 30, min: "600px" },
			{ key: "right", size: 70, min: "600px" },
		];

		const verticalConfigs = [
			{ key: "top", size: 30 },
			{ key: "bottom", size: 70 },
		];

		// Config
		const isOrderIdValid = ref(true); // Modal 비활성화 후 포커싱위함.

		/**
		 * InputType이 never인 경우 비활성화
		 * @param {Object} column
		 */
		function checkColumnDisabled(column) {
			return column[ID.INPUT_TYPE] === INPUT_TYPE.NEVER;
		}

		onBeforeMount(async () => {
			await fetchMetaColumns(props.metaDataId);
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
			isOrderIdValid.value = false;

			const parameters = {
				[item.field]: panelItem.value[item.field],
			};

			executeWithSpinner(async () => {
				var searchCondition = { ...workOrderQuery.value, parameters };
				let condition = { searchCondition };

				const [woQueryItem] = await fetchList(() =>
					getByCustomQuery(condition),
				);

				if (!woQueryItem) {
					openModalWarning("Item Not Found");
					clear();
					return;
				}

				// WorkOrder DataBinding
				workorders.value = [];
				workorders.value = [...workorders.value, woQueryItem];

				// Lot Search
				searchCondition = { ...lotQuery.value, parameters };
				condition = { searchCondition };

				const lotData = await fetchList(() =>
					getByCustomQuery(condition),
				);

				// Lot Data Binding
				lots.value = [];
				lots.value = [...lotData];
				isOrderIdValid.value = true;
			});
		}

		/**
		 * 사용자 확인 후 생성
		 */
		function openModalConfirm() {
			const id = toCamelCase(props.woGridId);
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
			workorders.value = [];
			lots.value = [];
			panelItem.value = [];
		}

		return {
			// Config
			ACTION,

			fetchList,
			executeList,

			woGridColumns,
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
			// applyData,

			workorders,
			lots,

			items,

			checkColumnVisible,
			useFieldColumn,
			useFields,
			useCustomQuery,
			getByCustomQuery,

			useSetDefaults,
			useItem,

			isShowInformation,
			infoConfig,
			setInformation,

			lotQuery,

			horizontalConfigs,
			verticalConfigs,

			getInformation,

			openModalWarning,

			initQueryConfig,
			formatQueryResult,

			WORK_ORDER,
			LOT,

			UPPER_ID,
			CAMEL_ID,

			useSystem,
			fucusedInput,

			openModalConfirm,

			clear,
		};
	},
};
</script>

<style scoped>
:deep(#right-pane .e-gridcontent) {
	height: calc(50vh - 203px) !important;
}
</style>
