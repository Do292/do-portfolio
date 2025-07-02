import { createStore } from "vuex";
// import {
// 	setLocalStorageItem,
// 	getLocalStorageItem,
// } from "~/utils/local-storage";

// Vue.use(Vuex);

export default createStore({
	state: {
		isLoggedIn: false,
		authentication: "admin",
		isLeftSideFixed: JSON.parse(localStorage.getItem("leftSideFixed")),
		isShowInformation: JSON.parse(localStorage.getItem("showInfo")),
		isFixedPin: JSON.parse(localStorage.getItem("fixedPin")),
		locale: "",
		userInfo: {
			userId: "",
			userName: "",
			email: "",
			menus: "",
		},
		currentObjAttrName: "",
		currentObjAttr: [],
		currentRowInfo: {},
		token: "",
		expires: "",
	},
	getters: {
		isLoggedIn(state) {
			let flag =
				state.isLoggedIn == "" ||
				state.isLoggedIn == null ||
				state.isLoggedIn == undefined
					? JSON.parse(localStorage.getItem("loggedIn"))
					: state.isLoggedIn;

			return flag;
		},
		getAuthentication(state) {
			return state.authentication;
		},
		isLeftSideFixed(state) {
			if (state.isLeftSideFixed) {
				return state.isLeftSideFixed;
			} else {
				return JSON.parse(localStorage.getItem("leftSideFixed"));
			}
		},
		isShowInformation(state) {
			return state.isShowInformation;
		},
		isFixedPin(state) {
			return state.isFixedPin;
		},
		getLocale(state) {
			if (localStorage.getItem("locale"))
				return localStorage.getItem("locale");
			else return state.locale;
		},
		getUserInfo(state) {
			let userInfo = state.userInfo;

			if (userInfo.userId) {
				return userInfo;
			} else {
				return JSON.parse(localStorage.getItem("userInfo"));
			}
		},
		getCurrentObjAttr(state) {
			return state.currentObjAttr;
		},
		getCurrentObjAttrName(state) {
			return state.currentObjAttrName;
		},
		getCurrentRowInfo(state) {
			return state.currentRowInfo;
		},
		getToken(state) {
			if (localStorage.getItem("token"))
				return localStorage.getItem("token");
			else return state.token;
		},
		getExpires(state) {
			if (localStorage.getItem("expires"))
				return localStorage.getItem("expires");
			else return state.expires;
		},
	},
	mutations: {
		SET_FLAG_LOGIN(state, flag) {
			state.isLoggedIn = flag;
			localStorage.setItem("loggedIn", flag);
		},
		SET_FLAG_LEFTSIDE_FIX(state, flag) {
			state.isLeftSideFixed = flag;
			localStorage.setItem("leftSideFixed", flag);
		},
		SET_FLAG_SHOWINFO(state, flag) {
			state.isShowInformation = flag;
			localStorage.setItem("showInfo", flag);
		},
		SET_FLAG_FIXPIN(state, flag) {
			state.isFixedPin = flag;
			localStorage.setItem("fixedPin", flag);
		},
		SET_LOCALE(state, locale) {
			state.locale = locale;
			localStorage.setItem("locale", locale);
		},
		SET_USERINFO(state, userInfo) {
			state.userInfo = userInfo;
			localStorage.setItem("userInfo", JSON.stringify(userInfo));
		},
		SET_CURRENTOBJATTRNAME(state, currentObjAttrName) {
			state.currentObjAttrName = currentObjAttrName;
		},
		SET_CURRENTOBJATTRINFO(state, currentObjAttr) {
			state.currentObjAttr = currentObjAttr;
		},
		SET_CURRENTROWINFO(state, currentRowInfo) {
			state.currentRowInfo = currentRowInfo;
		},
		SET_AUTHENTICATION(state, authentication) {
			state.authentication = authentication;
			localStorage.setItem(
				"authentication",
				JSON.stringify(authentication),
			);
		},
		SET_TOKEN(state, token) {
			state.token = token;
			localStorage.setItem("token", token);
		},
		SET_EXPIRES(state, expires) {
			state.expires = expires;
			localStorage.setItem("expires", expires);
		},
	},
	actions: {},
	modules: {},
});
