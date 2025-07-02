import { readonly } from "vue";

//==================== Common
export const MENU = readonly({
	// Production Order
	ACTION_PRODUCTION_ORDER: "ActionProductionOrder",
	CREATE_PRODUCTION_ORDER: "CreateProductionOrder",
	MODIFY_PRODUCTION_ORDER: "ModifyProductionOrder",
	HOLD_PRODUCTION_ORDER: "HoldProductionOrder",
	RELEASE_PRODUCTION_ORDER: "ReleaseProductionOrder",
	PRODUCTION_ORDER_STATUS: "ProductionOrderStatus",
	// Work Order
	ACTION_WORK_ORDER: "ActionWorkOrder",
	CREATE_WORK_ORDER: "CreateWorkOrder",
	MODIFY_WORK_ORDER: "ModifyWorkOrder",
	HOLD_WORK_ORDER: "HoldWorkOrder",
	RELEASE_WORK_ORDER: "ReleaseWorkOrder",
	WORK_ORDER_STATUS: "WorkOrderStatus",
	ASSIGN_LOT_TO_WORKORDER: "AssignLotToWorkOrder",
	CANCEL_ASSIGN_LOT_TO_WORKORDER: "CancelAssignLotToWorkOrder",
	ASSIGN_EQUIPMENT_TO_WORKORDER: "AssignEquipmentToWorkOrder",
	RELEASE_WORKORDER_FOR_LOT: "ReleaseWorkOrderForLot",
	CANCEL_RELEASE_WORKORDER_FOR_LOT: "CancelReleaseWorkOrderForLot",

	// Inventory
	ACTION_INVENTORY: "ActionInventory",
	CREATE_LOT: "CreateLot",
	CANCEL_CREATE_LOT: "CancelCreateLot",
	CHANGE_LOT_NOTES: "ChangeLotNotes",
	CHANGE_LOT_ATTRIBUTE: "ChangeLotAttribute",
	HOLD_LOT: "HoldLot",
	RELEASE_LOT: "ReleaseLot",
	RELEASE_HOLD: "ReleaseHold",
	FUTURE_HOLD: "FutureHold",
	SCRAP_LOT: "ScrapLot",
});

export const META = readonly({
	// Production Order
	PRODUCT: "Product",
	PRODUCT_DEF: "ProductDef",
	PRODUCTION_ORDER: "ProductionOrder",
	HOLD_PRODUCTION_ORDER: "HoldProductionOrder",
	RELEASE_PRODUCTION_ORDER: "ReleaseProductionOrder",

	// Work Order
	WORK_ORDER: "WorkOrder",
	HOLD_WORK_ORDER: "HoldWorkOrder",
	RELEASE_WORK_ORDER: "ReleaseWorkOrder",
	ASSIGN_LOT_TO_WORKORDER: "AssignLotToWorkOrder",
	CANCEL_ASSIGN_LOT_TO_WORKORDER: "CancelAssignLotToWorkOrder",
	ASSIGN_EQUIPMENT_TO_WORKORDER: "AssignEquipmentToWorkOrder",
	RELEASE_WORKORDER_FOR_LOT: "ReleaseWorkOrderForLot",
	CANCEL_RELEASE_WORKORDER_FOR_LOT: "CancelReleaseWorkOrderForLot",

	// Inventory
	INVENTORY: "Inventory",
	CREATE_LOT: "CreateLot",
	CANCEL_CREATE_LOT: "CancelCreateLot",
	CHANGE_LOT_NOTES: "ChangeLotNotes",
	CHANGE_LOT_ATTRIBUTE: "ChangeLotAttribute",
	RELEASE_LOT: "ReleaseLot",
	HOLD_LOT: "HoldLot",
	RELEASE_HOLD: "ReleaseHold",
	FUTURE_HOLD: "FutureHold",
	SCRAP_LOT: "ScrapLot",
});

export const SEARCH_CONDITION = readonly({
	// Production Order
	PRODUCTION_ORDER_SCHEDULE_STATE: "ProductionOrderScheduleState",
	ACTION_PRODUCTION_ORDER: "ActionProductionOrder",
	PRODUCTION_ORDER_ORDERSTATUS_WIP: "ProductionOrderStatusWIP",

	// Work Order
	WORK_ORDER_SCHEDULE_STATE: "WorkOrderScheduleState",
	ACTION_WORK_ORDER: "ActionWorkOrder",
});

export const ENUM = readonly({
	NAME: "ENUMNAME",
	VALUE: "ENUMVALUE",
	DESCRIPTION: "DESCRIPTION",
});

//==================== Product
export const PRODUCT = readonly({
	ID: "productId",
});
export const PRODUCTION_ORDER = readonly({
	ID: "productionOrderId",
	TYPE: "productionOrder",
});
export const ORDER = readonly({
	QTY: "orderQty",
});

//==================== ProcessOperation
export const PROCESS_OPERATION = readonly({
	ID: "processOperationId",
});

//==================== Work
export const WORK_ORDER = readonly({
	ID: "workOrderId",
	NO: "workOrderNo",
	TYPE: "workOrder",
});

//==================== Inventory
export const LOT = readonly({
	ID: "lotId",
});
export const EQP = readonly({ ID: "equipmentId" });

/**
 * MENU : META 와 다른 GRID ID가 필요할 경우 정의
 */
export const GRIDID = readonly({
	LOT: "Lot",
	WORK_ORDER: "WorkOrder",
	PRODUCTION_ORDER: "ProductionOrder",
	PRODUCT_DEF: "ProductDef",
	WIP: "WIP",
	BOM: "Bom",
	EVENT_HISTORY: "EventHistory",
	PROCESS_OPERATION: "ProcessOperation",

	// Card
	PRODUCTION_ORDER_STATUS: "ProductionOrderStatus",
	WORK_ORDER_STATUS: "WorkOrderStatus",
});
