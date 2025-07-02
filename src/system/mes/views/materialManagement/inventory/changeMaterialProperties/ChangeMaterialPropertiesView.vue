<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<ChangeMaterialPropertiesForm
						ref="ChangeMaterialPropertiesForm"
					></ChangeMaterialPropertiesForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ChangeMaterialPropertiesForm from "../../../../components/changeMaterialProperties/ChangeMaterialPropertiesForm.vue";
export default {
	name: "ChangeMaterialPropertiesView",
	components: { ChangeMaterialPropertiesForm },
	data() {},
	methods: {},
};
</script>
<style scoped></style>
