<template>
	<div>
		<FormAction
			:action="ACTION.CHANGE_LOT_NOTES"
			:gridId="GRIDID.LOT"
			:menuId="MENU.CHANGE_LOT_NOTES"
			:metaDataId="META.CHANGE_LOT_NOTES"
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
	name: "ChangeLotNotesView",
	components: {
		FormAction,
	},
	setup() {
		return { MENU, META, LOT, ACTION, GRIDID };
	},
};
</script>
