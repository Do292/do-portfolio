import { axiosService } from "./index.js";
import { useSystem } from "~/plugins/composables/authority";

function getApiPath(domain) {
	const { systemInfo } = useSystem();
	const commonPath = "/api/" + systemInfo.id + "/grid";
	return `${commonPath}/${domain}`;
}

function getAllTableDef() {
	return axiosService.get(getApiPath("/table/all"), {});
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

function getGridTableDef(menuId, gridId) {
	const params = { menuId, gridId };
	return axiosService.get(getApiPath("table"), {
		params,
	});
}

function getGridColumnDef(menuId, gridId) {
	const params = { menuId, gridId };
	return axiosService.get(getApiPath("column"), {
		params,
	});
}

export {
	getAllTableDef,
	getTableDef,
	getColumnDef,
	getGridTableDef,
	getGridColumnDef,
};
