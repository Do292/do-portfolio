import { axiosService } from "~/api/index.js";
import moment from "moment";
// import store from "~/store";

function getApiPath(endPoint = "") {
	const commonPath = "/api/mes/inspection";
	return `${commonPath}/${endPoint}`;
}

// todo cimCommandEvent
function requestItems(data, action) {
	let params = {
		body: data,
		cimCommandEvent: {
			event: "string",
			eventComment: "string",
			eventTime: moment().format("YYYY-MM-DD HH:mm:ss"),
			eventUser: "string",
			timeKey: "string",
		},
	};
	return axiosService.post(getApiPath(action), params);
}

export { requestItems };
