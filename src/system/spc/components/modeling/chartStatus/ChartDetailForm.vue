<template>
	<div>
		<ModalRuleSearch
			v-if="isShowModalSearch"
			:condition="modalCondition"
			:currentRuleItems="ruleAlarmItems"
			:menuId="'ChartStatus'"
			@apply="applyRule"
			@close="isShowModalSearch = false"
		/>
		<div class="row">
			<div class="col-12 item-title">
				<label>Chart Def</label>
			</div>
			<div class="col-12">
				<!-- <div
					v-for="field in chartDefKeyList"
					:key="field"
					class="d-table-row"
				>
					<div class="d-table-cell">
						{{ field + " : " + chartDef[field] }}
					</div>
				</div> -->

				<div class="d-table-row">
					<div class="d-table-cell">Group Id :</div>
					<div class="d-table-cell input">
						{{ chartDef["chartConditionGroupId"] }}
					</div>
					<div class="d-table-cell">Group Name :</div>
					<div class="d-table-cell input">
						{{ chartDef["chartConditionGroupName"] }}
					</div>
					<div class="d-table-cell">Chart ID :</div>
					<div class="d-table-cell input">
						{{ chartDef["chartId"] }}
					</div>
					<div class="d-table-cell">Chart Def Name :</div>
					<div class="d-table-cell input">
						{{ chartDef["chartDefName"] }}
					</div>
					<div class="d-table-cell">Item Name :</div>
					<div class="d-table-cell input">
						{{ chartDef["itemName"] }}
					</div>
				</div>
				<div class="d-table-row">
					<div class="d-table-cell">Unit Of Data :</div>
					<div class="d-table-cell input">
						{{ chartDef["unitOfData"] }}
					</div>
					<div class="d-table-cell">Min Scale :</div>
					<div class="d-table-cell input">
						{{ chartDef["minScale"] }}
					</div>
					<div class="d-table-cell">Max Scale :</div>
					<div class="d-table-cell input">
						{{ chartDef["maxScale"] }}
					</div>
					<div class="d-table-cell">Decimal Place :</div>
					<div class="d-table-cell input">
						{{ chartDef["decimalPlace"] }}
					</div>

					<div class="d-table-cell">Chart Owner :</div>
					<div class="d-table-cell input">
						{{ chartDef["chartOwner"] }}
					</div>
					<div class="d-table-cell">Department :</div>
					<div class="d-table-cell input">
						{{ chartDef["department"] }}
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-7 item-title">
				<label>Control Chart [{{ CCType }}] </label>
			</div>
			<div class="col-5 text-right mt-2">
				<div class="item-box">
					<ButtonBasic :type="ACTION.RESET" @onClick="reset" />
					<ButtonBasic :type="ACTION.SAVE" @onClick="openModal" />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-3">
				<div v-if="CCType == 'Count'">
					<div
						v-for="({ enumValue }, idx) in chartNameList[CCType]"
						:key="idx + '_' + CCType"
						class="d-table-cell ml-2"
					>
						<wfl-radiobutton
							:id="'radio_modify_' + enumValue"
							:checked="getCheckboxValue(enumValue)"
							:label="enumValue"
							:name="'countRadio'"
							@click="countItemClicked(enumValue)"
						>
						</wfl-radiobutton>
					</div>
				</div>
				<div v-else>
					<div
						v-for="({ enumValue }, idx) in chartNameList[CCType]"
						:key="idx + '_' + CCType"
						class="d-table-cell ml-2"
					>
						<Checkbox
							:disabled="idx == 0 ? true : false"
							:field="enumValue"
							:header="enumValue"
							:modelValue="getCheckboxValue(enumValue)"
							@update:modelValue="
								checkboxClicked($event, enumValue)
							"
						/>
					</div>
				</div>
			</div>
			<div class="col-9 d-table-item">
				<div class="d-table-row">
					<div class="d-table-cell">Active State :</div>
					<div class="d-table-cell input">
						{{ controlChartDef["activeState"] }}
					</div>
					<div class="d-table-cell">C-Sigma :</div>
					<div class="d-table-cell input">
						{{ controlChartDef["sigma"] }}
					</div>
					<div class="d-table-cell">Spec Check Flag :</div>
					<div class="d-table-cell input">
						{{ controlChartDef["specCheckFlag"] }}
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-7">
				<div class="row">
					<div class="col-12 item-title">
						<label>Spec Limit</label>
					</div>
					<div class="col-12">
						<div
							v-for="(data, index) of specLimit"
							:key="index + '_spec_' + data.name"
							class="d-table-item"
						>
							<div v-if="index == 0" class="d-table-row">
								<div class="d-table-cell"></div>
								<div class="d-table-cell">Upper Spec Limit</div>
								<div class="d-table-cell">Lower Spec Limit</div>
								<div class="d-table-cell">Target</div>
								<div class="d-table-cell">AlarmId</div>
							</div>
							<div class="d-table-row">
								<div
									class="d-table-cell"
									style="width: 30px !important"
								>
									{{ data.name }}
								</div>

								<div
									v-for="field of data.fieldList"
									:key="'spec_' + field"
									class="d-table-cell input"
								>
									<DropDownList
										v-if="field === 'alarmId'"
										:id="'spec_' + data.name + field"
										:customFields="[
											'AlarmId',
											'Description',
										]"
										:customItems="alarmComboSource"
										:modelValue="
											specLimitMap[data.name][field]
										"
									></DropDownList>
									<Numericbox
										v-else
										:id="'spec_' + data.name + field"
										:modelValue="
											specLimitMap[data.name][field]
										"
										:showSpinButton="false"
										@update:modelValue="
											specLimitMap[data.name][field] =
												$event
										"
									></Numericbox>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-12 item-title">
						<label>Control Limit</label>
					</div>
					<div class="col-12">
						<div
							v-for="(data, index) of controlLimit"
							:key="index + '_control_' + data.name"
							class="d-table-item"
						>
							<div v-if="index == 0" class="d-table-row">
								<div class="d-table-cell"></div>
								<div class="d-table-cell">
									Upper Control Limit
								</div>
								<div class="d-table-cell">
									Lower Control Limit
								</div>
								<div class="d-table-cell">CenterLine</div>
								<div class="d-table-cell">AlarmId</div>
							</div>
							<div class="d-table-row">
								<div
									class="d-table-cell"
									style="width: 30px !important"
								>
									{{ data.name }}
								</div>

								<div
									v-for="field of data.fieldList"
									:key="'control_' + field"
									class="d-table-cell input"
								>
									<DropDownList
										v-if="field === 'alarmId'"
										:id="'control_' + data.name + field"
										:customFields="[
											'AlarmId',
											'Description',
										]"
										:customItems="alarmComboSource"
										:modelValue="
											controlLimitMap[data.name][field]
										"
									></DropDownList>
									<Numericbox
										v-else
										:id="'control_' + data.name + field"
										:modelValue="
											controlLimitMap[data.name][field]
										"
										:showSpinButton="false"
										@update:modelValue="
											controlLimitMap[data.name][field] =
												$event
										"
									></Numericbox>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-12 item-title">
						<label>Custom Limit</label>
					</div>
					<div class="col-12">
						<div
							v-for="(data, index) of customLimit"
							:key="index + '_custom_' + data.name"
							class="d-table-item"
						>
							<div v-if="index == 0" class="d-table-row">
								<div class="d-table-cell"></div>
								<div class="d-table-cell">
									Upper Custom Limit
								</div>
								<div class="d-table-cell">
									Lower Custom Limit
								</div>
								<div class="d-table-cell">CenterLine</div>
								<div class="d-table-cell">AlarmId</div>
							</div>
							<div class="d-table-row">
								<div
									class="d-table-cell"
									style="width: 30px !important"
								>
									{{ data.name }}
								</div>

								<div
									v-for="field of data.fieldList"
									:key="'custom_' + field"
									class="d-table-cell input"
								>
									<DropDownList
										v-if="field === 'alarmId'"
										:id="'custom_' + data.name + field"
										:customFields="[
											'AlarmId',
											'Description',
										]"
										:customItems="alarmComboSource"
										:modelValue="
											customLimitMap[data.name][field]
										"
									></DropDownList>
									<Numericbox
										v-else
										:id="'custom_' + data.name + field"
										:modelValue="
											customLimitMap[data.name][field]
										"
										:showSpinButton="false"
										@update:modelValue="
											customLimitMap[data.name][field] =
												$event
										"
									></Numericbox>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-5">
				<FormGrid
					ref="ruleAlarmGrid"
					:checkbox="false"
					:condition="{ chartId }"
					:customApi="CHART.getChartRule"
					:exporting="false"
					:gridId="'ChartRuleAlarm'"
					:gridTitle="'Rule Alarm'"
					:initSearch="false"
					:isUsePath="false"
					:menuId="'ChartStatus'"
					:paging="false"
				>
					<template v-slot:grid-button>
						<ButtonBasic type="search" @onClick="openModalSearch" />
					</template>
				</FormGrid>
			</div>
		</div>
	</div>
