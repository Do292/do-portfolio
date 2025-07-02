import { axiosService } from "~/api/index.js";

function getApiPath(domain, endPoint) {
	const commonPath = "/api/mes/" + `${domain}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

// function hold(metaDataId, data) {
// 	const path = getApiPath(metaDataId, "hold");
// 	return axiosService.post(path, data);
// }

// function release(metaDataId, data) {
// 	const path = getApiPath(metaDataId, "release");
// 	return axiosService.post(path, data);
// }

/**
 *
 * @param {*} metaDataId
 * @param {*} action // hold, release, reject
 * @param {*} data
 * @returns
 */
function doAction(metaDataId, action, data) {
	const path = getApiPath(metaDataId, `${action}`);
	return axiosService.post(path, data);
}

export {
	// hold, release,
	doAction,
};
