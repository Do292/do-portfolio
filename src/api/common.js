import { axiosService } from "./index.js";
import { useSystem } from "~/plugins/composables/authority";
import { useNaming } from "~/plugins/composables/locale";

function getApiPath(domain, endPoint) {
	const { systemInfo } = useSystem();
	const { pascalToCamel } = useNaming();
	const commonPath = `/api/${systemInfo.id}/${pascalToCamel(domain)}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

//==================== Auth
function logIn(id, password) {
	const path = getApiPath("common", "login");
	const params = { id, password };

	return axiosService.post(path, {}, { params });
}

function refresh() {
	axiosService.post(getApiPath("common", "refreshTableData"), {});
	axiosService.post(getApiPath("common", "refreshGridTableData"), {});
}

//==================== CRUD
// FormGrid의 customApi는 필요한 인자가 다양해, 확장성을 고려하여 인자를 객체형태로 정의함.
function getBy({ metaDataId, searchCondition = [], params }) {
	// Search 조건 없을 경우 getByParam 호출
	if (searchCondition.length === 0) {
		return getByParam(metaDataId, params);
	}

	const path = getApiPath(metaDataId, "condition");
	return axiosService.post(path, searchCondition);
}

function getByParam(metaDataId, params) {
	const path = getApiPath(metaDataId);
	return axiosService.get(path, { params });
}

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

export {
	// Auth
	logIn,
	refresh,

	// CRUD
	getBy,
	getByParam,
	create,
	modify,
	remove,
};