</template>
<script>
import { ref, watch, computed, onMounted } from "vue";
import * as CHART from "#/spc/api/chart.js";
import { ACTION } from "~/plugins/wfb-constants.js";
import * as COMMON from "~/api/system-common";
import { useControlChart } from "#/spc/plugins/composables/dataHandler.js";
import ModalRuleSearch from "./form/ModalRuleSearch.vue";
import { useModalConfirm } from "~/plugins/composables/modalHandler";
import { useUpdateData } from "~/plugins/composables/dataHandler";
export default {
	name: "ChartDetailForm",
	props: {
		menuId: { type: String },
		chartConditionGroupName: { type: String },
		selectedChart: { type: Object, default: () => ({}) },
	},
	components: { ModalRuleSearch },
	setup(props) {
		const {
			setControlChartType,
			createMapData,
			createUIData,
			setMapData,
			convertData,
			selectedCCN,
		} = useControlChart();
		const { openModalConfirmBy } = useModalConfirm();
		const { modifyList } = useUpdateData();
		const chartDef = ref({});
		const chartDefKeyList = computed(() => Object.keys(chartDef.value));
		const chartId = ref(0);

		const controlChartDef = ref({});
		const chartNameList = ref({ Mean: [], Single: [], Count: [] });
		const CCType = ref("");

		const specLimit = ref({});
		const specLimitMap = ref([]);

		const controlLimit = ref({});
		const controlLimitMap = ref([]);

		const customLimit = ref({});
		const customLimitMap = ref([]);

		const orgControlChartType = ref("");
		const alarmComboSource = ref([]);

		const ruleAlarmGrid = ref(null);
		const ruleAlarmItems = ref([]);
		const modalCondition = ref({});
		const isShowModalSearch = ref(false);

		const apiData = ref({});

		onMounted(async () => {
			await fetchChartNameList();
			fetchAlarmList();
			chartDef.value = props.selectedChart;
			chartId.value = props.selectedChart.chartId;
			fetchControlChart(props.selectedChart.chartId);
		});

		async function fetchChartNameList() {
			let enumNameList = Object.keys(chartNameList.value);
			for (let enumName of enumNameList) {
				const { data } = await COMMON.getEnumValueList(
					"ControlChartType_" + enumName,
				);
				chartNameList.value[enumName] = data.data;
			}
		}

		async function fetchAlarmList() {
			const params = {
				searchCondition: {
					queryId: "GetAlarmDefList",
					queryVersion: "00001",
					parameters: { alarmId: "" },
				},
			};
			const { data } = await COMMON.getByCustomQuery(params);
			alarmComboSource.value = data.data.map(item => {
				return {
					text: item.ALARMID,
					value: item.ALARMID,
					AlarmId: item.ALARMID,
					Description: item.DESCRIPTION,
				};
			});
		}

		watch(
			() => props.selectedChart,
			def => {
				if (def.chartId) {
					chartDef.value = def;
					chartId.value = def.chartId;
					fetchControlChart(def.chartId);
				}
			},
		);

		async function fetchControlChart(chartId) {
			CCType.value = "";
			const { data } = await CHART.getControlChart({
				params: { chartId },
			});
			controlChartDef.value = data.data[0];
			orgControlChartType.value = controlChartDef.value.controlChartType;
			if (orgControlChartType.value.startsWith("Xbar")) {
				CCType.value = "Mean";
			} else if (orgControlChartType.value.startsWith("I")) {
				CCType.value = "Single";
			} else {
				CCType.value = "Count";
			}
			setControlChartType(
				chartNameList.value,
				controlChartDef.value.controlChartType,
				CCType.value,
			);
		}

		watch(
			() => CCType.value,
			CCType => {
				if (CCType) {
					fetchSpecLimit();
					fetchControlLimit();
					fetchCustomLimit();
				}
			},
		);

		function reset() {
			selectedCCN.value = [];
			specLimit.value = {};
			specLimitMap.value = [];
			controlLimit.value = {};
			controlLimitMap.value = [];
			customLimit.value = {};
			customLimitMap.value = [];
			orgControlChartType.value = "";
			alarmComboSource.value = [];
			fetchControlChart(chartId.value);
		}

		function countItemClicked(chartName) {
			controlChartDef.value.controlChartType = chartName;
			selectedCCN.value = [chartName];
			specLimitMap.value = createMapData(chartName, "spec");
			specLimit.value = [createUIData(chartName, "spec")];
			controlLimitMap.value = createMapData(chartName, "control");
			controlLimit.value = [createUIData(chartName, "control")];
			customLimitMap.value = createMapData(chartName, "custom");
			customLimit.value = [createUIData(chartName, "custom")];
		}

		function getCheckboxValue(enumValue) {
			if (Object.values(selectedCCN.value).find(f => f === enumValue)) {
				return true;
			} else {
				return false;
			}
		}

		function checkboxClicked(checked, chartName) {
			if (checked) {
				selectedCCN.value.push(chartName);
				specLimitMap.value = Object.assign(
					specLimitMap.value,
					createMapData(chartName, "spec"),
				);
				specLimit.value.push(createUIData(chartName, "spec"));
				specLimit.value.sort((a, b) => a["seq"] - b["seq"]);

				controlLimitMap.value = Object.assign(
					controlLimitMap.value,
					createMapData(chartName, "control"),
				);
				controlLimit.value.push(createUIData(chartName, "control"));
				controlLimit.value.sort((a, b) => a["seq"] - b["seq"]);
				customLimitMap.value = Object.assign(
					customLimitMap.value,
					createMapData(chartName, "custom"),
				);
				customLimit.value.push(createUIData(chartName, "custom"));
				customLimit.value.sort((a, b) => a["seq"] - b["seq"]);
			} else {
				selectedCCN.value.splice(
					selectedCCN.value.findIndex(f => f == chartName),
					1,
				);
				specLimit.value = specLimit.value.filter(
					f => f.name != chartName,
				);
				controlLimit.value = controlLimit.value.filter(
					f => f.name != chartName,
				);
				customLimit.value = customLimit.value.filter(
					f => f.name != chartName,
				);
			}
		}

		async function fetchSpecLimit() {
			const { data } = await CHART.getChartSpec(chartId.value);
			specLimitMap.value = setMapData(data.data, "spec");
			specLimit.value = convertData(data.data, "spec");
		}

		async function fetchControlLimit() {
			const { data } = await CHART.getChartControlSpec(chartId.value);
			controlLimitMap.value = setMapData(data.data, "control");
			controlLimit.value = convertData(data.data, "control");
		}

		async function fetchCustomLimit() {
			const { data } = await CHART.getChartCustomSpec(chartId.value);
			customLimitMap.value = setMapData(data.data, "custom");
			customLimit.value = convertData(data.data, "custom");
		}

		function openModalSearch() {
			modalCondition.value = {
				chartId: chartId,
				controlChartType: Object.values(selectedCCN.value),
				alarmComboSource: alarmComboSource,
			};
			ruleAlarmItems.value = ruleAlarmGrid.value.gridItems;
			isShowModalSearch.value = true;
		}
		function applyRule(items) {
			isShowModalSearch.value = false;
			ruleAlarmGrid.value.gridItems = items.value;
			ruleAlarmGrid.value.$refs.templateRef.$refs.gridRef.refresh();
		}

		function createItem(data) {
			let items = [];
			if (CCType.value == "Mean") {
				items.push({ chartName: "Raw", ...data["Raw"] });
			}
			for (let chartName of selectedCCN.value) {
				items.push({ chartName, ...data[chartName] });
			}
			return items;
		}

		function openModal() {
			apiData.value = { ...chartDef.value, ...controlChartDef.value };
			apiData.value["chartSpecList"] = createItem(specLimitMap.value);
			apiData.value["controlSpecList"] = createItem(
				controlLimitMap.value,
			);
			apiData.value["customSpecList"] = createItem(customLimitMap.value);
			apiData.value.controlChartType = Object.values(
				selectedCCN.value,
			).join("");
			apiData.value["ruleList"] = ruleAlarmGrid.value.gridItems;
			openModalConfirmBy(
				ACTION.MODIFY,
				"ChartSpec",
				[apiData.value],
				modifyData,
			);
		}

		async function modifyData(comment) {
			await modifyList(
				CHART.modifyChartSpec,
				"ChartSpec",
				[apiData.value],
				comment,
			);
		}

		return {
			chartId,
			chartDefKeyList,
			chartDef,

			// API
			CHART,

			// ControlChart
			controlChartDef,
			CCType,
			ACTION,
			chartNameList,

			countItemClicked,
			checkboxClicked,
			getCheckboxValue,

			//Spec
			specLimit,
			controlLimit,
			customLimit,
			specLimitMap,
			controlLimitMap,
			customLimitMap,
			alarmComboSource,

			reset,
			openModal,

			ruleAlarmGrid,
			ruleAlarmItems,
			isShowModalSearch,
			applyRule,
			modalCondition,
			openModalSearch,
		};
	},
};
</script>
<style scoped></style>
