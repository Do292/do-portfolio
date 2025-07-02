<template>
	<div>
		<NonconformanceHandlingForm />
	</div>
</template>

<script>
import NonconformanceHandlingForm from "~/system/qms/components/ocaManagement/nonconformanceHandling/NonconformanceHandlingForm";

export default {
	name: "NonconformanceHandlingView",
	components: { NonconformanceHandlingForm },
	setup() {
		return {};
	},
};
</script>
<style scoped></style>
