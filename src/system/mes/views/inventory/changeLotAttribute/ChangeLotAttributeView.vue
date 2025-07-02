<template>
	<div>
		<ChangeLotAttributeForm
			:action="ACTION.CHANGE_LOT_ATTRIBUTE"
			:gridId="GRIDID.LOT"
			:menuId="MENU.CHANGE_LOT_ATTRIBUTE"
			:metaDataId="META.CHANGE_LOT_ATTRIBUTE"
			:orderKey="LOT.ID"
		/>
	</div>
</template>

<script>
import ChangeLotAttributeForm from "~/system/mes/components/inventory/changeLotAttribute/ChangeLotAttributeForm";
import {
	MENU,
	META,
	LOT,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";

export default {
	name: "ChangeLotAttributeView",
	components: {
		ChangeLotAttributeForm,
	},
	setup() {
		return { MENU, META, LOT, ACTION, GRIDID };
	},
};
</script>
