<template>
	<div class="container-fluid">
		<div class="row">
			<div class="col">
				<div class="card">
					<div class="card-body">
						<div class="row">
							<div class="col-6">
								<wfl-radiobutton
									:id="'radio_processTime'"
									ref="radio_processTime"
									:checked="true"
									:label="'Process Time'"
									:name="'xAxis_radio'"
									@click="radioButtonClicked"
								></wfl-radiobutton>
								<wfl-radiobutton
									:id="'radio_materialName'"
									ref="radio_materialName"
									:label="'Material Name'"
									:name="'xAxis_radio'"
									@click="radioButtonClicked"
								></wfl-radiobutton>
							</div>
							<div class="col-6">
								<wfl-radiobutton
									:id="'radio_none'"
									ref="radio_none"
									:checked="true"
									:label="'None'"
									:name="'value_radio'"
									@click="radioButtonClicked1"
								></wfl-radiobutton>
								<wfl-radiobutton
									:id="'radio_ignore'"
									ref="radio_ignore"
									:label="'Ignore'"
									:name="'value_radio'"
									@click="radioButtonClicked1"
								></wfl-radiobutton>
								<wfl-radiobutton
									:id="'radio_hide'"
									ref="radio_hide"
									:label="'Hide'"
									:name="'value_radio'"
									@click="radioButtonClicked1"
								></wfl-radiobutton>
								<wfl-radiobutton
									:id="'radio_ignoreHide'"
									ref="radio_ignoreHide"
									:label="'Ignore & Hide'"
									:name="'value_radio'"
									@click="radioButtonClicked1"
								></wfl-radiobutton>
							</div>
							<div class="col-12" style="height: 40vh">
								<!-- <wfl-chart
									:id="'chart1'"
									ref="chart1"
									:title="title"
									:primaryXAxis="primaryXAxis"
									:primaryYAxis="primaryYAxis"
									:legendSettings="legendSettings"
									:series="series"
									:crosshair="crosshair"
									:enableSelectionZooming="true"
									:zoomSettings="{
										enableSelectionZooming: true,
									}"
									@chartMouseClick="
										chartMouseClick($event, 'chart1')
									"
									@chartMouseLeave="chartMouseLeave1"
									@chartMouseUp="chartMouseUp1"
									@chartMouseMove="chartMouseMove1"
								></wfl-chart> -->
								<spc-chart
									:id="'chart1'"
									ref="chart1"
									:crosshair="crosshair"
									:enableSelectionZooming="true"
									:legendSettings="legendSettings"
									:primaryXAxis="primaryXAxis"
									:primaryYAxis="primaryYAxis"
									:series="series"
									:title="title"
									:zoomSettings="{
										enableSelectionZooming: true,
									}"
									@chartMouseClick="
										chartMouseClick($event, 'chart1')
									"
									@chartMouseLeave="chartMouseLeave1"
									@chartMouseMove="chartMouseMove1"
									@chartMouseUp="chartMouseUp1"
								></spc-chart>
							</div>
							<div class="col-12" style="height: 40vh">
								<wfl-chart
									:id="'chart2'"
									ref="chart2"
									:crosshair="crosshair"
									:enableSelectionZooming="true"
									:legendSettings="legendSettings"
									:primaryXAxis="primaryXAxis"
									:primaryYAxis="primaryYAxis"
									:series="series"
									:title="'S'"
									:zoomSettings="{
										enableSelectionZooming: true,
									}"
									@chartMouseClick="
										chartMouseClick($event, 'chart2')
									"
									@chartMouseLeave="chartMouseLeave2"
									@chartMouseMove="chartMouseMove2"
									@chartMouseUp="chartMouseUp2"
									@pointRender="pointRender"
								></wfl-chart>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import * as CHARTDATA from "./data";
import WFLChart from "#/spc/components/common/WFLChart";

