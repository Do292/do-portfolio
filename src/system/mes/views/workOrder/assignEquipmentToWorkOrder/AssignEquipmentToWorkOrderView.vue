<template>
	<div>
		<FormAction
			:action="ACTION.ASSIGN_EQUIPMENT_TO_WORKORDER"
			:gridId="GRIDID.WORK_ORDER"
			:menuId="MENU.ASSIGN_EQUIPMENT_TO_WORKORDER"
			:metaDataId="META.ASSIGN_EQUIPMENT_TO_WORKORDER"
			:orderKey="WORK_ORDER.ID"
		/>
	</div>
</template>
7700

<script>
import FormAction from "~/system/mes/components/common/form/FormAction";
import {
	MENU,
	META,
	LOT,
	GRIDID,
	WORK_ORDER,
	EQP,
} from "~/system/mes/constants/mes_meta_constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";

export default {
	name: "AssignEquipmentToWorkOrderView",
	components: {
		FormAction,
	},
	setup() {
		return { MENU, META, LOT, ACTION, WORK_ORDER, EQP, GRIDID };
	},
};
</script>
