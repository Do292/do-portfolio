<template>
	<div>
		<AssignLotToWorkOrderForm
			:action="ACTION.ASSIGN_LOT_TO_WORKORDER"
			:gridId="GRIDID.LOT"
			:menuId="MENU.ASSIGN_LOT_TO_WORKORDER"
			:metaDataId="META.ASSIGN_LOT_TO_WORKORDER"
			:orderKey="WORK_ORDER.ID"
			:woGridId="GRIDID.WORK_ORDER"
		/>
	</div>
</template>

<script>
import AssignLotToWorkOrderForm from "~/system/mes/components/workOrder/assignLotToWorkOrder/AssignLotToWorkOrderForm";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import {
	MENU,
	META,
	LOT,
	WORK_ORDER,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "AssignLotToWorkOrderView",
	components: {
		AssignLotToWorkOrderForm,
	},
	setup() {
		return { MENU, META, ACTION, LOT, WORK_ORDER, GRIDID };
	},
};
</script>
