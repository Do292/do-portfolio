import { axiosService } from "~/api/index.js";

function getApiPath(endPoint = "") {
	const commonPath = "/api/mes/lot";
	return `${commonPath}/${endPoint}`;
}

/**
 *
 * @param {*} orderType (toCamelCase)
 * @param {*} orderId orderId
 * @returns
 */
function getWIPListByOrder({ params }) {
	const { orderType, orderId } = params;
	let param = { orderId: orderId };
	const queryParams = new URLSearchParams(param).toString();
	const url = getApiPath(`wip/${orderType}?${queryParams}`);
	return axiosService.get(url);
}

/**
 *
 * @param {*} orderType (toCamelCase)
 * @param {*} data orderId, processOperationId
 * @returns
 */
function getLotListByOperation({ params }) {
	const { orderType, data } = params;
	const queryParams = new URLSearchParams(data).toString();
	const url = getApiPath(
		`wip/${orderType}/processOperationId?${queryParams}`,
	);
	return axiosService.get(url);
}

/**
 *
 * @param {*} params productId
 * @returns
 */
function getLotListProduct({ params }) {
	const queryParams = new URLSearchParams(params).toString();
	const url = getApiPath(`productDef?${queryParams}`);
	return axiosService.get(url);
}

/**
 *
 * @param {*} params lotId
 * @returns
 */
function getLotHistory({ params }) {
	const queryParams = new URLSearchParams(params).toString();
	const url = getApiPath(`history?${queryParams}`);
	return axiosService.get(url);
}

export {
	getWIPListByOrder,
	getLotListByOperation,
	getLotListProduct,
	getLotHistory,
};
