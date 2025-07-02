<template>
	<div>test</div>
	<!-- <div class="row">
		<div class="col" style="height: 35vh">
			<spc-chart
				:id="'chart1'"
				ref="chart1"
				:chartSeries="series"
				:dataSource="dataSource"
				:primaryXAxis="primaryXAxis"
				:title="title"
			></spc-chart>
		</div>
	</div> -->
</template>

<script>
// import * as CHARTDATA from "~/system/spc/components/calculateData/controlLimitSimulation/data.js";
export default {
	name: "edcChartForm",
	components: {},
	props: { title: { type: String } },
	data() {
		return {
			// series: [],
			// dataSource: CHARTDATA.getChartData(),
			// calculateType: "none",
			// primaryXAxis: {
			// 	title: "",
			// 	valueType: "DateTime",
			// 	edgeLabelPlacement: "Shift",
			// 	labelFormat: "yyyy-mm-dd",
			// 	intervalType: "Years",
			// },
		};
	},
	created() {},
	mounted() {
		// this.setChartData();
	},
	methods: {
		async setChartData() {
			this.series = [
				{
					xName: "processTime",
					yName: "result",
					name: "Value",
					marker: {
						visible: true,
						height: 7,
						width: 7,
						shape: "Circle",
						isFilled: true,
						color: "black",
						yName: "result",
					},
				},
				{ xName: "processTime", yName: "upperSpecLimit", name: "USL" },
				{ xName: "processTime", yName: "lowerSpecLimit", name: "LSL" },
				{ xName: "processTime", yName: "centerLine", name: "CL" },
				{ xName: "processTime", yName: "target", name: "Target" },
			];
		},

		// calculateButtonClicked(type) {
		// 	this.calculateType = type;
		// },
	},
};
</script>
