import { axiosService } from "~/api/index.js";
import { useNaming } from "~/plugins/composables/locale";
// import store from "~/store";

function getApiPath(domain, endPoint) {
	const { pascalToCamel } = useNaming();
	const commonPath = `/api/mes/${pascalToCamel(domain)}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function getList(metaDataId, params = {}) {
	return axiosService.get(getApiPath(metaDataId), { params });
}

// Scan Obj
function getObjectType() {
	return axiosService.get(getApiPath("objectType"));
}
function getObjectTypeDetail(param) {
	return axiosService.get(getApiPath("objectType" + `/${param}`));
}

// Action
function create(metaDataId, data) {
	const path = getApiPath(metaDataId);
	return axiosService.post(path, data);
}

function modify(metaDataId, data) {
	const path = getApiPath(metaDataId);
	return axiosService.put(path, data);
}

function remove(metaDataId, data) {
	const path = getApiPath(metaDataId);
	return axiosService.delete(path, { data });
}

function execute(metaDataId, action, items) {
	const path = getApiPath(metaDataId, action);
	return axiosService.post(path, items);
}

export {
	getList,
	getObjectType,
	getObjectTypeDetail,
	create,
	modify,
	remove,
	execute,
};
