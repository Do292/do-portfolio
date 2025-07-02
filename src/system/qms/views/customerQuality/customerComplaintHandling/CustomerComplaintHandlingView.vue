<template>
	<div>
		<CustomerComplaintHandlingForm />
	</div>
</template>

<script>
import CustomerComplaintHandlingForm from "~/system/qms/components/customerQuality/customerComplaintHandling/CustomerComplaintHandlingForm";

export default {
	name: "CustomerComplaintHandlingView",
	components: { CustomerComplaintHandlingForm },
	setup() {
		return {};
	},
};
</script>
<style scoped></style>
