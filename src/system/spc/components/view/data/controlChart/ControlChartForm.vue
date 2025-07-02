<template>
	<div class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="chartNameDef.searchConditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setCondition"
			></FormSearchCondition>
			<div class="pt-2"><ChartForm></ChartForm></div>
			<div class="pt-2">
				<FormTab
					:id="'controlChartTab'"
					ref="controlChartTab"
					:items="tabItems"
					:selectedIndex="selectedIndex"
					@selectTab="onSelectedTab"
				>
					<template v-slot:tabContent>
						<div v-show="selectedIndex == 0">
							<FormGrid
								:checkbox="false"
								:customApi="COMMON.getByCustomQuery"
								:gridId="chartNameGridId"
								:gridTitle="chartNameDef.label"
								:initSearch="false"
								:isUseCreate="false"
								:isUseDelete="false"
								:isUseModify="false"
								:isUsePath="false"
								:menuId="menuId"
								:searchCondition="chartNameCondition"
							>
							</FormGrid>
						</div>
						<div v-show="selectedIndex == 1">
							<FormGrid
								:checkbox="false"
								:customApi="COMMON.getByCustomQuery"
								:gridId="controlDataGridId"
								:gridTitle="controlDataDef.label"
								:initSearch="false"
								:isUseCreate="false"
								:isUseDelete="false"
								:isUseModify="false"
								:isUsePath="false"
								:menuId="menuId"
								:searchCondition="controlDataCondition"
							>
							</FormGrid>
						</div>
						<div v-show="selectedIndex == 2">
							<FormGrid
								:checkbox="false"
								:customApi="COMMON.getByCustomQuery"
								:gridId="alarmGridId"
								:gridTitle="alarmDef.label"
								:initSearch="false"
								:isUseCreate="false"
								:isUseDelete="false"
								:isUseModify="false"
								:isUsePath="false"
								:menuId="menuId"
								:searchCondition="alarmCondition"
							>
							</FormGrid>
						</div>
					</template>
				</FormTab>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, onBeforeMount } from "vue";
import { useTableDef } from "~/plugins/composables/tableHandler";
import * as COMMON from "~/api/system-common";
import ChartForm from "./ChartForm";

const menuId = "ControlChart";
const chartNameGridId = "ChartName";
const controlDataGridId = "ControlData";
const alarmGridId = "Alarm";

const { fetchGridTableDef: fetchChartNameDef, gridTableDef: chartNameDef } =
	useTableDef();
const { fetchGridTableDef: fetchControlDataDef, gridTableDef: controlDataDef } =
	useTableDef();
const { fetchGridTableDef: fetchAlarmDef, gridTableDef: alarmDef } =
	useTableDef();

onBeforeMount(async () => {
	await fetchChartNameDef(menuId, chartNameGridId);
	await fetchControlDataDef(menuId, controlDataGridId);
	await fetchAlarmDef(menuId, alarmGridId);
});

const tabItems = ref([chartNameGridId, controlDataGridId, alarmGridId]);
const selectedIndex = ref(0);
function onSelectedTab({ index }) {
	selectedIndex.value = index;
}

const chartNameCondition = ref({});
const controlDataCondition = ref({});
const alarmCondition = ref({});

const setCondition = async condiiton => {
	chartNameCondition.value = {
		queryId: chartNameDef.value.queryId,
		queryVersion: chartNameDef.value.queryVersion,
		parameters: condiiton,
	};
	controlDataCondition.value = {
		queryId: controlDataDef.value.queryId,
		queryVersion: controlDataDef.value.queryVersion,
		parameters: condiiton,
	};
	alarmCondition.value = {
		queryId: alarmDef.value.queryId,
		queryVersion: alarmDef.value.queryVersion,
		parameters: condiiton,
	};
};
// 	methods: {
// 		// todo: items api 수정
// 		async getChartNameByCustomQuery() {
// 			try {
// 				let params = {
// 					parameters: {
// 						CHARTID: "1",
// 						SIMULATIONID: "1",
// 					},
// 					queryId: "GetSimulationDataList",
// 					queryVersion: "00001",
// 				};
// 				let { data } = await API_TEST.getDataByCustomQuery(params);
// 				this.chartNameData = data.data;
// 			} catch (error) {
// 				console.log(error);
// 			}
// 		},

// 		async getControlDataByCustomQuery() {
// 			try {
// 				let params = {
// 					parameters: {
// 						CHARTID: "1",
// 						CHARTNAME: "R",
// 						STARTDATE: "202404021653",
// 						ENDDATE: "202405021653",
// 						MAXDISPLAYPOINTCOUNT: "100",
// 						FACTORYNAME: "A1",
// 					},
// 					queryId: "GetControlDataList",
// 					queryVersion: "00001",
// 				};
// 				let { data } = await API_TEST.getDataByCustomQuery(params);
// 				this.controlData = data.data;
// 			} catch (error) {
// 				console.log(error);
// 			}
// 		},

// 		async getAlarmListByCustomQuery() {
// 			try {
// 				let params = {
// 					parameters: {
// 						SIMULATIONID: "1",
// 						SIMULATIONDATASEQ: "1",
// 					},
// 					queryId: "GeAlarmListData",
// 					queryVersion: "00001",
// 				};
// 				let { data } = await API_TEST.getDataByCustomQuery(params);
// 				this.alarmData = data.data;
// 			} catch (error) {
// 				console.log(error);
// 			}
// 		},

// 		search(condition) {
// 			console.log(condition);
// 		},
// 	},
// };
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: 300px !important;
}
:deep(.card-body) {
	overflow-y: scroll !important;
}
</style>
