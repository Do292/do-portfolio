<template>
	<div class="handling-info-container">
		<Splitter :paneConfigs="horizontalConfigs">
			<template v-slot:left>
				<NonconformanceInfoCard
					:searchCondition="searchCondition"
					@select="selectNonconformance"
				/>
			</template>
			<template v-slot:right>
				<NonconformanceInfoStep :config="selectedNonconformance" />
			</template>
		</Splitter>
	</div>
</template>

<script>
import NonconformanceInfoCard from "~/system/qms/components/ocaManagement/nonconformanceHandling/NonconformanceInfoCard";
import NonconformanceInfoStep from "~/system/qms/components/ocaManagement/nonconformanceHandling/NonconformanceInfoStep";

import { ref } from "vue";
import { META } from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "NonconformanceInfoForm",
	components: { NonconformanceInfoCard, NonconformanceInfoStep },
	props: {
		searchCondition: { type: Array },
	},
	setup() {
		//==================== Config
		const horizontalConfigs = [
			{ key: "left", size: 30, min: 0 },
			{ key: "right", size: 70, min: 0 },
		];

		//==================== Nonconformance
		const selectedNonconformance = ref({});

		function selectNonconformance(nonconformance) {
			if (nonconformance !== selectedNonconformance.value) {
				selectedNonconformance.value = nonconformance;
			}
		}

		return {
			// Config
			META,
			horizontalConfigs,

			// Complaint
			selectedNonconformance,
			selectNonconformance,
		};
	},
};
</script>
<style scoped></style>
