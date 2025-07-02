<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<MaterialInputForm
						ref="MaterialInputForm"
					></MaterialInputForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import MaterialInputForm from "../../../../components/materialInput/MaterialInputFrom.vue";
export default {
	name: "MaterialInputView",
	components: { MaterialInputForm },
	data() {},
	methods: {},
};
</script>
<style scoped></style>
