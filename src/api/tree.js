import { axiosService } from "./index.js";

function getBy(data) {
	return axiosService.post("/api/modeler/tree/common", data);
}

export { getBy };
