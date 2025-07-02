import { readonly } from "vue";

//==================== Common
export const META = readonly({
	AUDIT: "Audit",
	APPROVAL: "Approval",
	CUSTOMER_COMPLAINT: "CustomerComplaint",
	EVALUATION: "Evaluation",
	EVALUATION_ITEM: "EvaluationItem",
	EVALUATION_RESPONSE: "EvaluationResponse",
	MEMBER: "Member",
	NONCONFORMANCE: "Nonconformance",
	STRATEGY_TYPE_DEF: "StrategyTypeDef",
	STRATEGY_STEP_DEF: "StrategyStepDef",
	STRATEGY_MAP: "StrategyMap",
	SUPPLIER_AUDIT: "SupplierAudit",
	SUPPLIER_AUDIT_PLAN: "SupplierAuditPlan",
	SUPPLIER_AUDIT_RESPONSE: "SupplierAudit.Audit",
	SUPPLIER_AUDIT_SUMMARY: "SupplierAudit.AuditSummary",
	SURVEY: "Survey",
	SURVEY_RESPONSE: "SurveyResponse",
	TEAM: "Team",
	USER: "UserInfo",
});

// StrategyDef
export const STRATEGY_TYPE_DEF = readonly({
	ID: "strategyTypeId",
});

export const STRATEGY_STEP_DEF = readonly({
	ID: "strategyStepId",
});

export const STRATEGY_MAP = readonly({
	ID: "id",
	TYPE_ID: "strategyTypeId",
	STEP_ID: "strategyStepId",
	META_DATA_ID: "metaDataId",
	SEQUENCE: "sequence",
});

// Strategy Config
export const STRATEGY_CONFIG = readonly({
	ID: "issuanceNo",
	TYPE: "type",
	STEP: "step",
	EVALUATION: "evaluationId",
});

export const TEAM = readonly({
	ID: "id",
	OWNER: "owner",
	NAME: "teamName",
	MEMBERS: "members",
});

export const MEMBER = readonly({
	ID: "id",
	TEMA_ID: "teamId",
	USER_ID: "userId",
	ROLE: "role",
});

// CustomerComplaint
export const CUSTOMER_COMPLAINT = readonly({
	ID: "issuanceNo",
	CLASSIFICATION: "classification",
	CONTENT: "content",
	CREATED_BY: "createdBy",
	CREATION_DATE: "creationDate",
	CUSTOMER: "customer",
	DUE_DATE: "dueDate",
	OCCURRENCE_DATE: "occurrenceDate",
	OWNER: "owner",
	PRIORITY: "priority",
	REQUIREMENT: "requirement",
	STEP: "step",
	TITLE: "title",
});

// Nonconformance
export const NONCONFORMANCE = readonly({
	ID: "issuanceNo",
	CATEGORY: "category",
	CLASSIFICATION: "classification",
	CONTENT: "content",
	CREATED_BY: "createdBy",
	CREATION_DATE: "creationDate",
	DUE_DATE: "dueDate",
	EQUIPMENT_ID: "equipmentId",
	ITEM_DEF: "itemDef",
	ITEM_DESCRIPTION: "itemDescription",
	LOT_ID: "lotId",
	OCCURRENCE_DATE: "occurrenceDate",
	OWNER: "owner",
	PROCESS_OPERATION_ID: "processOperationId",
	QUANTITY: "quantity",
	STEP: "step",
	TITLE: "title",
});

// SupplierAudit
export const SUPPLIER_AUDIT = readonly({
	ID: "issuanceNo",
	AUDIT_DATE: "auditDate",
	CLASSIFICATION: "classification",
	CONTENT: "content",
	CREATED_BY: "createdBy",
	CREATION_DATE: "creationDate",
	GRADE: "grade",
	SCORE: "score",
	STEP: "step",
	TITLE: "title",
	EVALUATION_ID: "evaluationId",
});

export const USER_INFO = readonly({
	ID: "userId",
	DEPARTMENT: "department",
	NAME: "userName",
});

//==================== Approval
export const APPROVAL = readonly({
	ID: "approvalId",
	CATEGORY: STRATEGY_CONFIG.TYPE,
	CATEGORY_ID: STRATEGY_CONFIG.ID,
	STATE: "approvalState",
	STEP: "approvalStep",
	APPROVER: "approver",
	OPINION: "opinion",
	REQUEST_USER: "requestUser",
	REQUEST_TIME: "requestTime",
	ROUTES: "routes",
});

export const APPROVAL_ROUTE = readonly({
	ID: "id",
	APPROVER: "approver",
	SEQUENCE: "sequence",
	STATUS: "status",
	STEP: "approvalStep",
	OPINION: "opinion",
});

//==================== Survey
export const SURVEY = readonly({
	ITEMS: "items",
});

export const SURVEY_ITEM = readonly({
	ID: "id",
	CATEGORY: "category",
	SEQUENCE: "sequence",
	CONTENT: "content",
	RESPONSES: "responses",
});

export const SURVEY_RESPONSE = readonly({
	ID: "id",
	ITEM_ID: "surveyItemId",
	RESPONDENT: "respondentId",
	ANSWER: "answer",
});

export const SURVEY_SUMMARY = readonly({
	SCORE: "score",
	GRADE: "grade",
});

//==================== Evaluation
export const EVALUATION = readonly({
	ID: "id",
});

export const EVALUATION_ITEM = readonly({
	ID: "id",
	EVALUATION_ID: "evaluationId",
	CATEGORY: "category",
	MAX_SCORE: "maxScore",
});

export const EVALUATION_RESPONSE = readonly({
	ID: "id",
	ITEM_ID: "evaluationItemId",
	SELF: "self",
	ACTUAL: "actaul",
	ISSUANCE_NO: "issuanceNo",
});

// TODO common enum으로 변경?
export const ENUM = readonly({
	VALUE: "enumValue",
});
