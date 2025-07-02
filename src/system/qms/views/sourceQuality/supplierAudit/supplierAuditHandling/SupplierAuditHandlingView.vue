<template>
	<div>
		<SupplierAuditHandlingForm />
	</div>
</template>

<script>
import SupplierAuditHandlingForm from "~/system/qms/components/sourceQuality/supplierAudit/supplierAuditHandling/SupplierAuditHandlingForm";

export default {
	name: "SupplierAuditHandlingView",
	components: { SupplierAuditHandlingForm },
	setup() {
		return {};
	},
};
</script>
<style scoped></style>
