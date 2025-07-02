import { axiosService } from "~/api/index.js";

function getApiPath(endPoint = "") {
	const commonPath = "/api/mes/workOrder";
	return `${commonPath}/${endPoint}`;
}

/**
 *
 * @param {*} data work orderId
 * @returns
 */
function getOperationsByOrder(data) {
	const queryParams = new URLSearchParams(data).toString();
	const url = getApiPath(`processOperation?${queryParams}`);
	return axiosService.get(url);
}

/**
 *
 * @param {*} data work orderId
 * @returns
 */
function getBomListByOrder(data) {
	const queryParams = new URLSearchParams(data).toString();
	const url = getApiPath(`bom?${queryParams}`);
	return axiosService.get(url);
}

export { getOperationsByOrder, getBomListByOrder };
