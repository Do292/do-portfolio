import { readonly } from "vue";

//==================== System
export const LAYOUT = readonly({
	DEFAULT: "ModelerLayout",
});

export const SYSTEM = readonly({
	MODELER: "modeler",
});

export const MENU = readonly({
	ADMIN: "Admin",
	ALARM: "Alarm",
	DC: "DC",
	ENUM_DEF: "EnumDef",
	FACTORY: "Factory",
	FACTORY_DEF: "FactoryDef",
	MATERIAL: "Material",
	POLICY: "Policy",
	PROCESS: "Process",
	PROCESS_SPEC_DESIGN: "ProcessSpecDesign",
	SYSTEM: "System",
	USER: "User",
});

export const TABLE = readonly({
	ALARM_ACTION: "AlarmAction",
	ALARM_DEF: "AlarmDef",
	AUTHORITY: "Authority",
	AUTHORITY_MENU: "AuthorityMenu",
	AUTHORITY_MENU_ITEM: "AuthorityMenuItem",
	COLUMN_DEF: "ColumnDef",
	DC_DEF: "DCDef",
	DC_DEF_CONDITION: "DCDefCondition",
	DC_DEF_ITEM: "DCDefItem",
	DC_ITEM: "DCItem",
	ENUM: "Enum",
	ENUM_VALUE: "EnumValue",
	FACTORY: "Factory",
	FACTORY_RELATION: "FactoryRelation",
	EQUIPMENT_DEF: "EquipmentDef",
	GRID_COLUMN_DEF: "GridColumnDef",
	GRID_TABLE_DEF: "GridTableDef",
	ID_RULE_ATTR_DEF: "IdRuleAttrDef",
	ID_RULE_DEF: "IdRuleDef",
	MENU: "Menu",
	MENU_ITEM: "MenuItem",
	MENU_RELATION: "MenuRelation",
	META_DATA: "MetaData",
	META_DATA_DETAIL: "MetaDataDetail",
	MULTI_LANGUAGE_DEF: "MultiLanguageDef",
	OBJECT_PROCESS_SPEC: "ObjectProcessSpec",
	PROCESS_FLOW: "ProcessFlow",
	PROCESS_FLOW_CONTENT: "ProcessFlowContent",
	PROCESS_OPERATION: "ProcessOperation",
	PROCESS_SPEC: "ProcessSpec",
	PROCESS_SPEC_CONTENT: "ProcessSpecContent",
	PS_CONDITION_DEF: "PSConditionDef",
	PS_TABLE_CONDITION_DEF: "PSTableConditionDef",
	PS_TABLE_DEF: "PSTableDef",
	REASON_CLASS: "ReasonClass",
	SYSTEM_DEF: "SystemDef",
	SYSTEM_SETTING: "SystemSetting",
	TABLE_DEF: "TableDef",
	USER_AUTHORITY: "UserAuthority",
	USER_INFO: "UserInfo",
	VALIDATION_DEF: "ValidationDef",
});

export const META_TABLE = readonly({
	COLUMN_DEF: "ColumnDef",
	TABLE_DEF: "TableDef",
	GRID_COLUMN_DEF: "GridColumnDef",
	GRID_TABLE_DEF: "GridTableDef",
});

