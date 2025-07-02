<template>
	<div>
		<FormCreateOrder
			:gridId="META.PRODUCTION_ORDER"
			:menuId="MENU.CREATE_PRODUCTION_ORDER"
			:metaDataId="MENU.CREATE_PRODUCTION_ORDER"
			:tableId="META.PRODUCTION_ORDER"
		/>
	</div>
</template>

<script>
import FormCreateOrder from "~/system/mes/components/common/form/FormCreateOrder";
import { MENU, META } from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "CreateProductionOrderView",
	components: {
		FormCreateOrder,
	},
	setup() {
		return { MENU, META };
	},
};
</script>
