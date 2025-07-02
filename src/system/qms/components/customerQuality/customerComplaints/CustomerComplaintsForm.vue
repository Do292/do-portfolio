<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="conditionId"
				:menuId="menuId"
				@searchByCondition="updateCondition"
			/>
			<FormGrid
				:gridId="gridId"
				:menuId="menuId"
				:metaDataId="metaDataId"
				:searchCondition="searchCondition"
				@clickHoverCell="goToHandling"
				@create="$emit('create', $event)"
				@delete="$emit('delete', $event)"
				@modify="$emit('modify', $event)"
				@onSelectionChanged="setInformation"
			/>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import { ref, computed, onBeforeMount } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import { useTab } from "~/plugins/composables/authority";

import {
	META,
	CUSTOMER_COMPLAINT,
} from "~/system/qms/constants/qms_meta_constants.js";
import { MENU } from "~/system/qms/constants/qms_constants.js";

export default {
	name: "CustomerComplaintsForm",
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { fetchGridTableDef, gridTableDef } = useTableDef();
		const { addOrSelectTab } = useTab();

		// SearchCondition
		const menuId = MENU.CUSTOMER_COMPLAINTS;
		const gridId = META.CUSTOMER_COMPLAINT;
		const metaDataId = META.CUSTOMER_COMPLAINT;
		const conditionId = computed(
			() => gridTableDef.value.searchConditionId,
		);
		const searchCondition = ref([]);

		function updateCondition(condition) {
			searchCondition.value = condition;
		}

		onBeforeMount(async () => {
			await fetchGridTableDef(menuId, gridId);
		});

		/**
		 * 핸들링 화면으로 이동
		 * @param {Object} event
		 * @param {Object} event.data
		 */
		function goToHandling({ data }) {
			const state = {
				[CUSTOMER_COMPLAINT.ID]: data[CUSTOMER_COMPLAINT.ID],
			};
			addOrSelectTab(MENU.CUSTOMER_COMPLAINT_HANDLING, state);
		}

		return {
			// Config
			META,
			isShowInformation,
			infoConfig,
			setInformation,

			// Serach Condition
			updateCondition,
			conditionId,
			menuId,
			metaDataId,
			gridId,
			searchCondition,

			goToHandling,
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
