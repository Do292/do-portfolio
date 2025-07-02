import { readonly } from "vue";

export const ENUM_KEY = readonly({
	ACTION_TYPE: "ActionType",
	LANGUAGE: "Language",
	OBJECT_TYPE: "ObjectType",
	OPERATION_TYPE: "OperationType",
});

export const ENUM_FIELD = readonly({
	KEY: "ENUMNAME",
	VALUE: "ENUMVALUE",
	POSITION: "SEQUENCE",
	SUB_VALUE: "VALUE1",
	DEFAULT: "DEFAULTFLAG",
});

// Language의 text 데이터는 value1 칼럼에 정의된 값 참조
export const LANGUAGE_FIELD = readonly({
	VALUE: ENUM_FIELD.VALUE,
	TEXT: ENUM_FIELD.SUB_VALUE,
});

// ObjectProcessSpec의 def 데이터는 value1 칼럼에 정의된 값 참조
export const OBJECT_TYPE_FIELD = readonly({
	TYPE: ENUM_FIELD.VALUE,
	DEF: ENUM_FIELD.SUB_VALUE,
});

// ValidationDef의 Operation label은 value1 참조
export const OPERATION_TYPE_FIELD = readonly({
	VALUE: ENUM_FIELD.VALUE,
	TEXT: ENUM_FIELD.SUB_VALUE,
});
