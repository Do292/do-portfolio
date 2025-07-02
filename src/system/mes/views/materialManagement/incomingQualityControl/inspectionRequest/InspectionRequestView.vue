<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<InspectionRequestForm
						ref="InspectionRequestForm"
					></InspectionRequestForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import InspectionRequestForm from "../../../../components/inspectionRequest/InspectionRequestForm.vue";
export default {
	name: "InspectionRequestView",
	components: { InspectionRequestForm },
	data() {},
	methods: {},
};
</script>
<style scoped></style>
