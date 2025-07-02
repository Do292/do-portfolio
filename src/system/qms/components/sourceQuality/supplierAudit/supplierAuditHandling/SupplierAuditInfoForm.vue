<template>
	<div class="handling-info-container">
		<Splitter :paneConfigs="horizontalConfigs">
			<template v-slot:left>
				<SupplierAuditInfoCard
					:searchCondition="searchCondition"
					@select="selectSupplierAudit"
				/>
			</template>
			<template v-slot:right>
				<SupplierAuditInfoStep :config="selectedSupplierAudit" />
			</template>
		</Splitter>
	</div>
</template>

<script>
import SupplierAuditInfoCard from "~/system/qms/components/sourceQuality/supplierAudit/supplierAuditHandling/SupplierAuditInfoCard";
import SupplierAuditInfoStep from "~/system/qms/components/sourceQuality/supplierAudit/supplierAuditHandling/SupplierAuditInfoStep";

import { ref } from "vue";
import { META } from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "SupplierAuditInfoForm",
	components: { SupplierAuditInfoCard, SupplierAuditInfoStep },
	props: {
		searchCondition: { type: Array },
	},
	setup() {
		//==================== Config
		const horizontalConfigs = [
			{ key: "left", size: 30, min: 0 },
			{ key: "right", size: 70, min: 0 },
		];

		//==================== SupplierAudit
		const selectedSupplierAudit = ref({});

		function selectSupplierAudit(supplierAudit) {
			if (supplierAudit !== selectedSupplierAudit.value) {
				selectedSupplierAudit.value = supplierAudit;
			}
		}

		return {
			// Config
			META,
			horizontalConfigs,

			// Complaint
			selectedSupplierAudit,
			selectSupplierAudit,
		};
	},
};
</script>
<style scoped></style>
