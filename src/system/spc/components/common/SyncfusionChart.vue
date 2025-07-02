<template>
	<div class="chart-bg">
		<ejs-chart
			:id="id"
			:ref="id"
			:allowExport="allowExport"
			:background="background"
			:backgroundImage="backgroundImage"
			:border="border"
			:crosshair="crosshair"
			:description="description"
			:enableExport="enableExport"
			:height="height"
			:highlightColor="highlightColor"
			:highlightMode="highlightMode"
			:isMultiSelect="isMultiSelect"
			:isTransposed="isTransposed"
			:legendSettings="legendSettings"
			:margin="margin"
			:primaryXAxis="primaryXAxis"
			:primaryYAxis="primaryYAxis"
			:selectedDataIndexes="selectedDataIndexes"
			:selectionMode="selectionMode"
			:selectionPattern="selectionPattern"
			:series="series"
			:subTitle="subTitle"
			:subTitleStyle="subTitleStyle"
			:theme="theme"
			:title="title"
			:titleStyle="titleStyle"
			:tooltip="tooltip"
			:useGroupingSeparator="useGroupingSeparator"
			:width="width"
			:zoomSettings="zoomSettings"
			@afterExport="afterExport"
			@animationComplete="animationComplete"
			@annotationRender="annotationRender"
			@axisLabelClick="axisLabelClick"
			@axisLabelRender="axisLabelRender"
			@axisMultiLabelRender="axisMultiLabelRender"
			@axisRangeCalculated="axisRangeCalculated"
			@beforeExport="beforeExport"
			@beforePrint="beforePrint"
			@beforeResize="beforeResize"
			@chartDoubleClick="chartDoubleClick"
			@chartMouseClick="chartMouseClick"
			@chartMouseDown="chartMouseDown"
			@chartMouseLeave="chartMouseLeave"
			@chartMouseMove="chartMouseMove"
			@chartMouseUp="chartMouseUp"
			@dragComplete="dragComplete"
			@legendClick="legendClick"
			@legendRender="legendRender"
			@load="load"
			@loaded="loaded"
			@multiLevelLabelClick="multiLevelLabelClick"
			@onZooming="onZooming"
			@pointClick="pointClick"
			@pointDoubleClick="pointDoubleClick"
			@pointMove="pointMove"
			@pointRender="pointRender"
			@resized="resized"
			@scrollChanged="scrollChanged"
			@scrollEnd="scrollEnd"
			@scrollStart="scrollStart"
			@selectionComplete="selectionComplete"
			@seriesRender="seriesRender"
			@sharedTooltipRender="sharedTooltipRender"
			@textRender="textRender"
			@tooltipRender="tooltipRender"
			@zoomComplete="zoomComplete"
		>
			<e-series-collection>
				<e-series
					v-for="(item, index) of series"
					:key="index"
					:binInterval="item.binInterval"
					:color="item.color"
					:colorName="item.colorName ? item.colorName : 'red'"
					:columnSpacing="item.columnSpacing"
					:columnWidth="item.columnWidth"
					:cornerRadius="item.cornerRadius"
					:dashArray="item.dashArray"
					:dataSource="item.dataSource"
					:enableTooltip="item.enableTooltip"
					:fill="item.fill"
					:groupName="item.groupName"
					:high="item.highs"
					:legendShape="item.legendShape"
					:low="item.low"
					:marker="item.marker"
					:maxRadius="item.maxRadius"
					:minRadius="item.minRadius"
					:name="item.name"
					:nonHighlightStyle="item.nonHighlightStyle"
					:opacity="item.opacity"
					:pointColorMapping="item.pointColorMapping"
					:segmentAxis="item.segmentAxis"
					:segments="item.segments"
					:showNormalDistribution="item.showNormalDistribution"
					:size="item.size"
					:splineType="item.splineType"
					:stackingGroup="item.stackingGroup"
					:tooltipMappingName="item.tooltipMappingName"
					:trendlines="item.trendlines"
					:type="item.type"
					:visible="item.visible"
					:width="item.width"
					:xAxisName="item.xAxisName"
					:xName="item.xName"
					:yAxisName="item.yAxisName"
					:yName="item.yName"
					:zOrder="item.zOrder"
				>
				</e-series>
			</e-series-collection>
		</ejs-chart>
	</div>
