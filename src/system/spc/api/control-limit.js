import { axiosService } from "~/api/index.js";

function modifyData(data) {
	return axiosService.put("/api/spc/controlLimitData", data);
}

export { modifyData };
