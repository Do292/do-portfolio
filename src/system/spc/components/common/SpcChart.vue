<template>
	<div :id="id" :ref="'chartRef'" style="height: 350px"></div>
</template>
<script>
import { ref, watch, onMounted } from "vue";
import { useChart } from "#/spc/plugins/composables/chartHandler";
export default {
	name: "SpcChart",
	components: {},
	props: {
		id: { type: [String, Number], default: "chart" },
		chartOption: { type: Object },
		syncRefs: { type: Array, default: () => [] },
		series: { type: Array, default: () => [] },
	},
	setup(props) {
		const chartRef = ref(null);
		const { createSimulationChart } = useChart();

		onMounted(async () => {
			chartRef.value = createSimulationChart(props.id, props.chartOption);
		});

		watch(
			() => props.series,
			series => {
				updateChartSeries(series);
			},
		);

		function updateChartSeries(series) {
			updateXAxis(props.chartOption.xAxisField);
			// 기존에 있던 series 전부 삭제 후 add 진행
			while (chartRef.value.series.length) {
				chartRef.value.series[0].remove(false);
			}
			// false는 add하고 바로 시리즈 그리지 않는다는 속성
			series.forEach(s => {
				chartRef.value.addSeries(s, false);
			});
			chartRef.value.redraw();
		}

		function updateXAxis(field) {
			chartRef.value.xAxis[0].categories =
				props.chartOption.originSeries.map(data => data[field]);
			chartRef.value.redraw();
		}

		function performAction(action) {
			const points = chartRef.value.series[0].points.filter(
				f => f.marker?.radius == 10,
			);
			const indexes = points.map(f => f.index);
			alert(
				" Action : " +
					action +
					"\n chartType:  " +
					props.id.split("_")[1] +
					"\n 처리할 data 갯수 : " +
					points.length +
					"\n data index " +
					indexes,
			);
		}

		// function syncCrosshair(e) {
		// 	if (props.syncRefs.length > 0) {
		// 		var charts = [];
		// 		props.syncRefs.forEach(refName => {
		// 			charts.push(this.$parent.$refs[refName].chartRef);
		// 		});

		// 		const normalizedEvent = charts[0].pointer.normalize(e);
		// 		charts.forEach(chart => {
		// 			const point = chart.series[0].searchPoint(
		// 				normalizedEvent,
		// 				true,
		// 			);

		// 			// 이전에 남아있던 다른 포인트의 호버상태를 초기화시켜줌
		// 			chart.series.forEach(series => {
		// 				series.data.forEach(dataPoint => {
		// 					if (dataPoint.setState) {
		// 						dataPoint.setState("");
		// 					}
		// 				});
		// 			});

		// 			if (point) {
		// 				chart.xAxis[0].drawCrosshair(normalizedEvent, point);
		// 				chart.yAxis[0].drawCrosshair(normalizedEvent, point);

		// 				const points = chart.series.map(
		// 					series => series.data[point.index],
		// 				);
		// 				chart.tooltip.refresh(points); // crosshair가 표기된 모든 차트에 개별적으로 툴팁 표현하도록 함.

		// 				// 현재 호버된 포인트에만 hover 되도록 하기 위함.
		// 				points.forEach(p => {
		// 					if (p.setState) {
		// 						p.setState("hover");
		// 					}
		// 				});
		// 			}
		// 		});
		// 	}
		// }

		return {
			chartRef,
			updateXAxis,
			performAction,
			// syncCrosshair,
		};
	},
	mounted() {
		// this.$nextTick(function () {
		// 	this.chartRef.container.addEventListener(
		// 		"mousemove",
		// 		this.syncCrosshair,
		// 	);
		// });
	},
	methods: {},
};
</script>
<style scope></style>
