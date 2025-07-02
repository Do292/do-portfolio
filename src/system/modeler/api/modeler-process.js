import { axiosService } from "./index.js";

function getApiPath(domain, endPoint) {
	const commonPath = `/api/modeler/${domain}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function cloneFlowContent(dto) {
	const path = getApiPath("processFlowContent", "clone");
	return axiosService.patch(path, dto);
}

function cloneSpecContent(dto) {
	const path = getApiPath("processSpecContent", "clone");
	return axiosService.patch(path, dto);
}

export { cloneFlowContent, cloneSpecContent };
