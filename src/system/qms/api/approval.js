import { axiosService } from "~/api/index.js";

function getApiPath(endPoint) {
	const commonPath = `/api/qms/approval`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function getBy(approvalId) {
	const path = getApiPath(approvalId);
	return axiosService.get(path);
}

function getRouteBy(approvalId) {
	const path = getApiPath(`route/${approvalId}`);
	return axiosService.get(path);
}

function create(data) {
	const path = getApiPath();
	return axiosService.post(path, data);
}

function request(data) {
	const path = getApiPath("request");
	return axiosService.post(path, data);
}

function cancel(data) {
	const path = getApiPath("cancel");
	return axiosService.post(path, data);
}

function approve(data) {
	const path = getApiPath("approve");
	return axiosService.post(path, data);
}

function reject(data) {
	const path = getApiPath("reject");
	return axiosService.post(path, data);
}

function executeRouteAction(action, data) {
	const path = getApiPath(action);
	return axiosService.post(path, data);
}

export {
	getBy,
	getRouteBy,
	create,
	request,
	cancel,
	approve,
	reject,
	executeRouteAction,
};
