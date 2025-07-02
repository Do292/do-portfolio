import { readonly } from "vue";

//==================== Menu
export const MENU = readonly({
	CUSTOMER_COMPLAINTS: "CustomerComplaints",
	CUSTOMER_COMPLAINT_HANDLING: "CustomerComplaintHandling",

	NONCONFORMANCES: "Nonconformances",
	NONCONFORMANCE_HANDLING: "NonconformanceHandling",

	SUPPLIER_AUDITS: "SupplierAudits",
	SUPPLIER_AUDIT_HANDLING: "SupplierAuditHandling",

	STRATEGY_DEF: "StrategyDef",
	STRATEGY_STEP_DEF: "StrategyStepDef",
});

//==================== Strategy Step
export const STRATEGY_STEP = readonly({
	APPROVAL: "Approval",
	AUDIT: "Audit",
	AUDIT_PLAN: "AuditPlan",
	AUDIT_SUMMARY: "AuditSummary",
	COMPLETED: "Completed",
	TEAM: "Team",
});

//==================== Approval
export const APPROVAL_STATE = readonly({
	DRAFT: "Draft",
	SUBMITTED: "Submitted",
	APPROVED: "Approved",
});

export const APPROVAL_ROUTE_STATUS = readonly({
	DRAFT: "Draft",
	IN_PROGRESS: "In_Progress",
	APPROVED: "Approved",
	REJECT: "Reject",
});
