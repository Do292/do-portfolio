import { axiosService } from "./index.js";
import { useSystem } from "~/plugins/composables/authority";

function getApiPath(domain, endPoint) {
	const { systemInfo } = useSystem();
	const commonPath = "/api/" + systemInfo.id + `/${domain}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

//==================== Search Condition
function getSearchCondition() {
	return axiosService.get(getApiPath("searchCondition"));
}
function getSearchConditionDetail(param) {
	return axiosService.get(getApiPath("searchCondition/detail" + `/${param}`));
}

function createSearchCondition(data) {
	return axiosService.post(getApiPath("searchCondition"), data);
}
function createSearchConditionDetail(data) {
	return axiosService.post(getApiPath("searchCondition/detail"), data);
}
function modifySearchCondition(data) {
	return axiosService.put(getApiPath("searchCondition"), data);
}
function modifySearchConditionDetail(data) {
	return axiosService.put(getApiPath("searchCondition/detail"), data);
}
function deleteSearchCondition(data) {
	return axiosService.delete(getApiPath("searchCondition"), { data });
}
function deleteSearchConditionDetail(data) {
	return axiosService.delete(getApiPath("searchCondition/detail"), { data });
}
function getUserSearchCondition(param) {
	return axiosService.get(getApiPath("userSearchCondition" + `?${param}`));
}
function saveUserSearchCondition(data) {
	return axiosService.post(getApiPath("userSearchCondition"), data);
}

//==================== Meta Data
function getAllMetaData() {
	return axiosService.get(getApiPath("metaData/all"));
}
function getMetaData(metaDataId) {
	const params = { metaDataId };
	return axiosService.get(getApiPath("metaData"), {
		params,
	});
}
function getMetaDataDetail(param) {
	return axiosService.get(getApiPath("metaData/detail" + `/${param}`));
}

function createMetaData(data) {
	return axiosService.post(getApiPath("metaData"), data);
}
function createMetaDataDetail(data) {
	return axiosService.post(getApiPath("metaData/detail"), data);
}
function modifyMetaData(data) {
	return axiosService.put(getApiPath("metaData"), data);
}
function modifyMetaDataDetail(data) {
	return axiosService.put(getApiPath("metaData/detail"), data);
}
function deleteMetaData(data) {
	return axiosService.delete(getApiPath("metaData"), { data });
}
function deleteMetaDataDetail(data) {
	return axiosService.delete(getApiPath("metaData/detail"), { data });
}

//==================== Custom Query
function getByCustomQuery(data) {
	return axiosService.post(getApiPath("query/execute"), data.searchCondition);
}
//==================== Input Expression
function getByInputQuery(query, condition) {
	const path = getApiPath("query", "native");
	return axiosService.post(path, { query, condition });
}

//==================== Enum
function getEnumList() {
	return axiosService.get(getApiPath("enum"));
}
function getEnumValueList(enumName) {
	return axiosService.get(getApiPath("enum", enumName + "/values"));
}

function createEnum(data) {
	return axiosService.post(getApiPath("enum"), data);
}
function createEnumValue(data) {
	return axiosService.post(getApiPath("enum", "value"), data);
}

function modifyEnum(data) {
	return axiosService.put(getApiPath("enum"), data);
}
function modifyEnumValue(data) {
	return axiosService.put(getApiPath("enum", "value"), data);
}
function deleteEnum(data) {
	return axiosService.delete(getApiPath("enum"), { data });
}
function deleteEnumValue(data) {
	return axiosService.delete(getApiPath("enum", "value"), { data });
}

//==================== Grid
function getAllGridTableDef() {
	return axiosService.get(getApiPath("grid/table/all"), {});
}

function getGridTableDef(menuId, gridId) {
	const params = { menuId, gridId };
	return axiosService.get(getApiPath("grid", "table"), {
		params,
	});
}

function getGridColumnDef(menuId, gridId) {
	const params = { menuId, gridId };
	return axiosService.get(getApiPath("grid", "column"), {
		params,
	});
}

function createGridTableDef(data) {
	return axiosService.post(getApiPath("grid", "table"), data);
}
function createGridColumnDef(data) {
	return axiosService.post(getApiPath("grid", "column"), data);
}

function modifyGridTableDef(data) {
	return axiosService.put(getApiPath("grid", "table"), data);
}
function modifyGridColumnDef(data) {
	return axiosService.put(getApiPath("grid", "column"), data);
}
function deleteGridTableDef(data) {
	return axiosService.delete(getApiPath("grid", "table"), { data });
}
function deleteGridColumnDef(data) {
	return axiosService.delete(getApiPath("grid", "column"), { data });
}

//==================== Grid
function getBy(params) {
	const path = getApiPath("Menu", "queryCondition");
	return axiosService.get(path, { params });
}

function getTableDef(tableId) {
	const params = { tableId };
	return axiosService.get("/api/table/tableDef", {
		params,
	});
}

function getColumnDef(tableId) {
	const params = { tableId };
	return axiosService.get("/api/table/columnDef", {
		params,
	});
}

export {
	getSearchCondition,
	getSearchConditionDetail,
	createSearchCondition,
	createSearchConditionDetail,
	modifySearchCondition,
	modifySearchConditionDetail,
	deleteSearchCondition,
	deleteSearchConditionDetail,
	getAllMetaData,
	getMetaData,
	getMetaDataDetail,
	createMetaData,
	createMetaDataDetail,
	modifyMetaData,
	modifyMetaDataDetail,
	deleteMetaData,
	deleteMetaDataDetail,
	getByInputQuery,
	getByCustomQuery,
	getEnumList,
	getEnumValueList,
	createEnum,
	createEnumValue,
	modifyEnum,
	modifyEnumValue,
	deleteEnum,
	deleteEnumValue,
	getAllGridTableDef,
	getGridTableDef,
	getGridColumnDef,
	createGridTableDef,
	createGridColumnDef,
	modifyGridTableDef,
	modifyGridColumnDef,
	deleteGridTableDef,
	deleteGridColumnDef,
	getBy,
	getUserSearchCondition,
	saveUserSearchCondition,

	// 확인 후 삭제할 수도 있음.
	getTableDef,
	getColumnDef,
};
