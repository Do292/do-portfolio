import { createRouter, createWebHistory } from "vue-router";
import store from "~/store";

import LoginView from "~/views/LoginView.vue";
import MainView from "~/views/MainView";

import MesMainView from "~/system/mes/views/MesMainView";
import SpcMainView from "~/system/spc/views/SpcMainView";
import QmsMainView from "~/system/qms/views/QmsMainView";
import ModelerMainView from "~/system/modeler/views/ModelerMainView";

import LoginLayout from "~/layout/LoginLayout";
import DefaultLayout from "~/layout/DefaultLayout";

import SpcLayout from "~/system/spc/SpcLayout";
import MesLayout from "~/system//mes/MesLayout";
import QmsLayout from "~/system//qms/QmsLayout";
import ModelerLayout from "~/system/modeler/ModelerLayout";
import { h } from "vue";

const MES_VIEW_MODULE = import.meta.glob("#/mes/views/*/*/**/*.vue", {
	eager: true,
});

const SPC_VIEW_MODULE = import.meta.glob("#/spc/views/*/*/**/*.vue", {
	eager: true,
});

const QMS_VIEW_MODULE = import.meta.glob("#/qms/views/*/*/**/*.vue", {
	eager: true,
});

const COMMON_VIEW_MODULE = import.meta.glob("#/common/views/*/*/**/*.vue", {
	eager: true,
});

class ViewRoute {
	constructor(VIEW_MODULE, key, systemId) {
		const { default: component } = VIEW_MODULE[key];

		// System별 라우트 name이 중복될 수 있어 Component 새로 정의해야 함.
		const name = systemId + component.name;
		this.component = {
			name,
			render() {
				return h(component);
			},
		};
		this.name = name;
		this.path =
			"/" + systemId + "/" + key.split("/").slice(5, -1).join("/");
		this.beforeEnter = beforeEnter;
	}
}

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "defaultLayout",
			component: DefaultLayout,
			beforeEnter,
			children: [
				{
					path: "/main",
					alias: ["", "/", "/main"],
					name: "MainView",
					component: MainView,
					beforeEnter,
				},
			],
		},
		{
			path: "/",
			name: "LoginLayout",
			component: LoginLayout,
			beforeEnter(to, from, next) {
				removeLocalStorage();
				next();
			},
			children: [
				{
					path: "/login",
					name: "LoginView",
					component: LoginView,
				},
			],
		},
		{
			path: "/mes",
			name: "mesLayout",
			component: MesLayout,
			beforeEnter,
			children: [
				{
					path: "main",
					name: "MesMainView",
					component: MesMainView,
					beforeEnter,
				},
				...Object.keys(MES_VIEW_MODULE).map(
					key => new ViewRoute(MES_VIEW_MODULE, key, "mes"),
				),
				...Object.keys(COMMON_VIEW_MODULE).map(
					key => new ViewRoute(COMMON_VIEW_MODULE, key, "mes"),
				),
			],
		},
		{
			path: "/qms",
			name: "qmsLayout",
			component: QmsLayout,
			beforeEnter,
			children: [
				{
					path: "main",
					name: "QmsMainView",
					component: QmsMainView,
					beforeEnter,
				},
				...Object.keys(QMS_VIEW_MODULE).map(
					key => new ViewRoute(QMS_VIEW_MODULE, key, "qms"),
				),
				...Object.keys(COMMON_VIEW_MODULE).map(
					key => new ViewRoute(COMMON_VIEW_MODULE, key, "qms"),
				),
			],
		},
		{
			path: "/modeler",
			name: "ModelerLayout",
			component: ModelerLayout,
			redirect: "/modeler/main",
			beforeEnter,
			children: [
				{
					path: "main",
					name: "ModelerMainView",
					component: ModelerMainView,
					beforeEnter,
				},
				{
					path: ":catchAll(.*)*",
					redirect: to => ({
						path: "/modeler/main",
						query: { redirectFrom: to.path },
					}),
				},
				// ...Object.keys(MODELER_VIEW_MODULE).map(
				// 	key => new ViewRoute(MODELER_VIEW_MODULE, key, "modeler"),
				// ),
				// ...Object.keys(COMMON_VIEW_MODULE).map(
				// 	key =>
				// 		new ViewRoute(COMMON_VIEW_MODULE, key, "modeler"),
				// ),
			],
		},
		{
			path: "/spc",
			name: "spcLayout",
			component: SpcLayout,
			beforeEnter,
			children: [
				{
					path: "main",
					name: "SpcMainView",
					component: SpcMainView,
					beforeEnter,
				},
				...Object.keys(SPC_VIEW_MODULE).map(
					key => new ViewRoute(SPC_VIEW_MODULE, key, "spc"),
				),
				...Object.keys(COMMON_VIEW_MODULE).map(
					key => new ViewRoute(COMMON_VIEW_MODULE, key, "spc"),
				),
			],
		},
	],
});

function beforeEnter(to, from, next) {
	if (
		store.getters["isLoggedIn"] &&
		JSON.parse(localStorage.getItem("loggedIn"))
	) {
		store.commit("SET_FLAG_LOGIN", true);
		next();
	} else {
		store.commit("SET_FLAG_LOGIN", false);
		localStorage.setItem("loggedIn", false);
		next("/login");
	}
}

function removeLocalStorage() {
	let localItems = Object.keys(localStorage);
	for (let k of localItems) {
		if (k !== "rememberId") {
			localStorage.removeItem(k);
		}
	}
}

export default router;