</template>

<script>
import {
	ChartComponent,
	SeriesCollectionDirective,
	SeriesDirective,
	ColumnSeries,
	StackingColumnSeries,
	StackingBarSeries,
	BarSeries,
	RangeColumnSeries,
	LineSeries,
	MultiColoredLineSeries,
	SplineSeries,
	StepLineSeries,
	StackingLineSeries,
	HistogramSeries,
	ParetoSeries,
	WaterfallSeries,
	BoxAndWhiskerSeries,
	CandleSeries,
	HiloOpenCloseSeries,
	HiloSeries,
	RadarSeries,
	PolarSeries,
	BubbleSeries,
	ScatterSeries,
	SplineAreaSeries,
	StepAreaSeries,
	StackingStepAreaSeries,
	StackingAreaSeries,
	SplineRangeAreaSeries,
	RangeStepAreaSeries,
	RangeAreaSeries,
	AreaSeries,
	Legend,
	Tooltip,
	Category,
	DataLabel,
	DateTime,
	DateTimeCategory,
	Logarithmic,
	Highlight,
	Zoom,
	ScrollBar,
	DataEditing,
	Selection,
	StripLine,
	Export,
	Crosshair,
	ErrorBar,
	MultiLevelLabel,
} from "@syncfusion/ej2-vue-charts";
/**
 * @modules WFLChart
 * @author 정지현 <jhjung94@aim.co.kr>
 * @since 1.0.0
 * @version 1.0.4
 * @description WFLChart (wfl-chart)
 * @copyright Copyright 2023 Aim System Corporation Inc.
 * @see [Syncfusion]
 * [Guide]{@link https://ej2.syncfusion.com/vue/documentation/chart/vue-3-getting-started} |
 * [Component]{@link https://ej2.syncfusion.com/vue/documentation/api/chart/} |
 * [Demo]{@link https://ej2.syncfusion.com/vue/demos/#/material3/chart/line.html}
 *
 * @vue-prop {String} [id="chart"] - chart component id
 * @vue-prop {Boolean} [allowExport=false] - To enable export feature in blazor chart.
 * @vue-prop {String} [background=null] - The background color of the chart that accepts value in hex and rgba as a valid CSS color string.
 * @vue-prop {String} [backgroundImage=null] - The background image of the chart that accepts value in string as url link or location of an image.
 * @vue-prop {Object} [border={}] - Options for customizing the color and width of the chart border.
 * @vue-prop {CrosshairSettingsModel} [crosshair=null] - Options for customizing the crosshair of the chart. See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/crosshairSettingsModel/" target="_blank">CrosshairSettingsModel</a>
 * @vue-prop {String} [description=null] - Description for chart.
 * @vue-prop {Boolean} [enableExport=true] - To enable export feature in chart.
 * @vue-prop {Object} [exportModule={}] - Export Module is used to export chart.
 * @vue-prop {Boolean} [enableExport=true] - To enable export feature in chart.
 * @vue-prop {Object} [exportModule={}] - Export Module is used to export chart.
 * @vue-prop {String} [height=null] - The height of the chart as a string accepts input both as ‘100px’ or ‘100%‘. If specified as ‘100%,<br> chart renders to the full height of its parent element.
 * @vue-prop {String} [highlightColor=""] - Define the color for the data point on highlight.
 * @vue-prop {String} [highlightMode="None"] - Specifies whether series or data point has to be selected. They are none(Disables),series, point, cluster
 * @vue-prop {Boolean} [isMultiSelect=false] - If set true, enables the multi selection in chart. It requires selectionMode to be Point|Series|Cluster.
 * @vue-prop {Boolean} [isTransposed=false] - It specifies whether the chart should be render in transposed manner or not.
 * @vue-prop {Object} [legendSettings={visible: true}] - Options for customizing the legend of the chart.
 * @vue-prop {Object} [margin=null] - Options to customize left, right, top and bottom margins of the chart. (bottom, left, right, top)
 * @vue-prop {AxisModel} [primaryXAxis={}] - Options to configure the horizontal axis. See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/axisModel/" target="_blank">AxisModel</a>
 * @vue-prop {AxisModel} [primaryYAxis={}] - Options to configure the vertical axis. See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/axisModel/" target="_blank">AxisModel</a>
 * @vue-prop {IndexesModel[]} [selectedDataIndexes=[]] - Specifies the point indexes to be selected while loading a chart. <br> It requires selectionMode or highlightMode to be Point|Series|Cluster. 
 *                                                       See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/indexesModel/" target="_blank">IndexesModel</a>
 * @vue-prop {SelectionMode} [selectionMode="none"] - Specifies whether series or data point has to be selected. See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/selectionMode/" target="_blank">SelectionMode</a>
 * @vue-prop {SelectionPattern} [selectionPattern="none"] - Specifies whether series or data point has to be selected. See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/selectionPattern/" target="_blank">SelectionPattern</a>
 * @vue-prop {SeriesModel} [series=null] - The configuration for series in the chart. See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/seriesModel/" target="_blank">SeriesModel</a>
			<hr>
			<strong>[Series Sample]</strong><br>
			series: {<br>
			&nbsp;&nbsp;&nbsp;&nbsp; color: null, <br>
			&nbsp;&nbsp;&nbsp;&nbsp; colorName: "red", <br>
			&nbsp;&nbsp;&nbsp;&nbsp; dashArray: null,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; dataSource: null,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; enableTooltip: true,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; fill: "red",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; groupName: "",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; high: "",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; legendShape: "Circle",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; low: "",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; marker: { dataLabel: { visible: false, position: "Top", font: { fontWeight: "600", color: "#ffffff" },},},<br>
			&nbsp;&nbsp;&nbsp;&nbsp; name: "",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; nonHighlightStyle: "",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; opacity: 1,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; pointColorMapping: null,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; segmentAxis: null,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; segments: null,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; tooltipMappingName: "MappingName",<br>
			&nbsp;&nbsp;&nbsp;&nbsp; trendlines: null,<br>
			&nbsp;&nbsp;&nbsp;&nbsp; type: "Line"<br>
			&nbsp;&nbsp;&nbsp;&nbsp; visible: true<br>
			&nbsp;&nbsp;&nbsp;&nbsp; xAxisName: ""<br>
			&nbsp;&nbsp;&nbsp;&nbsp; xName: ""<br>
			&nbsp;&nbsp;&nbsp;&nbsp; yxisName: ""<br>
			&nbsp;&nbsp;&nbsp;&nbsp; yName: ""<br>
			&nbsp;&nbsp;&nbsp;&nbsp; zOrder: ""<br>
			}<br>
 * @vue-prop {String} [subTitle=""] - SubTitle of the chart.
 * @vue-prop {FontModel} [subTitleStyle=null] - Options for customizing the Subtitle of the Chart. See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/fontModel/" target="_blank">FontModel</a>
 * @vue-prop {String} [theme="Material"] - Specifies the theme for the chart.
 * @vue-prop {String} [title=""] - Title of the chart
 * @vue-prop {TitleSettingsModel} [titleStyle=null] - Options for customizing the Subtitle of the Chart.  See <a href="https://ej2.syncfusion.com/vue/documentation/api/chart/titleSettingsModel/" target="_blank">TitleSettingsModel</a>
 * @vue-prop {String} [theme="Material"] - Specifies the theme for the chart.
 * @vue-prop {Object} [tooltip={enable: true, shared: true}] - Options for customizing the tooltip of the chart.
 * @vue-prop {String} [width="100%"] - The width of the chart as a string accepts input as both like ‘100px’ or ‘100%‘. <br>If specified as ‘100%, chart renders to the full width of its parent element.
 * @vue-prop {Boolean} [useGroupingSeparator=false] - since 1.0.4, Specifies whether a grouping separator should be used for a number.
 * @vue-prop {Object} [zoomSettings={ <br>&nbsp;&nbsp;enableMouseWheelZooming: false, <br>&nbsp;&nbsp; enablePinchZooming: false, <br>&nbsp;&nbsp;enableSelectionZooming: false <br>}] - Options to enable the zooming feature in the chart.
 * 
 *
 * @vue-event {Object} afterExport - Triggers after the export completed.
 * @vue-event {Object} animationComplete - Triggers after animation is completed for the series.
 * @vue-event {Object} annotationRender - Triggers before the annotation gets rendered.
 * @vue-event {Object} axisLabelClick - Triggers when x axis label clicked.
 * @vue-event {Object} axisLabelRender - Triggers before each axis label is rendered.
 * @vue-event {Object} axisMultiLabelRender - Triggers before each axis multi label is rendered.
 * @vue-event {Object} axisRangeCalculated - Triggers before each axis range is rendered.
 * @vue-event {Object} beforeExport - Triggers before the export gets started.
 * @vue-event {Object} beforePrint - Triggers before the prints gets started.
 * @vue-event {Object} beforeResize - Triggers before resizing of chart
 * @vue-event {Object} chartDoubleClick - Triggers on double clicking the chart.
 * @vue-event {Object} chartMouseClick - Triggers on clicking the chart.
 * @vue-event {Object} chartMouseDown - Triggers on mouse down.
 * @vue-event {Object} chartMouseLeave - Triggers when cursor leaves the chart.
 * @vue-event {Object} chartMouseMove - Triggers on hovering the chart.
 * @vue-event {Object} chartMouseUp - Triggers on mouse up.
 * @vue-event {Object} dragComplete - Triggers after the drag selection is completed.
 * @vue-event {Object} legendClick - Triggers after click on legend.
 * @vue-event {Object} legendRender - Triggers before the legend is rendered.
 * @vue-event {Object} load - Triggers before chart load.
 * @vue-event {Object} loaded - Triggers after chart load.
 * @vue-event {Object} multiLevelLabelClick - Triggers after click on multiLevelLabelClick.
 * @vue-event {Object} onZooming - Triggers after the zoom selection is triggered.
 * @vue-event {Object} pointClick - Triggers on point click.
 * @vue-event {Object} pointDoubleClick - Triggers on point double click.
 * @vue-event {Object} pointMove - Triggers on point move.
 * @vue-event {Object} pointRender - Triggers before each points for the series is rendered.
 * @vue-event {Object} resized - Triggers after resizing of chart.
 * @vue-event {Object} scrollChanged - Triggers when change the scroll.
 * @vue-event {Object} scrollEnd - Triggers after the scroll end.
 * @vue-event {Object} scrollStart - Triggers when start the scroll.
 * @vue-event {Object} selectionComplete - Triggers after the selection is completed.
 * @vue-event {Object} seriesRender - Triggers before the series is rendered.
 * @vue-event {Object} sharedTooltipRender - Triggers before the shared tooltip for series is rendered.
 * @vue-event {Object} textRender - Triggers before the data label for series is rendered.
 * @vue-event {Object} tooltipRender - Triggers before the tooltip for series is rendered.
 * @vue-event {Object} zoomComplete - Triggers after the zoom selection is completed.
 */
