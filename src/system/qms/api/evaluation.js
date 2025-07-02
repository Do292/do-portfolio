import { axiosService } from "~/api/index.js";
import { useNaming } from "~/plugins/composables/locale";
import { META } from "~/system/qms/constants/qms_meta_constants.js";

function getApiPath(domain, endPoint) {
	const { pascalToCamel } = useNaming();
	const commonPath = `/api/qms/${pascalToCamel(domain)}`;
	return endPoint ? `${commonPath}/${endPoint}` : commonPath;
}

function getSummariesBy(params) {
	const path = getApiPath(META.EVALUATION_RESPONSE, "summary");
	return axiosService.get(path, { params });
}

function updateEvaluation(typeId, params) {
	const path = getApiPath(typeId, "evaluation");
	return axiosService.post(path, {}, { params });
}

export { getSummariesBy, updateEvaluation };
