<template>
	<div>
		<ModalRuleSearch
			v-if="isShowModalSearch"
			:condition="modalCondition"
			:currentRuleItems="selectedRuleItems"
			:menuId="menuId"
			@apply="applyRule"
			@close="isShowModalSearch = false"
		/>
		<FormSpcChartHeader
			:chartTypeEnabled="false"
			@changeXAxis="changeXAxis"
		>
			<template v-slot:chart-header-button>
				<div>
					<ButtonBasic type="search" @onClick="openModalSearch"
						>Select Rule</ButtonBasic
					>
					<ButtonDropdown
						:items="comboButtonItems"
						@onSelect="clickedAction"
					/>
					<ButtonBasic :type="'report'"> Report </ButtonBasic>
				</div>
			</template>
		</FormSpcChartHeader>

		<div v-for="(chartOption, index) in chartList" :key="index">
			<SpcChart
				:id="'chart_' + chartOption.title"
				:ref="'chart_' + chartOption.title"
				:chartOption="chartOption"
			></SpcChart>
		</div>
	</div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as CHARTDATA from "./data";
import ModalRuleSearch from "#/spc/components/modeling/chartStatus/form/ModalRuleSearch";
import SpcChart from "#/spc/components/common/SpcChart";
import FormSpcChartHeader from "#/spc/components/common/FormSpcChartHeader.vue";
import { useSeries } from "#/spc/plugins/composables/chartHandler";

export default {
	name: "SimulationChartForm",
	components: { SpcChart, FormSpcChartHeader, ModalRuleSearch },
	props: { chartCondition: { type: Object }, menuId: { type: String } },
	setup(props) {
		const { getSimulationSeries } = useSeries();
		const chartSeries1 = ref([]);
		const chartSeries2 = ref([]);

		const chart_Xbar = ref(null);
		const chart_S = ref(null);
		const syncRefs = ref([chart_Xbar, chart_S]);
		const xAxisField = ref("processTime");
		const comboButtonItems = ref(["Simulation", "Save"]);

		const isShowModalSearch = ref(false);
		const modalCondition = ref({});
		const selectedRuleItems = ref([]);
		function openModalSearch() {
			modalCondition.value = props.chartCondition;
			isShowModalSearch.value = true;
		}
		function applyRule(items) {
			isShowModalSearch.value = false;
			selectedRuleItems.value = items.value;
		}

		const chartList = ref([
			{
				title: "Xbar",
				series: chartSeries1,
				originSeries: CHARTDATA.getChartData(),
				xAxisField: xAxisField.value,
				syncRefs: syncRefs.value,
			},
			{
				title: "S",
				series: chartSeries2,
				originSeries: CHARTDATA.getChartData2(),
				xAxisField: xAxisField.value,
				syncRefs: syncRefs.value,
			},
		]);

		onMounted(async () => {
			await setHighChartsData();
		});

		async function setHighChartsData() {
			chartSeries1.value = getSimulationSeries(CHARTDATA.getChartData());
			chartSeries2.value = getSimulationSeries(CHARTDATA.getChartData2());
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
			comboButtonItems,

			setHighChartsData,
			chartSeries1,
			chartSeries2,
			chartList,

			syncRefs,
			chart_Xbar,
			chart_S,

			changeXAxis,

			clickedAction,

			// Rule
			modalCondition,
			isShowModalSearch,
			selectedRuleItems,
			openModalSearch,
			applyRule,
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
