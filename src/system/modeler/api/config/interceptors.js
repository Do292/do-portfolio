import router from "~/router";
import store from "~/store";

let isLogin = false;
const refreshUrl = "/api/v1/user/refresh-token";
// const refreshUrl = "/refresh-token";
let isTokenRefresh = false;
let refreshSubscribers = [];

const onTokenRefreshed = () => {
	refreshSubscribers.map(callback => callback());
	isTokenRefresh = false;
	refreshSubscribers = [];
};

const addRefreshSubscriber = callback => {
	refreshSubscribers.push(callback);
};

function getRefreshTokenParams() {
	if (store.getters.getUserInfo !== null) {
		let userId = store.getters.getUserInfo.userId;
		if (userId !== null) {
			let token = JSON.parse(sessionStorage.getItem("token"));
			let tokenData = Object.assign({ userId: userId }, token);
			return tokenData;
		}
	}
	return "";
}

function setRefreshToken(data) {
	isTokenRefresh = true;
	const newToken = {
		accessToken: data.data.accessToken,
		refreshToken: data.data.refreshToken,
		grantType: data.data.grantType,
	};
	store.commit("SET_TOKEN", newToken);
}

function setInterceptors(instance) {
	instance.interceptors.request.use(
		config => {
			// config.headers = { "Content-Type": "application/json" };
			config.headers["Content-Type"] = "application/json; charset=utf-8";

			config.headers["Authorization"] =
				"Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBRE1JTiIsImlhdCI6MTcwODQwODA0NywiZXhwIjoxNzA4NTg4MDQ3fQ.qt7gwyXu0H4OmQxwWRl3JFEE5-qvqgEg7ej39se_Z9ri_uUtrwl70Qy_E59hQQ_UmEwamITNNRc9yEvNMULUJA";
			return config;
		},
		// error => Promise.reject(error.response),
		error => {
			return Promise.reject(error.response);
		},
	);
	instance.interceptors.response.use(
		config => {
			isLogin = false;
			return config;
		},
		error => {
			const { response, config } = error;
			if (response) {
				// 권한없음.
				if (response.status === 401) {
					const useToken =
						JSON.parse(import.meta.env.VITE_APP_USE_TOKEN) || false;
					if (useToken) {
						let url = config.url;
						// 처음 401이면 refresh token api 호출
						// refresh token이 다시 401이면 root 이동
						if (url.includes(refreshUrl)) {
							let localItems = Object.keys(localStorage);
							for (let k of localItems) {
								if (k !== "rememberId") {
									localStorage.removeItem(k);
								}
							}
							// CLIENT 세션 초기화
							store.commit("SET_FLAG_LOGIN", false);
							// ROOT(login)로 이동
							router
								.push({ path: import.meta.env.BASE_URL })
								.catch(() => {});
							isLogin = true;
							isTokenRefresh = false;
						} else {
							if (isLogin) {
								router
									.push({ path: import.meta.env.BASE_URL })
									.catch(() => {});
								return response;
							}
							if (!isTokenRefresh) {
								isTokenRefresh = true;
								setTimeout(() => {
									let tokenData = getRefreshTokenParams();
									instance
										.post(refreshUrl, tokenData)
										.then(res => {
											if (res.data.result === "SUCCESS") {
												// 새로운 토큰 저장
												setRefreshToken(res.data);
												onTokenRefreshed();
											}
										})
										.catch(e => {
											router
												.push({
													path: import.meta.env
														.BASE_URL,
												})
												.catch(() => {});
											return e;
										});
								}, 1000);

								// // let {
								// // 	refreshToken: refreshAccessToken,
								// // 	// grantType: refreshGrantType,
								// // } = data.data;
								// // instance.defaults.headers.common.Authorization = `${refreshGrantType} ${refreshAccessToken}`;
								// // 새로운 토큰으로 지연되었던 요청 진행
								// // request에서 token 넣어주기때문에 refreshToken 안넣어줘도 될듯.
								// onTokenRefreshed();
								// // onTokenRefreshed(refreshAccessToken);
								// token이 재발급 되는 동안의 요청은 refreshSubscribers에 저장
								// return new Promise(resolve => {
								// 	addRefreshSubscriber(() => {
								// 		// config.headers.Authorization = `bearer ${accessToken}`;
								// 		resolve(instance(config));
								// 	});
								// });
							}
							// token이 재발급 되는 동안의 요청은 refreshSubscribers에 저장
							return new Promise(resolve => {
								addRefreshSubscriber(() => {
									resolve(instance(config));
								});
							});
						}
					}
				}
			}
			// 인터페이스에 의해 반환 된 오류 메시지를 반환
			return Promise.reject(response);
		},
	);
	return instance;
}

export { setInterceptors };
