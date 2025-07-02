<template>
	<div class="handling-info-container">
		<Splitter :paneConfigs="horizontalConfigs">
			<template v-slot:left>
				<CustomerComplaintInfoCard
					:searchCondition="searchCondition"
					@select="selectComplaint"
				/>
			</template>
			<template v-slot:right>
				<CustomerComplaintInfoStep :config="selectedComplaint" />
			</template>
		</Splitter>
	</div>
</template>

<script>
import CustomerComplaintInfoCard from "~/system/qms/components/customerQuality/customerComplaintHandling/CustomerComplaintInfoCard";
import CustomerComplaintInfoStep from "~/system/qms/components/customerQuality/customerComplaintHandling/CustomerComplaintInfoStep";

import { ref } from "vue";
import { META } from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "CustomerComplaintInfoForm",
	components: { CustomerComplaintInfoCard, CustomerComplaintInfoStep },
	props: {
		searchCondition: { type: Array },
	},
	setup() {
		//==================== Config
		const horizontalConfigs = [
			{ key: "left", size: 30, min: 0 },
			{ key: "right", size: 70, min: 0 },
		];

		//==================== Complaint
		const selectedComplaint = ref({});

		function selectComplaint(complaint) {
			if (complaint !== selectedComplaint.value) {
				selectedComplaint.value = complaint;
			}
		}

		return {
			// Config
			META,
			horizontalConfigs,

			// Complaint
			selectedComplaint,
			selectComplaint,
		};
	},
};
</script>
<style scoped></style>
