import { ref } from "vue";
import Highcharts from "highcharts";
export function useChart() {
	const selectedPoint = ref([]);

	function createSimulationChart(id, option) {
		const { title, originSeries, xAxisField } = option;

		return Highcharts.chart(id, {
			chart: { type: "line", events: {} },
			title: { text: title },
			tooltip: { crosshairs: true, shared: true },
			legend: { enabled: false },
			plotOptions: {
				series: {
					point: {
						events: {
							click: function pointClicked({ point }) {
								if (point.marker?.radius == 10) {
									point.update(
										{
											marker: {
												fillColor: "black",
												radius: 4,
											},
										},
										false,
									);
								} else {
									point.update(
										{
											marker: {
												fillColor: "purple",
												radius: 10,
											},
										},
										false,
									);
								}
							},
						},
					},
					states: {
						hover: { enabled: false },
						inactive: { opacity: 1 }, // 시리즈의 불투명도를 1로 설정하여 색상이 연해지지 않도록 함
					},
				},
			},
			xAxis: {
				categories: originSeries.map(data => data[xAxisField]),
				crosshair: {
					snap: false,
					color: "gray",
					width: 1, // crosshair 선 너비
					dashStyle: "Solid", // crosshair 선 스타일
				},
				events: {
					// load() {
					// 	this.container.addEventListener(
					// 		"mousemove",
					// 		syncCrosshair(),
					// 	);
					// },
				},
			},
			accessibility: {
				enabled: false,
			},
			yAxis: {},
			series: [],
		});
	}

	return { createSimulationChart, selectedPoint };
}

export function useSeries() {
	/**
	 * @param {Array} chartData
	 * @returns {Array}
	 */
	function getSpecSeries(data) {
		const result = [];
		const upperSpecLimit = [];
		const lowerSpecLimit = [];
		const upperControlLimit = [];
		const lowerControlLimit = [];
		const upperCustomLimit = [];
		const lowerCustomLimit = [];
		const target = [];
		const centerLine = [];

		data.forEach(d => {
			// x 값이 있으면, x축이 변화되었을때 차트가 그려지지 않음
			result.push({ y: d.result, color: d.color });
			upperSpecLimit.push({ y: d.upperSpecLimit });
			lowerSpecLimit.push({ y: d.lowerSpecLimit });
			upperControlLimit.push({ y: d.upperControlLimit });
			lowerControlLimit.push({ y: d.lowerControlLimit });
			upperCustomLimit.push({ y: d.upperCustomLimit });
			lowerCustomLimit.push({ y: d.lowerCustomLimit });
			target.push({ y: d.target });
			centerLine.push({ y: d.centerLine });
		});

		const series = [
			// TODO: series의 색상은 system에 정의된 limit마다의 색상으로 정의필요함.
			// dashStyle: "ShortDash", "ShortDot", "ShortDashDot",
			{
				name: "Result",
				data: result,
				color: "black",
				marker: { symbol: "circle" },
				states: { hover: { enabled: true } },
			},
			{
				name: "Upper Spec Limit",
				data: upperSpecLimit,
				color: "red",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
			{
				name: "Lower Spec Limit",
				data: lowerSpecLimit,
				color: "red",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
			{
				name: "Upper Control Limit",
				data: upperControlLimit,
				color: "blue",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
			{
				name: "Lower Control Limit",
				data: lowerControlLimit,
				color: "blue",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
			{
				name: "Upper Custom Limit",
				data: upperCustomLimit,
				color: "orange",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
			{
				name: "Lower Custom Limit",
				data: lowerCustomLimit,
				color: "orange",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
			{
				name: "Target",
				data: target,
				color: "grey",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
			{
				name: "Center Line",
				data: centerLine,
				color: "green",
				marker: { enabled: false },
				states: { hover: { enabled: false } },
			},
		];
		return series;
	}

	/**
	 * @param {Array} chartData
	 * @returns {Array}
	 */
	function getSimulationSeries(data) {
		const result = [];

		data.forEach(d => {
			// x 값이 있으면, x축이 변화되었을때 차트가 그려지지 않음
			result.push({ y: d.result, color: d.color });
		});

		const series = [
			// TODO: series의 색상은 system에 정의된 limit마다의 색상으로 정의필요함.
			// dashStyle: "ShortDash", "ShortDot", "ShortDashDot",
			{
				name: "Result",
				data: result,
				color: "black",
				marker: { symbol: "circle" },
			},
		];
		return series;
	}

	return { getSpecSeries, getSimulationSeries };
}