//==================== Column
export const ID = readonly({
	ACCESS_FLAG: "ACCESSFLAG",
	ACCESS_TYPE: "ACCESSTYPE",
	AUTHORITY_ID: "AUTHORITYID",
	CAPTION: "CAPTION",
	CHECK_OUT_STATE: "CHECKOUTSTATE",
	COLUMN_ID: "COLUMNID",
	COLUMN_TYPE: "CATEGORY",
	DATA_TYPE: "DATATYPE",
	DATA_STATE: "DATASTATE",
	DEFAULT_VALUE: "DEFAULTVALUE",
	DEPENDENT_COLUMN_ID: "DEPENDENTID",
	DESCRIPTION: "DESCRIPTION",
	ENABLE_FLAG: "ENABLEDFLAG",
	EVENT: "EVENT",
	FACTORY_ID: "FACTORYID",
	FIELD: "field",
	FILTER_FLAG: "FILTERFLAG",
	FIXING_FLAG: "FIXINGFLAG",
	GRID_ID: "GRIDID",
	HEADER_TEXT: "headerText",
	HISTORY_TABLE_ID: "HISTORYTABLEID",
	INPUT_METHOD: "INPUTMETHOD",
	INPUT_QUERY: "INPUTQUERY",
	INPUT_TYPE: "INPUTTYPE",
	ITEM_ID: "ITEMID",
	LABEL: "LABEL",
	NLS_ID: "NLSID",
	MANDATORY_FLAG: "MANDATORYFLAG",
	MAX_VALUE: "MAXVALUE",
	META_ID: "METADATAID",
	META_DETAIL_ID: "METADATADETAILID",
	MENU_ID: "MENUID",
	MIN_VALUE: "MINVALUE",
	PASSWORD: "PASSWORD",
	POSITION: "SEQUENCE",
	PRIMARY_FLAG: "PRIMARYKEYFLAG",
	SYSTEM_ID: "SYSTEMID",
	TABLE_ID: "TABLEID",
	TEXT_ALIGN: "HALIGN",
	USABLE_FLAG: "USABLEFLAG",
	VISIBILITY_FLAG: "VISIBILITYFLAG",
});

export const DATA_TYPE = readonly({
	STRING: "String",
	LONG: "Long",
	DOUBLE: "Double",
	DATE: "LocalDate",
	DATE_TIME: "LocalDateTime",
	BOOLEAN: "Boolean",
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

export const FLAG = readonly({ Y: "Y", N: "N" });

export const COLUMN_TYPE = readonly({
	KEY: "Key",
	STANDARD: "Standard",
});

export const DEFAULT_POSITION = 1;

//==================== Data
export const API_RESPONSE = readonly({
	RESULT: "result",
	DATA: "data",
	SUCCESS: "SUCCESS",
	FAIL: "FAIL",
	STATUS: "DETAIL_STATUS",
	MESSAGE: "DETAIL_MESSAGE",
});

export const DATA_STATE = readonly({
	CREATED: "Created",
	REMOVED: "Removed",
});

export const CLONE_DTO = readonly({
	SOURCE: "sourceCondition",
	TARGET: "targetCondition",
	FLAG: "copyFlag",
});

//==================== Action
export const ACTION = readonly({
	APPLY: "apply",
	CLONE: "clone",
	CREATE: "create",
	DELETE: "delete",
	HIDE: "hide",
	MODIFY: "modify",
	SHOW: "show",
	ADD_LIST: "addList",
});

export const AIMCON = readonly({
	activate: "circle-check",
	addData: "add",
	addList: "list_plus",
	apply: "check",
	applyData: "add",
	approve: "check",
	approved: "check",

	approval: "task_",

	arrow: "arrow-right",
	cancel: "undo",
	change: "change-state",
	changeData: "add",
	changePassword: "lock",
	close: "close",
	clone: "info_plus",
	collapse: "detail_down",
	comparison: "change-shop",
	copy: "copy_1",
	create: "plus",
	delete: "minus",
	deleteApproval: "delete",
	deleteLine: "delete",
	download: "download",
	dataState: "data_2",
	draft: "menu",
	filter: "filter_1",
	history: "history",
	info: "info_list",
	fix: "pin",
	load: "add",

	modify: "edit1",
	newVersion: "label_check1",
	ok: "check",
	pending: "etc",
	refresh: "refresh",
	remove: "close",
	request: "arrow-right",
	require: "task_alt",
	reset: "refresh-2",
	resetSession: "history",
	reject: "bold_cancel",
	rejected: "stop-state",
	revision: "revision",

	search: "search",
	set: "check",
	setting: "gear",
	skip: "arrow-2-right",
	submitted: "arrow-right",
	syncronize: "re-check",
	time: "clock_round",
	upload: "upload",
	user: "user2",
	validate: "pause_badge",
	verification: "verified_user",
	verify: "circle-check",

	show: "view1",
	font: "text_t",
	hide: "veiw_off",
	link: "arrow-upright",
	password: "lock",
});
