import { axiosService } from "./index.js";

function getApiPath(endPoint) {
	const commonPath = "/api/modeler/userInfo";
	return `${commonPath}/${endPoint}`;
}

//==================== User Info
function create(dto) {
	const path = getApiPath("createUserInfo");
	return axiosService.post(path, dto);
}

function modify(dto) {
	const path = getApiPath("updateUserInfo");
	return axiosService.put(path, dto);
}

function updateImage(keyMap, binaryStr) {
	const path = getApiPath("updateUserInfo");
	return axiosService.put(path, { keyMap, binaryStr });
}

//==================== Auth
function logIn(userId, password) {
	const path = getApiPath("login");

	return axiosService.post(path, { userId, password });
}

function logOut(userId) {
	const path = getApiPath("logout");
	return axiosService.post(path, { userId });
}

function verify(userId, password) {
	const path = getApiPath("checkPassword");
	return axiosService.post(path, { userId, password });
}

function changePassword(dto) {
	const path = getApiPath("changePassword");
	return axiosService.post(path, dto);
}

function getMenuAuth(systemId, userId) {
	const params = { systemId, userId };
	const path = getApiPath("checkAuthority");
	return axiosService.get(path, { params });
}

function getMenuItemAuth(systemId, userId) {
	const params = { systemId, userId };
	const path = getApiPath("checkAuthorityItem");
	return axiosService.get(path, { params });
}

export {
	// User Info
	create,
	modify,
	updateImage,

	// Auth
	logIn,
	logOut,
	verify,
	changePassword,
	getMenuAuth,
	getMenuItemAuth,
};
