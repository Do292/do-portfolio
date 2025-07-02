<template>
	<div class="handling-info-config">
		<div class="handling-info-title">
			{{ config[NONCONFORMANCE.TITLE] }}
			<span class="handling-info-no">
				No.{{ config[NONCONFORMANCE.ID] }}
			</span>
		</div>
		<div class="handling-info-content">
			<div class="row">
				<div class="col-1 content-field">Owner</div>
				<div class="col-3 content-value">
					{{ config[NONCONFORMANCE.OWNER] }}
				</div>
				<div class="col-1 content-field">Due Date</div>
				<div class="col-3 content-value handling-info-date">
					<i class="aimcons_carlendar_check"></i>
					{{ config[NONCONFORMANCE.DUE_DATE] }}
				</div>
			</div>
			<div class="row">
				<div class="col-1 content-field">Content</div>
				<div class="col-10 content-value">
					{{ config[NONCONFORMANCE.CONTENT] }}
				</div>
			</div>
		</div>
	</div>
	<FormStep :config="config" :type="META.NONCONFORMANCE" />
</template>

<script>
import FormStep from "~/system/qms/components/common/template/form/FormStep";

import {
	META,
	NONCONFORMANCE,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "NonconformanceInfoStep",
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
			NONCONFORMANCE,
		};
	},
};
</script>
<style scoped></style>
