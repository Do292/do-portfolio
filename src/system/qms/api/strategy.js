import { axiosService } from "~/api/index.js";
import { useNaming } from "~/plugins/composables/locale";

function getApiPath(domain, endPoint) {
	const { pascalToCamel } = useNaming();
	const commonPath = `/api/qms/${pascalToCamel(domain)}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

//==================== Strategy Case
function revert(typeId, id) {
	const path = getApiPath(typeId, "return");
	return axiosService.post(path, {}, { params: { id } });
}

function submit(typeId, id) {
	const path = getApiPath(typeId, "confirm");
	return axiosService.post(path, {}, { params: { id } });
}

//==================== Strategy Step
function create(stepId, typeId, data) {
	const path = getApiPath(stepId, typeId);
	return axiosService.post(path, data);
}

export {
	// Case
	revert,
	submit,

	// Step
	create,
};
