<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<CancelMaterialWarehousingForm
						ref="CancelMaterialWarehousingForm"
					></CancelMaterialWarehousingForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import CancelMaterialWarehousingForm from "../../../../components/cancelMaterialWarehousing/CancelMaterialWarehousingForm.vue";
export default {
	name: "CancelMaterialWarehousingView",
	components: { CancelMaterialWarehousingForm },
	data() {},
	methods: {},
};
</script>
<style scoped></style>
