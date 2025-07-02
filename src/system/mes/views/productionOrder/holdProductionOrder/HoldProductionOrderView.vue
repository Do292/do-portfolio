<template>
	<div>
		<FormAction
			:action="ACTION.HOLD"
			:gridId="META.PRODUCTION_ORDER"
			:menuId="MENU.HOLD_PRODUCTION_ORDER"
			:metaDataId="META.HOLD_PRODUCTION_ORDER"
			:orderKey="PRODUCTION_ORDER.ID"
		/>
	</div>
</template>

<script>
import FormAction from "~/system/mes/components/common/form/FormAction";
import {
	MENU,
	META,
	PRODUCTION_ORDER,
} from "~/system/mes/constants/mes_meta_constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";

export default {
	name: "HoldProductionOrderView",
	components: {
		FormAction,
	},
	setup() {
		return { MENU, META, PRODUCTION_ORDER, ACTION };
	},
};
</script>
