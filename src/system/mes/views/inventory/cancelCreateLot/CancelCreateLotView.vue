<template>
	<div>
		<FormAction
			:action="ACTION.CANCEL_CREATE_LOT"
			:gridId="GRIDID.LOT"
			:menuId="MENU.CANCEL_CREATE_LOT"
			:metaDataId="META.CANCEL_CREATE_LOT"
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
	name: "CancelCreateLotView",
	components: {
		FormAction,
	},
	setup() {
		return { MENU, META, LOT, ACTION, GRIDID };
	},
};
</script>
