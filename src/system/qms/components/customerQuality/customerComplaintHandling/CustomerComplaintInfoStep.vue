<template>
	<div class="card-header">
		<div class="row fiter-box02" style="padding: 8px 14px">
			<div class="col-12 p-0">
				<div class="handling-info-title">
					{{ config[COMPLAINT.TITLE] }}
					<span class="handling-info-no">
						No.{{ config[COMPLAINT.ID] }}
					</span>
				</div>
			</div>
			<div class="col-12 p-0">
				<div class="handling-info-content">
					<div class="row">
						<div class="col-1 content-field">Customer</div>
						<div class="col-3 content-value">
							{{ config[COMPLAINT.CUSTOMER] }}
						</div>
						<div class="col-1 content-field">Priority</div>
						<div class="col-3 content-value">
							<span
								:class="config[COMPLAINT.PRIORITY]"
								class="complaint-priority"
							>
								{{ config[COMPLAINT.PRIORITY] }}
							</span>
						</div>
					</div>
					<div class="row">
						<div class="col-1 content-field">Owner</div>
						<div class="col-3 content-value">
							{{ config[COMPLAINT.OWNER] }}
						</div>
						<div class="col-1 content-field">Due Date</div>
						<div class="col-3 content-value handling-info-date">
							<i class="aimcons_carlendar_check"></i>
							{{ config[COMPLAINT.DUE_DATE] }}
						</div>
					</div>
					<div class="row">
						<div class="col-1 content-field">Content</div>
						<div class="col-10 content-value">
							{{ config[COMPLAINT.CONTENT] }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<FormStep :config="config" :type="META.CUSTOMER_COMPLAINT" />
</template>

<script>
import FormStep from "~/system/qms/components/common/template/form/FormStep";

import {
	META,
	CUSTOMER_COMPLAINT as COMPLAINT,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "CustomerComplaintInfoStep",
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
			COMPLAINT,
		};
	},
};
</script>
<style scoped></style>
