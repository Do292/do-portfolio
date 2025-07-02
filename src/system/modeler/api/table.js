import { axiosService } from "./index.js";

function getApiPath(domain, endPoint) {
	const commonPath = `/api/modeler/${domain.toLowerCase()}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function getTableDef(metaDataId) {
	const params = { metaDataId };
	return axiosService.get(getApiPath("metadata", "queryCondition"), {
		params,
	});
}

function getColumnDef(metaDataId) {
	const params = { metaDataId };
	return axiosService.get(getApiPath("metadatadetail", "queryCondition"), {
		params,
	});
}

function getGridTableDef(menuId, gridId) {
	const params = { menuId, gridId };
	return axiosService.get(getApiPath("gridtabledef", "queryCondition"), {
		params,
	});
}

function getGridColumnDef(menuId, gridId) {
	const params = { menuId, gridId };
	return axiosService.get(getApiPath("gridcolumndef", "queryCondition"), {
		params,
	});
}

function refresh() {
	return axiosService.put(getApiPath());
}

export {
	getTableDef,
	getColumnDef,
	getGridTableDef,
	getGridColumnDef,
	refresh,
};
