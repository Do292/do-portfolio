<template>
	<div>
		<FormModifyOrder
			:gridId="META.PRODUCTION_ORDER"
			:menuId="MENU.MODIFY_PRODUCTION_ORDER"
			:metaDataId="MENU.MODIFY_PRODUCTION_ORDER"
			:tableId="META.PRODUCTION_ORDER"
		/>
	</div>
</template>

<script>
import FormModifyOrder from "~/system/mes/components/common/form/FormModifyOrder";
import {
	MENU,
	META,
	PRODUCTION_ORDER,
} from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "ModifyProductionOrderView",
	components: {
		FormModifyOrder,
	},
	setup() {
		return {
			MENU,
			META,
			PRODUCTION_ORDER,
		};
	},
};
</script>
