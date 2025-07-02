import { axiosService } from "~/api/index.js";

function getApiPath(endPoint) {
	const commonPath = "/api/spc/rule";
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function getRule(params) {
	return axiosService.get(getApiPath(""), { params });
}
function createRule(data) {
	return axiosService.post(getApiPath(""), data);
}
function modifyRule(data) {
	return axiosService.put(getApiPath(""), data);
}
function deleteRule(data) {
	return axiosService.delete(getApiPath(""), { data });
}

export { getRule, createRule, modifyRule, deleteRule };
