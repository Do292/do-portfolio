<template>
	<div class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="META.NONCONFORMANCE"
				:menuId="MENU.NONCONFORMANCE_HANDLING"
				@searchByCondition="updateCondition"
			/>
			<NonconformanceInfoForm :searchCondition="searchCondition" />
		</div>
	</div>
</template>

<script>
import NonconformanceInfoForm from "~/system/qms/components/ocaManagement/nonconformanceHandling/NonconformanceInfoForm";

import { ref } from "vue";

import { META } from "~/system/qms/constants/qms_meta_constants.js";
import { MENU } from "~/system/qms/constants/qms_constants.js";

export default {
	name: "NonconformanceHandlingForm",
	components: { NonconformanceInfoForm },
	setup() {
		//==================== SearchCondition
		const searchCondition = ref([]);

		function updateCondition(condition) {
			searchCondition.value = condition;
		}

		return {
			// Serach Condition
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
