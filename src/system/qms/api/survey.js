import { axiosService } from "~/api/index.js";

function getApiPath(endPoint) {
	const commonPath = `/api/qms/survey`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function create(data) {
	const path = getApiPath();
	return axiosService.post(path, data);
}

function getSurveyItemsBy(params) {
	const path = getApiPath("item");
	return axiosService.get(path, { params });
}

function getResponsesBy(params) {
	const path = getApiPath("response");
	return axiosService.get(path, { params });
}

function getSummariesBy(params) {
	const path = getApiPath("summary");
	return axiosService.get(path, { params });
}

export { create, getSurveyItemsBy, getResponsesBy, getSummariesBy };
