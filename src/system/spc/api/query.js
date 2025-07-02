import { axiosService } from "~/api/index.js";

function getApiPath(endPoint) {
	const commonPath = "/api/spc/query";
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}
function createCustomQuery(data) {
	return axiosService.post(getApiPath(""), data);
}
function modifyCustomQuery(data) {
	return axiosService.put(getApiPath(""), data);
}
function deleteCustomQuery(data) {
	return axiosService.delete(getApiPath(""), { data });
}

export { createCustomQuery, modifyCustomQuery, deleteCustomQuery };
