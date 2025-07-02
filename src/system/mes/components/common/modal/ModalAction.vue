<template>
	<div class="modal-mask">
		<div class="modal-dialog">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>{{ menuId }}</span>
					</h6>
					<ButtonBasic @onClick="$emit('close')" />
				</div>
				<div class="modal-body">
					<FormAction
						:action="action"
						:gridId="gridId"
						:isModal="true"
						:menuId="menuId"
						:metaDataId="metaDataId"
						:orderKey="orderKey"
					/>
				</div>
				<!-- <div class="justify-content modal-footer">
					<ButtonFooter
						class="apply"
						type="apply"
						@onClick="openModalConfirmOrder"
					/>
					<ButtonFooter type="close" @onClick="$emit('close')" /> 
				</div>-->
			</div>
		</div>
	</div>
</template>

<script>
import FormAction from "~/system/mes/components/common/form/FormAction";
import {
	MENU,
	META,
	PRODUCTION_ORDER,
} from "~/system/mes/constants/mes_meta_constants.js";
import { ACTION } from "~/system/mes/constants/mes_constants.js";

export default {
	name: "ModalAction",
	components: { FormAction },
	props: {
		metaDataId: { type: String },
		menuId: { type: String },
		gridId: { type: String },
		orderKey: { type: String },
		action: { type: String },
	},
	emits: ["close"],
	setup() {
		return {
			MENU,
			META,
			ACTION,
			PRODUCTION_ORDER,
		};
	},
};
</script>
<style scoped>
.modal-body {
	padding: 0.6rem !important;
}
.card {
	padding: 0px !important;
	box-shadow: none !important;
}
</style>
