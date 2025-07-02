import { axiosService } from "~/api/index.js";
// import store from "~/store";

function getApiPath(endPoint = "") {
	const commonPath = "/api/mes/material";
	return `${commonPath}/${endPoint}`;
}

function getListAll() {
	return axiosService.get(getApiPath("all"));
}
function getListByMaterialId(materialId) {
	return axiosService.get(getApiPath(`/${materialId}`));
}
function getListByMaterialDefId(materialDefId) {
	return axiosService.get(getApiPath("def" + `/${materialDefId}`));
}
function getListByInvoiceNo(invoiceNo) {
	return axiosService.get(getApiPath("invoiceNo" + `/${invoiceNo}`));
}
function getListByMap(params) {
	return axiosService.post(getApiPath("get/history"), params);
}

// todo cimCommandEvent
// MaterialInventoryStatus - Action
function doAction(data, action) {
	let params = {
		body: data,
		cimCommandEvent: {
			event: "string",
			eventComment: "string",
			eventUser: "string",
		},
	};

	return axiosService.post(getApiPath(action), params);
}

// Action
function inputItems(data, action) {
	let params = {
		body: data,
		cimCommandEvent: {
			event: "string",
			eventComment: "string",
			eventUser: "string",
		},
	};
	return axiosService.post(getApiPath(action), params);
}
function receiveItems(data, action) {
	let params = {
		body: data,
		cimCommandEvent: {
			event: "string",
			eventComment: "string",
			eventUser: "string",
		},
	};
	return axiosService.post(getApiPath(action), params);
}

export {
	getListAll,
	getListByMaterialId,
	getListByMaterialDefId,
	getListByInvoiceNo,
	getListByMap,
	doAction,
	receiveItems,
	inputItems,
};
