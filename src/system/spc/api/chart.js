import { axiosService } from "~/api/index.js";
import { readonly } from "vue";

const CONTROL_CHART = readonly({
	Mean: "Xbar",
	Single: "I",
	Count: "NP",
});

function getApiPath(domain, endPoint) {
	const commonPath = "/api/spc/" + `${domain}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function getChartGroup(params) {
	return axiosService.get(getApiPath("chartGroup"), params);
}
function createChartGroup(data) {
	return axiosService.post(getApiPath("chartGroup"), data);
}
function moodifyChartGroup(data) {
	return axiosService.put(getApiPath("chartGroup"), data);
}
function deleteChartGroup(data) {
	return axiosService.delete(getApiPath("chartGroup"), { data });
}
function getChartTree(params) {
	return axiosService.get(getApiPath("chartGroup/chart"), params);
}

function getChartGroupCondition(params) {
	return axiosService.get(getApiPath("chartGroup", "condition"), params);
}
function createChartGroupCondition(data) {
	return axiosService.post(getApiPath("chartGroup", "condition"), data);
}
function moodifyChartGroupCondition(data) {
	return axiosService.put(getApiPath("chartGroup", "condition"), data);
}
function deleteChartGroupCondition(data) {
	return axiosService.delete(getApiPath("chartGroup", "condition"), { data });
}

function getAllChartList() {
	return axiosService.get(getApiPath("chart/def"));
}
function getChartByGroupId(params) {
	return axiosService.get(getApiPath("chart/def"), params);
}
function createChart(data) {
	data.map(f => (f.controlChartType = CONTROL_CHART[f.controlChartType]));
	return axiosService.post(
		getApiPath("chart/def/chartDefControlChart"),
		data,
	);
}
function modifyChart(data) {
	return axiosService.put(getApiPath("chart/def/chartDefControlChart"), data);
}
function modifyChartSpec(data) {
	return axiosService.put(getApiPath("chart/def"), data);
}
function deleteChart(data) {
	return axiosService.delete(getApiPath("chart/def"), { data });
}

function getControlChart(params) {
	return axiosService.get(getApiPath("chart/control"), params);
}
function modifyControlChart(data) {
	return axiosService.put(getApiPath("chart/control"), data);
}

function getChartSpec(chartId) {
	return axiosService.get(getApiPath("chart/spec", chartId));
}
function getChartControlSpec(chartId) {
	return axiosService.get(getApiPath("chart/controlSpec", chartId));
}

function getChartCustomSpec(chartId) {
	return axiosService.get(getApiPath("chart/customSpec", chartId));
}
function getChartRule({ params }) {
	return axiosService.get(getApiPath("chart/rule", params.chartId));
}

export {
	// ChartGroup
	getChartGroup,
	createChartGroup,
	moodifyChartGroup,
	deleteChartGroup,

	// Tree (ChartGroup > Chart)
	getChartTree,

	// ChartGroupCondition
	getChartGroupCondition,
	createChartGroupCondition,
	moodifyChartGroupCondition,
	deleteChartGroupCondition,

	// Chart
	getAllChartList,
	getChartByGroupId,
	getControlChart,
	modifyControlChart,
	createChart,
	modifyChart,
	deleteChart,
	modifyChartSpec,
	//Spec
	getChartSpec,
	getChartControlSpec,
	getChartCustomSpec,
	getChartRule,
};
