import { readonly } from "vue";

//==================== Common
export const ENUM = readonly({
	NAME: "ENUMNAME",
	VALUE: "ENUMVALUE",
	DESCRIPTION: "DESCRIPTION",
});

export const SYSTEM_DEF = readonly({
	ID: "SYSTEMID",
	NAME: "SYSTEMNAME",
});

export const NLS = readonly({
	ID: "NLSID",
	TYPE: "NLSTYPE",
	SYSTEM_ID: "SYSTEMID",
});

export const SYSTEM_SETTING = readonly({
	ID: "SETTINGID",
	TYPE: "SETTINGTYPE",
	VALUE: "SETTINGVALUE",
});

export const ID_RULE = readonly({
	// Config
	ID: "RULEID",
	POSITION: "SEQUENCE",
	LENGTH: "TOTALLENGTH",

	// Section
	SECTION_CATEGORY: "SECTIONCATEGORY",
	SECTION_LENGTH: "SECTIONLENGTH",
});

//==================== HISTORY
export const HISTORY_HEADER = readonly({
	ID: "TABLEID",
	FROM: "FROMDATETIME",
	TO: "TODATETIME",
});

export const HISTORY_DTO = readonly({
	COUNT: "count",
	FROM_KEY: "fromDateTimekey",
	TO_KEY: "toDateTimekey",
});

//==================== Validation
export const VALIDATION = readonly({
	// Config
	ID: "VALIDATIONID",
	TYPE: "VALIDATIONTYPE",
	EVENT: "VALIDATIONEVENT",
	OPERATOR: "OPERATOR",

	// Source
	SOURCE_TABLE_ID: "SOURCETABLEID",
	SOURCE_COLUMN_ID: "SOURCECOLUMNID",
	SOURCE_INPUT_QUERY: "SOURCEINPUTQUERY",

	// Target
	TARGET_TABLE_ID: "TARGETTABLEID",
	TARGET_COLUMN_ID: "TARGETCOLUMNID",
	TARGET_INPUT_QUERY: "TARGETINPUTQUERY",
});

export const VALIDATION_TYPE = readonly({
	SELF_C: "selfConstant",
	SELF_D: "selfDataBase",
	RELATION_C: "relatedConstant",
	RELATION_D: "relatedDataBase",
});

//==================== Menu
export const MENU_RELATION = readonly({
	SYSTEM_ID: "SYSTEMID",
	SOURCE: "SOURCEMENUID",
	DESTINATION: "DESTINATIONMENUID",
});

//==================== Factory
export const FACTORY = readonly({
	ID: "FACTORYID",
	DESCRIPTION: "DESCRIPTION",
});

export const FACTORY_RELATION = readonly({
	SOURCE: "SOURCEFACTORYID",
	DESTINATION: "DESTINATIONFACTORYID",
	DESCRIPTION: "DESCRIPTION",
});

export const REASON_CLASS = readonly({
	ID: "REASONCLASSID",
});

//==================== Alarm
export const ALARM = readonly({
	// Def
	ID: "ALARMID",
	LEVEL: "ALARMLEVEL",
	TYPE: "ALARMTYPE",

	// Action
	ACTION: "ACTIONID",
	ACTION_TYPE: "ACTIONTYPE",
});

//==================== Process
export const PROCESS_SPEC = readonly({
	ID: "PROCESSSPECID",
	VERSION: "PROCESSSPECVERSION",
	TYPE: "PROCESSSPECTYPE",
	POSITION: "FLOWSEQUENCE",
	OBJECT_TYPE: "OBJECTTYPE",
});

export const PROCESS_SPEC_CONTENT = readonly({
	FLOW_ID: "PROCESSFLOWID",
	POSITION: "FLOWSEQUENCE",
});

export const OBJECT_PROCESS_SPEC = readonly({
	ID: "OBJECTDEFID",
	TYPE: "OBJECTTYPE",
});

export const PROCESS_FLOW_CONTENT = readonly({
	FLOW_ID: "PROCESSFLOWID",
	OPERATION_ID: "PROCESSOPERATIONID",
	POSITION: "OPERATIONSEQUENCE",
	DESCRIPTION: "DESCRIPTION",
});

export const PROCESS_FLOW = readonly({
	ID: "PROCESSFLOWID",
});

//==================== Definition
export const OBJECT_DEF = readonly({
	PRODUCT: "ProductDef",
	MATERIAL: "MaterialDef",
	CARRIER: "CarrierDef",
	RETICLE: "ReticleDef",
});

export const OBJECT_DEF_ID = readonly({
	[OBJECT_DEF.PRODUCT]: "PRODUCTID",
	[OBJECT_DEF.MATERIAL]: "MATERIALDEFID",
	[OBJECT_DEF.CARRIER]: "CARRIERDEFID",
	[OBJECT_DEF.RETICLE]: "RETICLEDEFID",
});

export const PROCESS_OPERATION = readonly({
	ID: "PROCESSOPERATIONID",
	DESCRIPTION: "DESCRIPTION",
});

//==================== PSPolicy
export const PS_CONDITION_DEF = readonly({
	ID: "CONDITIONID",
});

export const PS_TABLE_DEF = readonly({
	ID: "TABLEID",
});

export const PS_TABLE_CONDITION_DEF = readonly({
	TABLE_ID: "TABLEID",
	CONDITION_ID: "CONDITIONID",
	POSITION: "VIEWSEQUENCE",
});

//==================== Label
export const LABEL = readonly({
	CODE: "LABELCODE",
	VARIABLE_LIST: "VARIABLELIST",
	QUERY: "DATAQUERY",
	DEPENDENCY: "QUERYPARAMLIST",
});

//==================== DC
export const DC_ITEM = readonly({
	ID: "ITEMID",
	EQUIPMENT_ID: "EQUIPMENTID",
	CONDITION_ID: "DCCONDITIONID",
	TYPE: "ITEMTYPE",
});

export const DC_DEF = readonly({
	ID: "DCDEFID",
	DCTYPE: "DCTYPE",
});

export const DC_DEF_ITEM = readonly({
	DEF_ID: "DCDEFID",
	ITEM_ID: "ITEMID",
	SITE_COUNT: "SITECOUNT",
	SITE_IDS: "SITEIDS",
});
