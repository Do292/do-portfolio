<template>
	<div
		:id="id"
		ref="highchartsGanttRef"
		style="height: calc(100vh - 241px) !important; overflow: auto"
	></div>
</template>
<script>
import { ref, onMounted } from "vue";
import Highcharts from "highcharts/highcharts-gantt";
import HighchartsExporting from "highcharts/modules/exporting";
HighchartsExporting(Highcharts);

export default {
	name: "MesGanttChart",
	components: {},
	props: {
		id: { type: String, default: "ganttChart" },
		title: { type: String, default: "" },
		seriesData: { type: Array, default: () => [] },
		refreshFunc: { type: Function },
		tooltipContent: { type: Array, default: () => [] },
	},
	emits: ["search"],
	setup(props, { emit }) {
		const highchartsRef = ref(null);

		function updateSeriesData(seriesData) {
			highchartsRef.value.series[0].setData(seriesData);
			highchartsRef.value.redraw();
		}

		function getTooltipTR(title, value, dateFormat) {
			const tooltipValue = dateFormat
				? Highcharts.dateFormat(dateFormat, value)
				: value;
			return (
				"<tr><td style='padding-right: 10px; font-weight:bold;'>" +
				title +
				"</td><td>" +
				tooltipValue +
				"</td></tr>"
			);
		}

		function getTooltipContent(chart) {
			var tooltip = "<table>";
			props.tooltipContent.map(({ field, title, dateFormat }) => {
				tooltip += getTooltipTR(title, chart.point[field], dateFormat);
			});
			tooltip += "</table>";
			return tooltip;
		}

		onMounted(async () => {
			function customBtnTheme({ fontSize }) {
				return {
					// height, // 버튼 높이
					fill: "#f7f7f7",
					stroke: "#aeaeae",
					"stroke-width": 1,
					r: 4,
					style: {
						color: "black",
						fontSize,
						// fontSize: "0.7rem",
					},
					states: {
						hover: {
							fill: "#e6e6e686",
							style: {
								color: "#222",
							},
						},
						select: {
							fill: "#f7f7f7",
							style: {
								color: "#222",
							},
						},
					},
				};
			}

			highchartsRef.value = Highcharts.ganttChart(props.id, {
				title: {
					text: props.title,
				},
				// chart: {
				// 	// zoomType: "x",
				// },
				series: [
					{
						name: "Gantt Chart",
						data: [],
					},
				],
				xAxis: [
					// week 숨기려면 xAxis를 리스트 형태로 정의해야함.
					{
						type: "datetime",
						tickInterval: 24 * 3600 * 1000, // type이 datetime 일 경우, 1일 단위로 보여지게
						dateTimeLabelFormats: {
							// 일자 기준으로 zoom 됐을때 보여지는 format
							// day: "%Y년 %m월 %d일",
							day: "%m-%d",
						},
						labels: {
							formatter: function () {
								return Highcharts.dateFormat(
									"%m-%d",
									this.value,
								);
							},
						},
						endOnTick: true,
					},
					// { visible: false },
				],
				yAxis: {
					visible: false,
					uniqueNames: true, // true : series내의 name 이 id 처럼 동작하는것 / false : id로 보지 않고 개별적인 것으로 뿌려줌
					// 웬만하면 uniqueNames 쓰지말고, category 형태로 정의해서 쓰는것이 나음
					// categories: [],
				},
				plotOptions: {
					series: {
						dataLabels: {
							enabled: true,
							format: "{point.customName}", // series에 해당 data 표기
						},
						pointPadding: 0.1, // 데이터 포인트의 좌우 여백 설정
						pointWidth: 20, // 데이터 포인트의 너비 설정
						point: {
							events: {
								click: function ({ point }) {
									emit("search", point.options);
								},
							},
						},
					},
				},
				tooltip: {
					style: {
						fontSize: "0.8rem",
					},
					formatter: function () {
						return getTooltipContent(this);
					},
					useHTML: true,
				},
				// navigator: {
				// 	enabled: false,
				// 	liveRedraw: true,
				// 	series: {
				// 		type: "gantt",
				// 		pointPlacement: 0.5,
				// 		pointPadding: 0.25,
				// 		accessibility: {
				// 			enabled: false,
				// 		},
				// 	},
				// 	yAxis: {
				// 		min: 0,
				// 		max: 3,
				// 		reversed: true,
				// 		categories: [],
				// 	},
				// },
				scrollbar: {
					enabled: true,
				},
				rangeSelector: {
					enabled: true,
					selected: -1, // -1이면 초기값이 All(가장마지막) // 0 이면 1M으로 셋팅됨
					dropdown: "always", // 기본 responsive : 동적으로 변경됨 / always: dropdown 형태로 고정
					// floating: true, // 기본 false / true : 차트 위에 겹쳐서 배치됨
					inputEnabled: false, // false : 우측 상단에 위치한 날짜 선택 picker 숨김처리
					allButtonsEnabled: true,
					buttonPosition: {
						align: "right",
					},
					buttonTheme: customBtnTheme({
						height: 30,
						fontSize: "1rem",
					}),
					buttons: [
						// 기본적으로 정의된 것들이 있음
						// https://api.highcharts.com/gantt/rangeSelector.buttons
						{
							type: "day",
							count: 1,
							text: "1D",
						},
						{
							type: "day",
							count: 3,
							text: "3D",
						},
						{
							type: "day",
							count: 5,
							text: "5D",
						},
						{
							type: "day",
							count: 7,
							text: "7D",
						},
						{
							type: "all",
							text: "All",
						},
					],
				},
				exporting: {
					enabled: true,
					buttons: {
						customButton: {
							useHTML: true,
							text: '<i class="aim aimcons_refresh" style="fontSize: 0.7rem"></i>',
							onclick: function () {
								// 버튼 클릭 시 실행할 동작
								props.refreshFunc();
							},
							theme: customBtnTheme({
								height: 30,
								fontSize: "0.8rem",
							}),
						},
					},
				},
				accessibility: {
					// false로 안하면 warning 에러 뜸. https://www.highcharts.com/docs/accessibility/accessibility-module
					enabled: false,
				},
			});
		});

		return {
			// Ref
			highchartsRef,
			// Function
			updateSeriesData,
			getTooltipContent,
		};
	},
};
</script>

<style scope></style>
