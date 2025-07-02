<template>
	<div class="card">
		<div class="card-body">
			<div>
				<FormOverviewState
					:conditionId="
						SEARCH_CONDITION.PRODUCTION_ORDER_SCHEDULE_STATE
					"
					:orderList="orderList"
					@search="searchByState"
				></FormOverviewState>
				<FormOrderGanttChart
					:orderKey="PRODUCTION_ORDER.ID"
					:orderList="orderList"
					:refreshFunc="getOrderData"
					@search="searchByChart"
				></FormOrderGanttChart>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import { useSpinner } from "~/plugins/composables/uiControl";
import { useTab } from "~/plugins/composables/authority";

import {
	MENU,
	META,
	SEARCH_CONDITION,
	PRODUCTION_ORDER,
} from "~/system/mes/constants/mes_meta_constants.js";
import * as COMMON from "~/system/mes/api/common.js";

import FormOverviewState from "~/system/mes/components/common/form/FormOverviewState";
import FormOrderGanttChart from "~/system/mes/components/common/form/FormOrderGanttChart";

export default {
	name: "ScheduleProductionOrderView",
	components: {
		FormOverviewState,
		FormOrderGanttChart,
	},
	setup() {
		const { executeWithSpinner } = useSpinner();
		const { addOrSelectTab } = useTab();

		//==================== Common
		const metaDataId = META.PRODUCTION_ORDER;
		const orderList = ref([]);

		onMounted(async () => {
			await nextTick();
			await getOrderData();
		});

		const getOrderData = async () => {
			executeWithSpinner(async () => {
				const { data } = await COMMON.getList(metaDataId);
				orderList.value = data.data;
			}, 100);
		};

		function searchByState({ condition }) {
			addOrSelectTab(MENU.ACTION_PRODUCTION_ORDER, {
				dataConditions: JSON.stringify([condition]),
			});
		}

		function searchByChart({ productionOrderId }) {
			addOrSelectTab(MENU.ACTION_PRODUCTION_ORDER, {
				productionOrderId,
			});
		}

		return {
			// API
			COMMON,

			// Config
			META,
			SEARCH_CONDITION,
			PRODUCTION_ORDER,

			// DATA
			orderList,

			// Function
			getOrderData,
			searchByState,
			searchByChart,
		};
	},
};
</script>