export default {
	name: "wfl-chart",
	components: {
		"ejs-chart": ChartComponent,
		"e-series-collection": SeriesCollectionDirective,
		"e-series": SeriesDirective,
	},
	props: {
		id: { type: String, required: false, default: "chart" },
		allowExport: { type: Boolean, default: true },
		background: { type: String, default: null },
		backgroundImage: { type: String, default: null },
		border: {
			type: Object,
			default: () => ({ color: "#ffffff", width: 1 }),
		},
		description: { type: String, default: null },
		crosshair: { type: Object, default: null },
		enableExport: { type: Boolean, default: true },
		exportModule: { type: Object },
		series: { type: Array, default: () => [] },
		height: { type: String, default: null },
		highlightColor: { type: String, default: "" },
		highlightMode: { type: String, default: "None" },
		isMultiSelect: { type: Boolean, default: false },
		isTransposed: { type: Boolean, required: false, default: false },
		legendSettings: { type: Object, default: () => ({ visible: true }) },
		margin: { type: Object, default: () => ({}) },
		primaryXAxis: { type: Object, required: false, default: null },
		primaryYAxis: { type: Object, required: false, default: null },
		selectedDataIndexes: { type: Array, default: () => [] },
		selectionMode: { type: String, required: false, default: "none" },
		selectionPattern: { type: String, required: false, default: "none" },
		subTitle: { type: String, required: false, default: "" },
		subTitleStyle: { type: Object, default: () => ({}) },
		theme: { type: String, default: "Material" },
		title: { type: String, required: false, default: "Chart" },
		titleStyle: { type: Object, default: () => ({}) },
		tooltip: {
			type: Object,
			default: () => ({ enable: true, shared: true }),
		},
		useGroupingSeparator: {
			type: Boolean,
			required: false,
			default: false,
		},
		width: { type: String, required: false, default: "100%" },
		zoomSettings: {
			type: Object,
			default: () => ({
				enableMouseWheelZooming: false,
				enablePinchZooming: false,
				enableSelectionZooming: false,
			}),
		},
	},
	data() {
		return {};
	},
	provide: {
		chart: [
			ColumnSeries,
			StackingColumnSeries,
			StackingBarSeries,
			BarSeries,
			RangeColumnSeries,
			LineSeries,
			MultiColoredLineSeries,
			SplineSeries,
			StepLineSeries,
			StackingLineSeries,
			HistogramSeries,
			ParetoSeries,
			WaterfallSeries,
			BoxAndWhiskerSeries,
			CandleSeries,
			HiloOpenCloseSeries,
			HiloSeries,
			RadarSeries,
			PolarSeries,
			BubbleSeries,
			ScatterSeries,
			SplineAreaSeries,
			StepAreaSeries,
			StackingStepAreaSeries,
			StackingAreaSeries,
			SplineRangeAreaSeries,
			RangeStepAreaSeries,
			RangeAreaSeries,
			AreaSeries,
			Legend,
			Tooltip,
			Category,
			DataLabel,
			DateTime,
			DateTimeCategory,
			Logarithmic,
			Highlight,
			Zoom,
			ScrollBar,
			DataEditing,
			Selection,
			StripLine,
			Export,
			Crosshair,
			ErrorBar,
			MultiLevelLabel,
		],
	},
	emits: [
		"afterExport",
		"animationComplete",
		"annotationRender",
		"axisLabelClick",
		"axisLabelRender",
		"axisMultiLabelRender",
		"axisRangeCalculated",
		"beforeExport",
		"beforePrint",
		"beforeResize",
		"chartDoubleClick",
		"chartMouseClick",
		"chartMouseDown",
		"chartMouseLeave",
		"chartMouseMove",
		"chartMouseUp",
		"dragComplete",
		"legendClick",
		"legendRender",
		"load",
		"loaded",
		"multiLevelLabelClick",
		"onZooming",
		"pointClick",
		"pointDoubleClick",
		"pointMove",
		"pointRender",
		"resized",
		"scrollChanged",
		"scrollEnd",
		"scrollStart",
		"selectionComplete",
		"seriesRender",
		"sharedTooltipRender",
		"textRender",
		"tooltipRender",
		"zoomComplete",
	],
	created() {},
	mounted() {},
	methods: {
		/**
		 * @description Return chart instance by id.
		 * @returns {Object} line chart model object
		 */
		getChartModel() {
			return this.$refs[this.id].ej2Instances;
		},
		/**
		 * @description To set series for the chart
		 * @param seriesCollection {SeriesModel[]} Defines the series collection to be set in chart.
		 * @returns {void}
		 */
		setSeries(series) {
			this.$refs[this.id].ej2Instances.clearSeries();
			this.$refs[this.id].ej2Instances.addSeries(series);
		},
		/**
		 * @description To add secondary axis for the chart
		 * @param axisCollection {AxisModel[]} Defines the axis collection to be added in chart.
		 * @returns {void}
		 */
		addAxes(axisCollection) {
			this.$refs[this.id].ej2Instances.addAxes(axisCollection);
		},
		/**
		 * @description To add series for the chart
		 * @param seriesCollection {SeriesModel[]} Defines the series collection to be added in chart.
		 * @returns {void}
		 */
		addSeries(seriesCollection) {
			this.$refs[this.id].ej2Instances.addSeries(seriesCollection);
		},
		/**
		 * @description To Clear all series for the chart
		 * @returns {void}
		 */
		clearSeries() {
			this.$refs[this.id].ej2Instances.clearSeries();
		},
		/**
		 * @description Method to create SVG element.
		 * @returns {void}
		 */
		createChartSvg() {
			this.$refs[this.id].ej2Instances.createChartSvg();
		},
		/**
		 * @description To destroy the widget
		 * @returns {void}
		 */
		destroy() {
			this.$refs[this.id].ej2Instances.destroy();
		},
		/**
		 * @description Export method for the chart.
		 * @param {String} type Set export type string value ["PNG"|"jpeg"|"PDF"]
		 * @param {String} filename Set export filename string value
		 * @returns {void}
		 */
		export(type, fileName) {
			this.$refs[this.id].ej2Instances.export(type, fileName);
		},
		/**
		 * @description Gets the localized label by locale keyword.
		 * @param {String} key - key
		 * @returns {String}
		 */
		getLocalizedLabel(key) {
			return this.$refs[this.id].ej2Instances.getLocalizedLabel(key);
		},
		/**
		 * @description Get component name
		 * @returns {String}
		 */
		getModuleName() {
			return this.$refs[this.id].ej2Instances.getModuleName();
		},
		/**
		 * @description Hides a crosshair in the chart.
		 * @returns {void}
		 */
		hideCrosshair() {
			let chart = this.$refs[this.id].ej2Instances;
			chart.crosshair.properties = { enable: false, lineType: "None" };
			this.refresh();
		},
		/**
		 * @description Hides a tooltip in the chart.
		 * @returns {String}
		 */
		hideTooltip() {
			let chart = this.$refs[this.id].ej2Instances;
			console.log(chart);
			chart.tooltip.properties.enable = false;
			this.refresh();
		},
		/**
		 * @description Handles the print method for chart control.
		 * @returns {void}
		 */
		print() {
			this.$refs[this.id].ej2Instances.print();
		},
		/**
		 * @description Fix for live data update flicker issue
		 * @returns {void}
		 */
		refreshLiveData() {
			return this.$refs[this.id].ej2Instances.refreshLiveData();
		},
		/**
		 * @description To remove secondary axis for the chart
		 * @param index {Number} Defines the axis collection to be removed in chart.
		 * @returns {void}
		 */
		removeAxis(index) {
			this.$refs[this.id].ej2Instances.removeAxis(index);
		},
		/**
		 * @description To Remove series for the chart
		 * @param index {Number} Defines the series index to be remove in chart series
		 * @returns {void}
		 */
		removeSeries(index) {
			this.$refs[this.id].ej2Instances.removeSeries(index);
		},
		/**
		 * @description Method to set the annotation content dynamically for chart.
		 * @returns {void}
		 */
		setAnnotationValue() {
			this.$refs[this.id].ej2Instances.setAnnotationValue();
		},
		/**
		 * @description Displays a crosshair for the chart.
		 * @param properties {CrosshairSettingsModel} - Specifies properties of crosshair. See {@link https://ej2.syncfusion.com/vue/documentation/api/chart/crosshairSettingsModel/#crosshairsettingsmodel | CrosshairSettingsModel}
		 * @returns {void}
		 */
		showCrosshair(properties) {
			let chart = this.$refs[this.id].ej2Instances;
			chart.crosshair.properties = properties;
			this.refresh();
		},
		/**
		 * @description Displays a tooltip
		 * @returns {void}
		 */
		showTooltip() {
			let chart = this.$refs[this.id].ej2Instances;
			chart.tooltip.properties.enable = true;
			this.refresh();
		},
		/**
		 * @description To refresh for the chart
		 * @returns {void}
		 */
		refresh() {
			this.$refs[this.id].ej2Instances.refresh();
		},

		afterExport(args) {
			this.$emit("afterExport", args);
		},
		animationComplete(args) {
			this.$emit("animationComplete", args);
		},
		annotationRender(args) {
			this.$emit("annotationRender", args);
		},
		axisLabelClick(args) {
			this.$emit("axisLabelClick", args);
		},
		axisLabelRender(args) {
			this.$emit("axisLabelRender", args);
		},
		axisMultiLabelRender(args) {
			this.$emit("axisMultiLabelRender", args);
		},
		axisRangeCalculated(args) {
			this.$emit("axisRangeCalculated", args);
		},
		beforeExport(args) {
			this.$emit("beforeExport", args);
		},
		beforePrint(args) {
			this.$emit("beforePrint", args);
		},
		beforeResize(args) {
			this.$emit("beforeResize", args);
		},
		chartDoubleClick(args) {
			this.$emit("chartDoubleClick", args);
		},
		chartMouseClick(args) {
			this.$emit("chartMouseClick", args);
		},
		chartMouseDown(args) {
			this.$emit("chartMouseDown", args);
		},
		chartMouseLeave(args) {
			this.$emit("chartMouseLeave", args);
		},
		chartMouseMove(args) {
			this.$emit("chartMouseMove", args);
		},
		chartMouseUp(args) {
			this.$emit("chartMouseUp", args);
		},
		dragComplete(args) {
			this.$emit("dragComplete", args);
		},
		legendClick(args) {
			this.$emit("legendClick", args);
		},
		legendRender(args) {
			this.$emit("legendRender", args);
		},
		load(args) {
			this.$emit("load", args);
		},
		loaded(args) {
			this.$emit("loaded", args);
		},
		multiLevelLabelClick(args) {
			this.$emit("multiLevelLabelClick", args);
		},
		onZooming(args) {
			this.$emit("onZooming", args);
		},
		pointClick(args) {
			this.$emit("pointClick", args);
		},
		pointDoubleClick(args) {
			this.$emit("pointDoubleClick", args);
		},
		pointMove(args) {
			this.$emit("pointMove", args);
		},
		pointRender(args) {
			this.$emit("pointRender", args);
		},
		resized(args) {
			this.$emit("resized", args);
		},
		scrollChanged(args) {
			this.$emit("scrollChanged", args);
		},
		scrollEnd(args) {
			this.$emit("scrollEnd", args);
		},
		scrollStart(args) {
			this.$emit("scrollStart", args);
		},
		selectionComplete(args) {
			this.$emit("afterExport", args);
		},
		seriesRender(args) {
			this.$emit("seriesRender", args);
		},
		sharedTooltipRender(args) {
			this.$emit("sharedTooltipRender", args);
		},
		textRender(args) {
			this.$emit("textRender", args);
		},
		tooltipRender(args) {
			this.$emit("tooltipRender", args);
		},
		zoomComplete(args) {
			this.$emit("zoomComplete", args);
		},
	},
};
</script>

<style></style>
