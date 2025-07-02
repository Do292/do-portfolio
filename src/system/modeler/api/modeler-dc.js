import { axiosService } from "./index.js";

function getApiPath(domain, endPoint) {
	const commonPath = `/api/modeler/${domain}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function cloneDCDefAll(dto) {
	const path = getApiPath("dCDef", "allClone");
	return axiosService.patch(path, dto);
}

export { cloneDCDefAll };
