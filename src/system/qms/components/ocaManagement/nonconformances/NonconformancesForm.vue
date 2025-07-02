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
import { ref, computed, onMounted } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import { useTab } from "~/plugins/composables/authority";

import {
	META,
	NONCONFORMANCE,
} from "~/system/qms/constants/qms_meta_constants.js";
import { MENU } from "~/system/qms/constants/qms_constants.js";

export default {
	name: "NonconformancesForm",
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { fetchGridTableDef, gridTableDef } = useTableDef();
		const { addOrSelectTab } = useTab();

		// SearchCondition
		const menuId = MENU.NONCONFORMANCES;
		const gridId = META.NONCONFORMANCE;
		const metaDataId = META.NONCONFORMANCE;
		const conditionId = computed(
			() => gridTableDef.value.searchConditionId,
		);
		const searchCondition = ref([]);

		function updateCondition(condition) {
			searchCondition.value = condition;
		}

		onMounted(async () => {
			await fetchGridTableDef(menuId, gridId);
		});

		/**
		 * 핸들링 화면으로 이동
		 * @param {Object} event
		 * @param {Object} event.data
		 */
		function goToHandling({ data }) {
			const state = {
				[NONCONFORMANCE.ID]: data[NONCONFORMANCE.ID],
			};
			addOrSelectTab(MENU.NONCONFORMANCE_HANDLING, state);
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
/* Tabtemplate */
:deep(.e-tab.e-background .e-tab-header) {
	border-bottom: 1px solid #f0f0f0 !important;
}
:deep(.e-tab.e-background .e-tab-header .e-toolbar-item .e-tab-wrap) {
	background-color: transparent !important;
	/* border: 1px solid #f0f0f0 !important; */
}
:deep(.e-tab.e-background .e-tab-header .e-toolbar-item.e-active .e-tab-wrap) {
	border-bottom: 3px solid #6e88ef !important;
	background-color: white !important;
}

/* grid */
:deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 320px) !important;
}
</style>
