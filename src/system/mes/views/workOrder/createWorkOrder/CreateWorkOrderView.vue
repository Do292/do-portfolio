<template>
	<div>
		<FormCreateOrder
			:gridId="META.WORK_ORDER"
			:menuId="MENU.CREATE_WORK_ORDER"
			:metaDataId="MENU.CREATE_WORK_ORDER"
			:tableId="META.WORK_ORDER"
		/>
	</div>
</template>

<script>
import FormCreateOrder from "~/system/mes/components/common/form/FormCreateOrder";
import { MENU, META } from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "CreateWorkOrderView",
	components: {
		FormCreateOrder,
	},
	setup() {
		return { MENU, META };
	},
};
</script>
