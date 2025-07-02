<template>
	<div>
		<!-- <FormOverviewState
			:conditionId="SEARCH_CONDITION.PRODUCTION_ORDER_ORDERSTATUS_WIP"
			:orderList="orderList"
			class="mt-2"
			@search="searchByState"
		></FormOverviewState> -->
		<FormGrid
			ref="gridRef"
			:condition="gridCondition"
			:customItems="customItems"
			:gridId="gridId"
			:isUseCreate="false"
			:isUseDelete="false"
			:isUseModify="false"
			:menuId="menuId"
			:searchCondition="searchCondition"
			:useMetaColumn="false"
		>
		</FormGrid>
	</div>
</template>

<script>
import { ref, watch, onActivated } from "vue";
import {
	META,
	MENU,
	PRODUCTION_ORDER,
	SEARCH_CONDITION,
} from "~/system/mes/constants/mes_meta_constants.js";
// import FormOverviewState from "~/system/mes/components/common/form/FormOverviewState";

export default {
	name: "OrderStatusForm",
	components: {
		// FormOverviewState,
	},
	props: {
		customItems: { type: Array, default: () => [] },
		menuId: { type: String },
		gridId: { type: String },
	},
	setup() {
		//==================== Common
		const gridRef = ref(null);
		const orderList = ref([]);

		watch(
			() => gridRef.value?.gridItems,
			value => {
				orderList.value = value;
			},
		);

		const customSearchField = "productionOrderId";
		const customSearchValue = ref("");
		const gridCondition = ref({});
		const searchCondition = ref([]);

		onActivated(() => {
			if (history.state) {
				const { [customSearchField]: searchValue, dataConditions } =
					history.state;
				if (searchValue) {
					setGridCondition(searchValue);
					customSearchValue.value = "";
				}
				if (dataConditions) {
					setSearchCondition(JSON.parse(dataConditions));
				}
			}
		});

		function setGridCondition(value) {
			searchCondition.value = [];
			gridCondition.value = value ? { [customSearchField]: value } : {};
		}
		function setSearchCondition(value) {
			searchCondition.value = value;
			gridCondition.value = {};
		}

		//==================== Order Status
		function searchByState({ condition }) {
			setSearchCondition([condition]);
			customSearchValue.value = "";
		}

		//==================== Grid Custom Search
		function updateCustomSearchValue(value) {
			customSearchValue.value = value;
		}
		function clickCustomSearch() {
			setGridCondition(customSearchValue.value);
		}

		//==================== Search Condition
		const getDataByCondition = async condition => {
			searchCondition.value = condition;
		};

		return {
			// Config
			META,
			MENU,
			PRODUCTION_ORDER,
			SEARCH_CONDITION,

			// Order Status
			searchByState,

			// Search Condition
			getDataByCondition,
			searchCondition,
			// Order Status
			orderList,
			// Order
			gridRef,
			gridCondition,

			customSearchField,
			customSearchValue,
			updateCustomSearchValue,
			clickCustomSearch,
		};
	},
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(100vh - 381px) !important;
}

.search-field :deep(.e-input-group) {
	width: 220px;
}
.search-field :deep(.e-input-group input) {
	min-height: 10px;
}
.search-field :deep(button) {
	margin-top: 3px;
}
</style>
