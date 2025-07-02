<template>
	<div>
		<CancelAssignLotToWorkOrderForm
			:action="ACTION.CANCEL_ASSIGN_LOT_TO_WORKORDER"
			:gridId="GRIDID.LOT"
			:menuId="MENU.CANCEL_ASSIGN_LOT_TO_WORKORDER"
			:metaDataId="META.CANCEL_ASSIGN_LOT_TO_WORKORDER"
			:orderKey="WORK_ORDER.ID"
			:woGridId="GRIDID.WORK_ORDER"
		/>
	</div>
</template>

<script>
import CancelAssignLotToWorkOrderForm from "~/system/mes/components/workOrder/cancelAssignLotToWorkOrder/CancelAssignLotToWorkOrderForm";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import {
	MENU,
	META,
	LOT,
	WORK_ORDER,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "CancelAssignLotToWorkOrderView",
	components: {
		CancelAssignLotToWorkOrderForm,
	},
	setup() {
		return { MENU, META, ACTION, LOT, WORK_ORDER, GRIDID };
	},
};
</script>
