<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<MaterialWarehousingForm
						ref="MaterialWarehousingForm"
					></MaterialWarehousingForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import MaterialWarehousingForm from "../../../../components/materialWarehousing/MaterialWarehousingForm.vue";
export default {
	name: "MaterialWarehousingView",
	components: { MaterialWarehousingForm },
	data() {},
	methods: {},
};
</script>
<style scoped></style>
