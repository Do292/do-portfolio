import { readonly } from "vue";

//==================== System
export const LAYOUT = readonly({
	Default: "defaultLayout",
	spc: "SpcLayout",
	modeler: "ModelerLayout",
	mes: "MesLayout",
	qms: "QmsLayout",
});

export const THEME = readonly({
	suite: "light",
	spc: "orange",
	pms: "orange",
	rms: "orange",
	modeler: "purple",
	mes: "red",
	qms: "teal",
	wms: "brown",
	fdc: "green",
	eas: "green",
	fmb: "yellow",
	mcs: "blue",
});

export const SYSTEM = readonly({
	MODELER: "Modeler",
});
export const USER_CAEML = readonly({
	ID: "userId",
	NAME: "userName",
	TYPE: "userType",
	EMAIL: "email",
	IMAGE: "photo",
	FACTORY_ID: "factoryId",
	LANGUAGE: "defaultLanguage",
	PASSWORD: "password",
});

export const USER = readonly({
	ID: "USERID",
	NAME: "USERNAME",
	TYLE: "USERTYPE",
	EMAIL: "EMAIL",
	IMAGE: "PHOTO",
	FACTORY_ID: "FACTORYID",
	LANGUAGE: "DEFAULTLANGTYPE",
	PASSWORD: "PASSWORD",
});

export const MENU = readonly({
	// Config
	ID: "MENUID",
	PARENT_ID: "PARENTMENUID",
	TABLE_ID: "Menu",

	// Node
	NAME: "MENUNAME",
	PATH: "VIEWID",
	POSITION: "MENUSEQ",
	SYSTEM_ID: "SYSTEMID",
	TYPE: "MENULEVEL",
});

// Menu Icon
export const MENU_ICON = readonly({
	// Common
	Admin: "security1",
	System: "check-setting",

	// Modeler
	Alarm: "notification",
	DC: "Alternate-Storage",
	Factory: "fab2",
	Material: "fab_item", // MES 공용
	Policy: "label_setting",
	Process: "line",
	User: "cir_user2",

	// SPC
	Modeling: "Recovery-Dest",
	CalculateData: "YMS",
	View: "monitor_search",

	// QMS
	CustomerQuality: "notification",
	ProcessQuality: "Alternate-Storage",
	SourceQuality: "fab2",

	// MES
	ProductionOrder: "notification",
	Lot: "Alternate-Storage",
	FABOrder: "fab2",
	Pallet: "fab2",
	Box: "fab2",
	ShipOrder: "fab2",
	WorkOrder: "fab2",
	Inventory: "fab1",
});

export const MENU_TYPE = readonly({
	ACTION: "A",
	FOLDER: "F",
});

//==================== Data
export const API_RESPONSE = readonly({
	RESULT: "result",
	DATA: "data",
	MESSAGE: "message",
	DETAIL_STATUS: "DETAIL_STATUS",
	DETAIL_MESSAGE: "DETAIL_MESSAGE",
	SUCCESS: "SUCCESS",
	FAIL: "FAIL",
	STATUS: "DETAIL_STATUS",
});

export const FLAG = readonly({ Y: "Y", N: "N" });

export const INPUT_TYPE = readonly({
	ALWAYS: "Always",
	CHANGE: "Change",
	NEVER: "Never",
});

export const INPUT_METHOD = readonly({
	DIRECT: "Direct",
	CHOOSE: "Choose",
	SEARCH: "Search",
	DATE: "Date", // LocalDate
	DATE_TIME: "DateTime", // LocalDateTime
});

//==================== Action
export const ACTION = readonly({
	ADD_LIST: "addList",
	APPLY: "apply",
	APPROVE: "approve",
	CANCEL: "cancel",
	CLEAR: "clear",
	CLOSE: "close",
	CONFIRM: "confirm",
	CREATE: "create",
	DELETE: "delete",
	EDIT: "edit",
	HIDE: "hide",
	MODIFY: "modify",
	REFRESH: "refresh",
	REJECT: "reject",
	RETURN: "return",
	RESET: "reset",
	SAVE: "save",
	SETTING: "setting",
	SHOW: "show",
	SUBMIT: "submit",
	MIN_VALUE: "MINVALUE",
	OPEN: "open",
	PASSWORD: "PASSWORD",
	POSITION: "SEQUENCE",
	PRIMARY_FLAG: "PRIMARYKEYFLAG",
	SYSTEM_ID: "SYSTEMID",
	TABLE_ID: "TABLEID",
	VISIBILITY_FLAG: "VISIBILITYFLAG",
	HOLD: "hold",
	INVERSE_SELECT: "inverseSelected",
	REPORT: "report",
	RELEASE: "release",
	REMOVE: "remove",
});

export const AIMCON = readonly({
	activate: "circle-check",
	addData: "add",
	addList: "list_plus",
	apply: "check",
	applyData: "add",
	approve: "check",
	approved: "check",
	arrow: "arrow-right",
	cancel: "undo",
	change: "change-state",
	changeData: "add",
	changePassword: "lock",
	close: "close",
	clone: "info_plus",
	collapse: "detail_down",
	comparison: "change-shop",
	confirm: "check",
	copy: "copy_1",
	create: "plus",
	delete: "minus",
	deleteApproval: "delete",
	deleteLine: "delete",
	download: "download",
	draft: "menu",
	filter: "filter_1",
	history: "history",
	hold: "hold_1",
	info: "info_list",
	load: "add",
	manage: "gear",
	modify: "edit1",
	newVersion: "label_check1",
	ok: "check",
	open: "mail_open",
	pending: "etc",
	refresh: "refresh",
	release: "undo",
	remove: "close",
	request: "arrow-right",
	require: "task_alt",
	reset: "refresh-2",
	resetSession: "history",
	reject: "bold_cancel",
	rejected: "stop-state",
	revision: "revision",
	save: "save",
	search: "search",
	set: "check",
	setting: "gear",
	skip: "arrow-2-right",
	submitted: "arrow-right",
	synchronize: "re-check",
	time: "clock_round",
	upload: "upload",
	user: "user2",
	validate: "pause_badge",
	verification: "verified_user",
	verify: "circle-check",

	//modeler_constatnt.js의 AIMCON에 있던 것
	show: "view1",
	font: "text_t",
	hide: "veiw_off",
	link: "arrow-upright",
	password: "lock",

	// MES 용
	assignLotToWorkOrder: "check",
	cancelAssignLotToWorkOrder: "undo",
	assignEquipmentToWorkOrder: "check",
	releaseWorkOrderForLot: "undo",
	cancelReleaseWorkOrderForLot: "undo",
});

export const DEFAULT_SEQEUNCE = 1;

//==================== Tree
export const ROOT = "Root";

export const NODE_FIELD = readonly({
	ID: "NODEID",
	CHILDREN: "CHILD_NODE",
	NAME: "NODENAME",
});

//==================== Global
export const WfbConstants = {
	TEST: "test",
};

export default {
	install: app => {
		app.config.globalProperties.WFBConstants = WfbConstants;
	},
};
