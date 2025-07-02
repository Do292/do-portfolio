<template>
	<div>
		<FutureHoldForm
			:action="ACTION.FUTURE_HOLD"
			:gridId="GRIDID.LOT"
			:menuId="MENU.FUTURE_HOLD"
			:metaDataId="META.FUTURE_HOLD"
			:orderKey="LOT.ID"
			:poGridId="GRIDID.PROCESS_OPERATION"
		/>
	</div>
</template>

<script>
import FutureHoldForm from "~/system/mes/components/inventory/futureHold/FutureHoldForm";
import {
	MENU,
	META,
	LOT,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";

export default {
	name: "FutureHoldView",
	components: {
		FutureHoldForm,
	},
	setup() {
		return { MENU, META, LOT, ACTION, GRIDID };
	},
};
</script>