export default {
	name: "ChartForm_copy",
	components: { "spc-chart": WFLChart },
	data() {
		return {
			title: "Xbar",
			primaryXAxis: {
				title: "",
				valueType: "DateTime",
				edgeLabelPlacement: "Shift",
				labelFormat: "yyyy-mm-dd",
				intervalType: "Years",
			},
			primaryYAxis: {
				title: "",
				minimum: 0,
				maximum: 20,
				interval: 4,
				lineStyle: { width: 0 },
			},
			crosshair: { enable: true, lineType: "Vertical" },
			series: [],
			lineSeriesData: CHARTDATA.getChartData(),
			legendSettings: { visible: true },
			selectionMode: "Point",
			calculateType: "none",
		};
	},
	created() {},
	mounted() {
		this.setChartData();
	},
	methods: {
		async setChartData() {
			this.series = [
				{
					type: "Line",
					dataSource: this.lineSeriesData,
					xName: "processTime",
					yName: "result",
					name: "Value",
					fill: "black",
					marker: {
						visible: true,
						height: 7,
						width: 7,
						shape: "Circle",
						isFilled: true,
						color: "black",
					},
					pointColorMapping: "color",
				},
				{
					type: "Line",
					dataSource: this.lineSeriesData,
					xName: "processTime",
					yName: "upperSpecLimit",
					name: "USL",
					fill: "red",
					marker: { dataLabel: { visible: false } },
				},
				{
					type: "Line",
					dataSource: this.lineSeriesData,
					xName: "processTime",
					yName: "lowerSpecLimit",
					name: "LSL",
					fill: "red",
					marker: { dataLabel: { visible: false } },
				},
				{
					type: "Line",
					dataSource: this.lineSeriesData,
					xName: "processTime",
					yName: "centerLine",
					name: "CL",
					fill: "green",
					marker: { dataLabel: { visible: false } },
				},
				{
					type: "Line",
					dataSource: this.lineSeriesData,
					xName: "processTime",
					yName: "target",
					name: "Target",
					fill: "grey",
					marker: { dataLabel: { visible: false } },
				},
			];
		},
		pointRender(args) {
			console.log("point Render");
			if (args.fill == "black") {
				let data = args.point.series.dataSource[args.point.index];
				if (
					data.result > data.upperSpecLimit ||
					data.result < data.lowerSpecLimit
				) {
					args.fill = "yellow";
					args.border = { color: "yellow", width: 2 };
				}
			}
		},
		chartMouseClick(args, chartId) {
			if (args.target.includes(chartId + "_Series_0_Point_")) {
				let idx = args.target.split(chartId + "_Series_0_Point_")[1];
				idx = idx.split("_Trackball")[0];
				let newSeries = this.series.slice();
				let dataSource = newSeries[0].dataSource;
				if (this.calculateType == "none") {
					dataSource[idx].color = "black";
					this.series = newSeries;
				} else {
					if (this.calculateType == "ignoreHide") {
						dataSource[idx].color = "grey";
						dataSource.splice(idx, 1);
						for (let series of newSeries) {
							series.dataSource = dataSource;
						}
						this.series = newSeries;
					} else if (this.calculateType == "ignore") {
						dataSource[idx].color = "grey";
						this.series = newSeries;
					} else if (this.calculateType == "hide") {
						dataSource.splice(idx, 1);
						this.series = this.getSeries(dataSource);
					}
				}
			}
		},

		getSeries(data) {
			let series = [
				{
					type: "Line",
					dataSource: data,
					xName: "processTime",
					yName: "result",
					name: "Value",
					fill: "black",
					marker: {
						visible: true,
						height: 7,
						width: 7,
						shape: "Circle",
						isFilled: true,
						color: "black",
					},
					pointColorMapping: "color",
				},
				{
					type: "Line",
					dataSource: data,
					xName: "processTime",
					yName: "upperSpecLimit",
					name: "USL",
					fill: "red",
					marker: { dataLabel: { visible: false } },
				},
				{
					type: "Line",
					dataSource: data,
					xName: "processTime",
					yName: "lowerSpecLimit",
					name: "LSL",
					fill: "red",
					marker: { dataLabel: { visible: false } },
				},
				{
					type: "Line",
					dataSource: data,
					xName: "processTime",
					yName: "centerLine",
					name: "CL",
					fill: "green",
					marker: { dataLabel: { visible: false } },
				},
				{
					type: "Line",
					dataSource: data,
					xName: "processTime",
					yName: "target",
					name: "Target",
					fill: "grey",
					marker: { dataLabel: { visible: false } },
				},
			];
			return series;
		},
		radioButtonClicked(e) {
			if (!this.$isEmpty(e)) {
				let field = e.target.id.split("_")[1];
				if (field == "materialName") {
					this.primaryXAxis = {
						title: "",
						valueType: "Category",
					};
					this.series.map(m => (m.xName = "materialName"));
				} else {
					this.primaryXAxis = {
						title: "",
						valueType: "DateTime",
						edgeLabelPlacement: "Shift",
						labelFormat: "yyyy-mm-dd",
						intervalType: "Years",
					};
					this.series.map(m => (m.xName = "processTime"));
				}
				this.$refs.chart1.refresh();
				this.$refs.chart2.refresh();
			}
		},

		radioButtonClicked1(e) {
			if (!this.$isEmpty(e)) {
				let type = e.target.id.split("_")[1];
				this.calculateType = type;
			}
		},

		chartMouseLeave1: function () {
			this.$refs.chart2.getChartModel().hideCrosshair();
			this.$refs.chart2.getChartModel().hideTooltip();
		},

		chartMouseLeave2: function () {
			this.$refs.chart1.getChartModel().hideCrosshair();
			this.$refs.chart1.getChartModel().hideTooltip();
		},

		chartMouseUp1: function () {
			if (this.$refs.chart1.getChartModel().startMove) {
				this.$refs.chart2.getChartModel().hideCrosshair();
				this.$refs.chart2.getChartModel().hideTooltip();
			}
		},

		chartMouseUp2: function () {
			if (this.$refs.chart2.getChartModel().startMove) {
				this.$refs.chart1.getChartModel().hideCrosshair();
				this.$refs.chart1.getChartModel().hideTooltip();
			}
		},

		chartMouseMove1(args) {
			if (
				(!this.$refs.chart1.getChartModel().isTouch &&
					!this.$refs.chart1.getChartModel().isChartDrag) ||
				this.$refs.chart1.getChartModel().startMove
			) {
				this.$refs.chart2.getChartModel().showTooltip(args.x, args.y);
				this.$refs.chart2.getChartModel().showCrosshair(args.x, args.y);
			}
		},
		chartMouseMove2(args) {
			if (
				(!this.$refs.chart2.getChartModel().isTouch &&
					!this.$refs.chart2.getChartModel().isChartDrag) ||
				this.$refs.chart2.getChartModel().startMove
			) {
				this.$refs.chart1.getChartModel().showTooltip(args.x, args.y);
				this.$refs.chart1.getChartModel().showCrosshair(args.x, args.y);
			}
		},
	},
};
</script>
