<template>
	<div>
		<CancelReleaseWorkOrderForLotForm
			:action="ACTION.CANCEL_RELEASE_WORKORDER_FOR_LOT"
			:gridId="GRIDID.LOT"
			:menuId="MENU.CANCEL_RELEASE_WORKORDER_FOR_LOT"
			:metaDataId="META.CANCEL_RELEASE_WORKORDER_FOR_LOT"
			:orderKey="WORK_ORDER.ID"
			:woGridId="GRIDID.WORK_ORDER"
		/>
	</div>
</template>

<script>
import CancelReleaseWorkOrderForLotForm from "~/system/mes/components/workOrder/cancelReleaseWorkOrderForLot/CancelReleaseWorkOrderForLotForm";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import {
	MENU,
	META,
	LOT,
	WORK_ORDER,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "CancelReleaseWorkOrderForLotView",
	components: {
		CancelReleaseWorkOrderForLotForm,
	},
	setup() {
		return { MENU, META, ACTION, LOT, WORK_ORDER, GRIDID };
	},
};
</script>
