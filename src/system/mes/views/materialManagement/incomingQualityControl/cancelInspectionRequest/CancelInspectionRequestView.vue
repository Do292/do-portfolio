<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<CancelInspectionRequestForm
						ref="CancelMaterialWarehousingForm"
					></CancelInspectionRequestForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import CancelInspectionRequestForm from "../../../../components/cancelInspectionRequest/CancelInspectionRequestForm.vue";
export default {
	name: "CancelInspectionRequestView",
	components: { CancelInspectionRequestForm },
	data() {},
	methods: {},
};
</script>
<style scoped></style>
