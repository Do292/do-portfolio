import { axiosService } from "./index.js";

function getApiPath(domain, endPoint) {
	const commonPath = `/api/modeler/${domain.toLowerCase()}`;
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
function getBy(tableId, params = {}) {
	const path = getApiPath(tableId, "condition");
	return axiosService.get(path, { params });
}

function filterBy(tableId, params = {}, caseSeinsitive = false) {
	const endPoint = caseSeinsitive
		? "queryConditionLike"
		: "queryConditionLikeInsens";

	return axiosService.get(getApiPath(tableId, endPoint), { params });
}

function create(tableId, dto) {
	const path = getApiPath(tableId);
	return axiosService.post(path, dto);
}

function modify(tableId, dto) {
	const path = getApiPath(tableId);
	return axiosService.put(path, dto);
}

function remove(tableId, dto) {
	const path = getApiPath(tableId, "specRemove");
	return axiosService.patch(path, dto);
}

function clone(tableId, dto) {
	const path = getApiPath(tableId, "clone");
	return axiosService.patch(path, dto);
}

function apply(tableId, dto) {
	return axiosService.patch(getApiPath(tableId), dto);
}

//==================== Check State
function checkIn(tableId, dto) {
	const path = getApiPath(tableId, "checkedIn");
	return axiosService.patch(path, dto);
}

function checkOut(tableId, dto) {
	const path = getApiPath(tableId, "checkedOut");
	return axiosService.patch(path, dto);
}

//==================== History
function getHistory(tableId, data) {
	const path = getApiPath(tableId, "history");
	return axiosService.post(path, data);
}

//==================== Input Expression
function getByQuery(query, condition) {
	const path = getApiPath("common", "expression");
	return axiosService.post(path, { query, condition });
}

export {
	// Auth
	logIn,
	refresh,

	// CRUD
	getBy,
	filterBy,
	create,
	modify,
	remove,
	clone,
	apply,

	// Check State
	checkIn,
	checkOut,

	// History
	getHistory,

	// Input Expression
	getByQuery,
};
