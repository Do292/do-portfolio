import { axiosService } from "./index.js";

// example
function login(userId, password) {
	let path = "/api/signin"; //call login api
	/*
	 1.login Controller 에서 Parameter를 아래와 같이 받는 경우 
	 @PostMapping("/login")
     public boolean userLoggedIn(String userID, String password)
	*/
	let info = {
		params: {
			userId: userId,
			password: password,
		},
	};
	return axiosService.post(path, {}, info);
}

function login2(userId, password) {
	let path = "/login";
	/*
	 2.login Controller 에서 Body로 받는 경우 
	 @PostMapping("/login")
     public boolean userLoggedIn(@RequestBody Map<String, Object> paramMap)
	*/
	let info = {
		userId: userId,
		password: password,
	};
	return axiosService.post(path, info);
}

export { login, login2 };
