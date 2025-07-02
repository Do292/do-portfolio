<template>
	<div>
		<FormAction
			:action="ACTION.RELEASE_HOLD"
			:gridId="GRIDID.LOT"
			:menuId="MENU.RELEASE_HOLD"
			:metaDataId="META.RELEASE_HOLD"
			:orderKey="LOT.ID"
		/>
	</div>
</template>

<script>
import FormAction from "~/system/mes/components/common/form/FormAction";
import {
	MENU,
	META,
	LOT,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";

export default {
	name: "ReleaseHoldView",
	components: {
		FormAction,
	},
	setup() {
		return { MENU, META, LOT, ACTION, GRIDID };
	},
};
</script>
