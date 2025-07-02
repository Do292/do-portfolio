import { axiosService } from "./index.js";

function getApiPath(endPoint) {
	const commonPath = "/api/modeler/tree";
	return `${commonPath}/${endPoint}`;
}

function getBy(data) {
	const path = getApiPath("common");
	return axiosService.post(path, data);
}

function getFactory(condition = {}) {
	const path = getApiPath("factory");
	return axiosService.post(path, { condition });
}

function getEnum() {
	const path = getApiPath("enum");
	return axiosService.post(path, {});
}

function getReason() {
	const path = getApiPath("reason");
	return axiosService.post(path, {});
}

function getRecipe(condition = {}) {
	const path = getApiPath("recipe");
	return axiosService.post(path, { condition });
}

export { getBy, getFactory, getEnum, getReason, getRecipe };
