<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<CancelMaterialInputForm
						ref="MaterialInputForm"
					></CancelMaterialInputForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import CancelMaterialInputForm from "../../../../components/cancelMaterialInput/CancelMaterialInputForm.vue";
export default {
	name: "CancelMaterialInputView",
	components: { CancelMaterialInputForm },
	data() {},
	methods: {},
};
</script>
<style scoped></style>
