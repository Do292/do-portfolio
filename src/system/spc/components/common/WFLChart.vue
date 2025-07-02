<template>
	<!-- <wfl-chart
		:id="id"
		:ref="id"
		:title="title"
		:primaryXAxis="primaryXAxis"
		:primaryYAxis="primaryYAxis"
		:legendSettings="legendSettings"
		:series="seriesData"
		:crosshair="crosshair"
		:enableSelectionZooming="enableSelectionZooming"
		:selectionMode="selecting ? selectionMode : 'none'"
		@chartMouseClick="$emit('chartMouseClick', $event)"
		@chartMouseLeave="$emit('chartMouseLeave', $event)"
		@chartMouseUp="$emit('chartMouseUp', $event)"
		@chartMouseMove="$emit('chartMouseMove', $event)"
	></wfl-chart> -->
	<wfl-chart
		:id="id"
		:ref="id"
		:crosshair="crosshair"
		:enableSelectionZooming="enableSelectionZooming"
		:legendSettings="legendSettings"
		:primaryXAxis="primaryXAxis"
		:primaryYAxis="primaryYAxis"
		:series="series"
		:title="title"
		@chartMouseClick="chartMouseClick"
		@chartMouseLeave="$emit('chartMouseLeave', $event)"
		@chartMouseMove="$emit('chartMouseMove', $event)"
		@chartMouseUp="$emit('chartMouseUp', $event)"
		@pointRender="pointRender"
	></wfl-chart>
</template>
<script>
export default {
	name: "WFLChart",
	components: {},
	props: {
		id: { type: String, default: "chart" },
		title: { type: String, default: "" },
		primaryXAxis: { type: Object },
		primaryYAxis: {
			type: Object,
			default: () => ({
				title: "",
				minimum: 0,
				maximum: 20,
				interval: 4,
				lineStyle: { width: 0 },
			}),
		},
		chartSeries: { type: Array, default: () => [] },
		dataSource: { type: Array, default: () => [] },
		ignoreIndexes: { type: Array, default: () => [] },
		legendSettings: { type: Object, default: () => ({ visible: true }) },
		enableSelectionZooming: { type: Boolean, default: true },
		selecting: { type: Boolean, default: false },
		selectionMode: { type: String, default: "Point" },
		crosshair: {
			type: Object,
			default: () => ({ enable: true, lineType: "Vertical" }),
		},
	},
	data() {
		return { series: [] };
	},
	emits: [
		"pointRender",
		"chartMouseClick",
		"chartMouseLeave",
		"chartMouseUp",
		"chartMouseMove",
	],
	watch: {
		dataSource: {
			deep: true,
			handler() {
				this.resetChartData();
			},
		},
		chartSeries: {
			deep: true,
			handler(items) {
				this.setChartData(items);
			},
		},
	},
	methods: {
		refresh() {
			this.$refs[this.id].refresh();
		},

		resetChartData() {
			this.series.map(series => (series.dataSource = this.dataSource));
			this.refresh();
		},

		setChartData(items) {
			let chartSeries = [];
			for (let item of items) {
				let obj = {
					type: "Line",
					xName: item.xName,
					yName: item.yName,
					name: item.name,
					dataSource: this.dataSource,
					fill: this.getColor(item.yName),
					marker: item.marker ? item.marker : { visible: false },
					pointColorMapping: "fill",
				};
				chartSeries.push(obj);
			}
			this.series = chartSeries;
		},

		pointRender(args) {
			let pointIndex = args.point.index;
			if (this.ignoreIndexes.findIndex(f => f == pointIndex) != -1) {
				args.fill = "grey";
				args.border = { color: "grey", width: 2 };
			} else {
				if (this.getColor("result") == args.fill) {
					let data = args.point.series.dataSource[pointIndex];
					//TestCode
					if (
						data.result > data.upperSpecLimit ||
						data.result < data.lowerSpecLimit
					) {
						args.fill = "yellow";
						args.border = { color: "yellow", width: 2 };
					} else {
						args.fill = "black";
						args.border = { color: "black", width: 2 };
					}
				}
			}
			this.$emit("pointRender", args);
		},

		chartMouseClick(args) {
			let id = this.id;
			if (args.target.includes(id + "_Series_0_Point_")) {
				this.$emit("chartMouseClick", {
					args: args,
					series: this.series.slice(),
					idx: args.target
						.split(id + "_Series_0_Point_")[1]
						.split("_Trackball")[0],
					id: id,
				});
			}
		},

		//TODO Series color mapping
		getColor(yName) {
			switch (yName) {
				case "result":
					return "black";
				case "upperSpecLimit":
				case "lowerSpecLimit":
					return "red";
				case "centerLine":
					return "green";
				case "target":
					return "grey";
				default:
					return "black";
			}
		},
	},
};
</script>
<style scope></style>
