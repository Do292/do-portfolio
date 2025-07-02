<template>
	<div class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="META.CUSTOMER_COMPLAINT"
				:menuId="MENU.CUSTOMER_COMPLAINTS"
				@searchByCondition="updateCondition"
			/>
			<CustomerComplaintInfoForm :searchCondition="searchCondition" />
		</div>
	</div>
</template>

<script>
import CustomerComplaintInfoForm from "~/system/qms/components/customerQuality/customerComplaintHandling/CustomerComplaintInfoForm";

import { ref } from "vue";

import { META } from "~/system/qms/constants/qms_meta_constants.js";
import { MENU } from "~/system/qms/constants/qms_constants.js";

export default {
	name: "CustomerComplaintHandlingForm",
	components: { CustomerComplaintInfoForm },
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
