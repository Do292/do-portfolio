<template>
	<div>
		<FormSpcChartHeader
			:chartTypeEnabled="false"
			@changeXAxis="changeXAxis"
		>
			<template v-slot:chart-header-button>
				<ButtonDropdown
					:items="[
						'Recalculate',
						'Ignore',
						'Hide',
						'Ingore&Hide',
						'Save',
					]"
					@onSelect="clickedAction"
				/>
			</template>
		</FormSpcChartHeader>

		<div v-for="(option, index) in chartcreateList" :key="index">
			<SpcChart
				:id="'chart_' + option.title"
				:ref="'chart_' + option.title"
				:chartOption="option"
				:series="option.series"
			></SpcChart>
		</div>
	</div>
</template>

<script>
import { ref, computed, onBeforeMount, onMounted } from "vue";
import * as CHARTDATA from "./data";
import SpcChart from "#/spc/components/common/SpcChart";
import FormSpcChartHeader from "#/spc/components/common/FormSpcChartHeader.vue";
import { useSeries } from "#/spc/plugins/composables/chartHandler";
import * as COMMON from "~/api/system-common.js";

export default {
	name: "ChartForm",
	components: { SpcChart, FormSpcChartHeader },
	setup() {
		const { getSpecSeries } = useSeries();
		const chartSeries1 = ref([]);
		const chartSeries2 = ref([]);

		const chart_Xbar = ref(null);
		const chart_S = ref(null);
		const syncRefs = ref([chart_Xbar, chart_S]);
		const xAxisField = ref("processTime");

		const chartList = ref([
			{
				title: "Xbar",
				series: [],
				originSeries: [],
				xAxisField: xAxisField.value,
				syncRefs: syncRefs.value,
			},
			{
				title: "S",
				series: [],
				originSeries: [],
				xAxisField: xAxisField.value,
				syncRefs: syncRefs.value,
			},
		]);
		const chartcreateList = computed(() => chartList.value);

		onBeforeMount(async () => {
			await fetchChartList();
		});

		async function fetchChartList() {
			// GetControlDataChart
			const { data } = await COMMON.getByCustomQuery({
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
			let chartData1 = [];
			data.data.forEach(data =>
				chartData1.push({
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

			const result = await COMMON.getByCustomQuery({
				searchCondition: {
					queryId: "GetControlDataChart",
					queryVersion: "00001",
					parameters: {
						maxDisplayPointCount: 100,
						chartId: 1,
						chartName: "S",
						periodFrom: "20200101",
						periodTo: "20241231",
					},
				},
			});
			let chartData2 = [];
			result.data.data.forEach(data =>
				chartData2.push({
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
			chartList.value = [
				{
					title: "Xbar",
					series: getSpecSeries(chartData1),
					originSeries: chartData1,
					xAxisField: xAxisField.value,
					syncRefs: syncRefs.value,
				},
				{
					title: "S",
					series: getSpecSeries(chartData2),
					originSeries: chartData2,
					xAxisField: xAxisField.value,
					syncRefs: syncRefs.value,
				},
			];
		}

		onMounted(async () => {
			await setHighChartsData();
		});

		async function setHighChartsData() {
			chartSeries1.value = getSpecSeries(CHARTDATA.getData());
			chartSeries2.value = getSpecSeries(CHARTDATA.getData2());
		}

		function changeXAxis(field) {
			xAxisField.value = field;
			syncRefs.value.map(ref => {
				ref.value[0].updateXAxis(field);
			});
		}

		function clickedAction({ element }) {
			syncRefs.value.map(ref => {
				ref.value[0].performAction(element.id);
			});
		}

		return {
			setHighChartsData,
			chartSeries1,
			chartSeries2,
			chartcreateList,

			syncRefs,
			chart_Xbar,
			chart_S,

			changeXAxis,

			clickedAction,
		};
	},
	data() {
		return {
			actionType: "none",
		};
	},
	methods: {
		// calculateButtonClicked(type) {
		// 	this.actionType = type;
		// },
		// resetButtonClicked() {
		// 	this.setHighChartsData();
		// },
	},
};
</script>
