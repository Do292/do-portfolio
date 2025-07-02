<template>
	<div class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="META.SUPPLIER_AUDIT"
				:menuId="MENU.SUPPLIER_AUDITS"
				@searchByCondition="updateCondition"
			/>
			<SupplierAuditInfoForm :searchCondition="searchCondition" />
		</div>
	</div>
</template>

<script>
import SupplierAuditInfoForm from "~/system/qms/components/sourceQuality/supplierAudit/supplierAuditHandling/SupplierAuditInfoForm";

import { ref } from "vue";

import { META } from "~/system/qms/constants/qms_meta_constants.js";
import { MENU } from "~/system/qms/constants/qms_constants.js";

export default {
	name: "SupplierAuditHandlingForm",
	components: { SupplierAuditInfoForm },
	setup() {
		//==================== SearchCondition
		const searchCondition = ref([]);

		function updateCondition(condition) {
			searchCondition.value = condition;
		}

		return {
			// SearchCondition
			META,
			MENU,
			updateCondition,
			searchCondition,
		};
	},
};
</script>
<style scoped>
/* grid */
:deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 320px) !important;
}
</style>
