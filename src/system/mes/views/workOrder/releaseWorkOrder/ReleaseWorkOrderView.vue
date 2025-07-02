<template>
	<div>
		<FormAction
			:action="ACTION.RELEASE"
			:gridId="META.WORK_ORDER"
			:menuId="MENU.RELEASE_WORK_ORDER"
			:metaDataId="META.RELEASE_WORK_ORDER"
			:orderKey="WORK_ORDER.NO"
		/>
	</div>
</template>

<script>
import FormAction from "~/system/mes/components/common/form/FormAction";
import {
	MENU,
	META,
	WORK_ORDER,
} from "~/system/mes/constants/mes_meta_constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";

export default {
	name: "ReleaseWorkOrderView",
	components: {
		FormAction,
	},
	setup() {
		return { MENU, META, WORK_ORDER, ACTION };
	},
};
</script>
