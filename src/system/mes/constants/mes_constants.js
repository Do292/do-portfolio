import { readonly } from "vue";

export const DATA_STATE = readonly({
	// materialState
	CREATED: "Created",
	REMOVED: "Removed",
	RELEASED: "Released",

	// inspectionState
	PASS: "P",
	FAIL: "F",
	REQUEST: "R",
	WAIT: "W",

	// holdState
	HOLD: "OnHold",
	RELEASE: "NotOnHold",
});

/**
 * Action
 */
export const ACTION = readonly({
	APPLY: "apply",
	CLEAR: "clear",
	CREATE: "create",
	DELETE: "delete",
	MODIFY: "modify",

	CANCEL: "cancel",
	CLOSE: "close",
	CONFIRM: "confirm",
	OPEN: "open",
	REJECT: "reject",

	HOLD: "hold",
	RELEASE: "release",
	REQUEST: "request",
	REQUESTCANCEL: "requestCancel",
	SCRAP: "scrap",

	// WorkOrder
	ASSIGN_LOT_TO_WORKORDER: "assignLotToWorkOrder",
	CANCEL_ASSIGN_LOT_TO_WORKORDER: "cancelAssignLotToWorkOrder",
	ASSIGN_EQUIPMENT_TO_WORKORDER: "assignEquipmentToWorkOrder",
	RELEASE_WORKORDER_FOR_LOT: "releaseWorkOrderForLot",
	CANCEL_RELEASE_WORKORDER_FOR_LOT: "cancelReleaseWorkOrderForLot",

	// LOT
	CREATELOT: "createLot",
	CANCEL_CREATE_LOT: "cancelCreateLot",
	CHANGE_LOT_NOTES: "changeLotNotes",
	CHANGE_LOT_ATTRIBUTE: "changeLotAttribute",

	RELEASE_HOLD: "releaseHold",
	FUTURE_HOLD: "futureHold",
	CHANGE_OPERATION: "changeOperation",
	FUTURE_SKIP: "futureSkip",
	SCRAP_LOT: "scrap",
	CONFIRM_SCRAP_LOT: "confirmScrapLot",
});

export const STATUS_ICON = readonly({
	created: "list_check",
	reOpen: "PMS1",
	today: "carlendar_check",
	onHold: "holdtime",
	completed: "complete",
	qty: "counselor", // return-order
	wait: "wait",
	reserved: "user_work",
	transported: "ship",
	run: "run",
	futureHold: "time_setting",

	innerBox: "inbox_download",
	box: "carrier",
	outerBox: "box_download",
	pallet: "carrier",
	transport: "ship",
});
