<template>
	<div class="handling-info-config">
		<div class="handling-info-title">
			{{ config[SUPPLIER_AUDIT.TITLE] }}
			<span class="handling-info-no">
				No.{{ config[SUPPLIER_AUDIT.ID] }}
			</span>
		</div>
		<div class="handling-info-content">
			<div class="row">
				<div class="col-1 content-field">Content</div>
				<div class="col-10 content-value">
					{{ config[SUPPLIER_AUDIT.CONTENT] }}
				</div>
			</div>
		</div>
	</div>
	<FormStep :config="config" :type="META.SUPPLIER_AUDIT" />
</template>

<script>
import FormStep from "~/system/qms/components/common/template/form/FormStep";

import {
	META,
	SUPPLIER_AUDIT,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "SupplierAuditInfoStep",
	components: {
		FormStep,
	},
	props: {
		config: { type: Object },
	},
	setup() {
		return {
			// Constant
			META,
			SUPPLIER_AUDIT,
		};
	},
};
</script>
<style scoped></style>
