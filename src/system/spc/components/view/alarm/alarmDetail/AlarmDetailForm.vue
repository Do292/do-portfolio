<template>
	<div :class="{ infor: false }" class="card">
		TM18은 Alarm List에서 Grid Row 클릭 시 Alarm Detail 정보를 Popup
		제공한다. Suite SPC에서는 Alarm List에서 ChartDefName 또는 ChartId 클릭
		시 AlarmDetail 로 화면 이동하도록 설계.
		<div style="height: 40vh">
			<SpcChart
				:id="state.chartId"
				:chartOption="chartOption"
				:series="chartOption.series"
			></SpcChart>
		</div>
		<FormTab
			:id="menuId"
			:ref="menuId"
			:items="tabItems"
			:selectedIndex="selectedIndex"
			@selectTab="onSelectedTab"
		>
			<template v-slot:tabContent>
				<div v-show="selectedIndex == 0">
					<FormGrid
						:checkbox="false"
						:customApi="COMMON.getByCustomQuery"
						:gridId="controlGridId"
						:gridTitle="controlDef.label"
						:initSearch="false"
						:isUseCreate="false"
						:isUseDelete="false"
						:isUseModify="false"
						:isUsePath="false"
						:menuId="menuId"
						:searchCondition="controlCondition"
					>
					</FormGrid>
					<!-- @onSelectionChanged="setInformation" -->
				</div>
				<div v-show="selectedIndex == 1">
					<FormGrid
						:checkbox="false"
						:customApi="COMMON.getByCustomQuery"
						:gridId="rawGridId"
						:gridTitle="rawDef.label"
						:initSearch="false"
						:isUseCreate="false"
						:isUseDelete="false"
						:isUseModify="false"
						:isUsePath="false"
						:menuId="menuId"
						:searchCondition="rawCondition"
					>
					</FormGrid>
					<!-- @onSelectionChanged="setInformation" -->
				</div>
			</template>
		</FormTab>
		<!-- <FormInformation :config="infoConfig" /> -->
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from "vue";
// import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import * as COMMON from "~/api/system-common";
import SpcChart from "#/spc/components/common/SpcChart";
import { useSeries } from "#/spc/plugins/composables/chartHandler";

const state = ref({});

const menuId = "AlarmDetail";
const controlGridId = "AlarmDetailControl";
const rawGridId = "AlarmDetailRaw";

// const { isShowInformation, infoConfig, setInformation } = useInformation();
const { fetchGridTableDef: fetchControlDef, gridTableDef: controlDef } =
	useTableDef();
const { fetchGridTableDef: fetchRawDef, gridTableDef: rawDef } = useTableDef();
const { getSpecSeries } = useSeries();

onMounted(async () => {
	await fetchControlDef(menuId, controlGridId);
	await fetchRawDef(menuId, rawGridId);
});

onActivated(async () => {
	if (history.state.chartId) {
		state.value = history.state;

		await fetchControlDef(menuId, controlGridId);
		await fetchRawDef(menuId, rawGridId);
		await fetchChartList();
	}
});
const tabItems = ref(["Control Data", "Raw Data"]);
const selectedIndex = ref(0);
function onSelectedTab({ index }) {
	selectedIndex.value = index;
}

const controlCondition = computed(() => ({
	queryId: controlDef.value.queryId,
	queryVersion: controlDef.value.queryVersion,
	parameters: {
		chartId: state.value.chartId,
		alarmId: state.value.alarmId,
		alarmSeq: state.value.alarmSeq,
	},
}));

const rawCondition = computed(() => ({
	queryId: rawDef.value.queryId,
	queryVersion: rawDef.value.queryVersion,
	parameters: {
		chartId: state.value.chartId,
		alarmId: state.value.alarmId,
		alarmSeq: state.value.alarmSeq,
	},
}));

const xAxisField = ref("processTime");
const option = ref({
	title: "",
	series: [],
	originSeries: [],
	xAxisField: xAxisField.value,
});
const chartOption = computed(() => option.value);

async function fetchChartList() {
	// GetControlDataChart
	const { data } = await COMMON.getByCustomQuery({
		// searchCondition: {
		// 	queryId: "GetAlarmDetail",
		// 	queryVersion: "00006",
		// 	parameters: {
		// 		maxDisplayPointCount: 100,
		// 		chartId: state.value.chartId,
		// 		alarmSeq: state.value.alarmSeq,
		// 	},
		// },
		searchCondition: {
			queryId: "GetControlDataChart",
			queryVersion: "00001",
			parameters: {
				maxDisplayPointCount: 100,
				chartId: 1,
				chartName: "Xbar",
				periodFrom: "20200101",
				periodTo: "20241231",
			},
		},
	});
	let chartData = [];
	data.data.forEach(data =>
		chartData.push({
			controlDataSeq: data.CONTROLDATASEQ,
			sequence: data.SEQ,
			processTime: data.PROCESSTIME,
			materialName: data.MATERIALNAME,
			result: data.RESULT,
			upperSpecLimit: data.UPPERSPECLIMIT,
			lowerSpecLimit: data.LOWERSPECLIMIT,
			upperControlLimit: data.UPPERCONTROLLIMIT,
			lowerControlLimit: data.LOWERCONTROLLIMIT,
			upperCustomLimit: data.UPPERCUSTOMIMIT,
			lowerCustomLimit: data.LOWERCUSTOMLIMIT,
			target: data.TARGET,
			centerLine: data.CENTERLINE,
			color: data.PROCESSTIME,
		}),
	);

	option.value = {
		title: state.value.chartName,
		series: getSpecSeries(chartData),
		originSeries: chartData,
		// series: [],
		// originSeries: [],
		xAxisField: xAxisField.value,
	};
}
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(50vh - 230px) !important;
}
</style>
