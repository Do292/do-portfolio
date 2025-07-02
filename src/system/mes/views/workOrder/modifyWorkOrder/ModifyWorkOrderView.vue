<template>
	<div>
		<FormModifyOrder
			:gridId="META.WORK_ORDER"
			:menuId="MENU.MODIFY_WORK_ORDER"
			:metaDataId="MENU.MODIFY_WORK_ORDER"
			:tableId="META.WORK_ORDER"
		/>
	</div>
</template>

<script>
import FormModifyOrder from "~/system/mes/components/common/form/FormModifyOrder";
import {
	MENU,
	META,
	WORK_ORDER,
} from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "ModifyWorkOrderView",
	components: {
		FormModifyOrder,
	},
	setup() {
		return {
			MENU,
			META,
			WORK_ORDER,
		};
	},
};
</script>
