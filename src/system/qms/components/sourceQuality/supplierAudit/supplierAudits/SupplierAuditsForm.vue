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
	SUPPLIER_AUDIT,
} from "~/system/qms/constants/qms_meta_constants.js";
import { MENU } from "~/system/qms/constants/qms_constants.js";

export default {
	name: "SupplierAuditsForm",
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { fetchGridTableDef, gridTableDef } = useTableDef();
		const { addOrSelectTab } = useTab();

		// SearchCondition
		const menuId = MENU.SUPPLIER_AUDITS;
		const gridId = META.SUPPLIER_AUDIT;
		const metaDataId = META.SUPPLIER_AUDIT;
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
				[SUPPLIER_AUDIT.ID]: data[SUPPLIER_AUDIT.ID],
			};
			addOrSelectTab(MENU.SUPPLIER_AUDIT_HANDLING, state);
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

			// Link
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
