<template>
	<div>
		<ReleaseWorkOrderForLotForm
			:action="ACTION.RELEASE_WORKORDER_FOR_LOT"
			:gridId="GRIDID.LOT"
			:menuId="MENU.RELEASE_WORKORDER_FOR_LOT"
			:metaDataId="META.RELEASE_WORKORDER_FOR_LOT"
			:orderKey="WORK_ORDER.ID"
			:woGridId="GRIDID.WORK_ORDER"
		/>
	</div>
</template>

<script>
import ReleaseWorkOrderForLotForm from "~/system/mes/components/workOrder/releaseWorkOrderForLot/ReleaseWorkOrderForLotForm";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import {
	MENU,
	META,
	LOT,
	WORK_ORDER,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "ReleaseWorkOrderForLotView",
	components: {
		ReleaseWorkOrderForLotForm,
	},
	setup() {
		return { MENU, META, ACTION, LOT, WORK_ORDER, GRIDID };
	},
};
</script>
