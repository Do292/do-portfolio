<template>
	<div>
		<CreateLotForm
			:lotGridId="GRIDID.LOT"
			:menuId="MENU.CREATE_LOT"
			:metaDataId="META.CREATE_LOT"
			:prodGridId="GRIDID.PRODUCT_DEF"
			:tableId="META.LOT"
		/>
	</div>
</template>

<script>
import CreateLotForm from "~/system/mes/components/inventory/createLot/CreateLotForm";
import {
	MENU,
	META,
	GRIDID,
} from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "CreateLotFormView",
	components: {
		CreateLotForm,
	},
	setup() {
		return { MENU, META, GRIDID };
	},
};
</script>
