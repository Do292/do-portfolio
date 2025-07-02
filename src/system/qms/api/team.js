import { axiosService } from "~/api/index.js";

function getApiPath(endPoint) {
	const commonPath = `/api/qms/team`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function save(data) {
	const path = getApiPath("compose");
	return axiosService.post(path, data);
}

export { save };
