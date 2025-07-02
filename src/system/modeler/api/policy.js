import { axiosService } from "./index.js";

function getApiPath(endPoint) {
	const commonPath = "/api/modeler/strategy";
	return `${commonPath}/${endPoint}`;
}

function getProcessOperation(params = {}) {
	const path = getApiPath("getProcessOperation");
	return axiosService.get(path, { params });
}

function getAllStretegy(params = {}) {
	const path = getApiPath("getAllStretegy");
	return axiosService.get(path, { params });
}

export { getProcessOperation, getAllStretegy };
