<template>
	<div class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="SEARCH_CONDITION.ACTION_WORK_ORDER"
				:menuId="META.WORK_ORDER"
				@searchByCondition="getDataByCondition"
			/>
			<FormOverviewState
				:conditionId="SEARCH_CONDITION.WORK_ORDER_SCHEDULE_STATE"
				:orderList="orderList"
				@search="searchByState"
			></FormOverviewState>
			<FormGrid
				ref="gridRef"
				:condition="gridCondition"
				:gridId="GRIDID.WORK_ORDER"
				:menuId="MENU.ACTION_WORK_ORDER"
				:metaDataId="metaDataId"
				:searchCondition="searchCondition"
				@clickHoverCell="clickHoverCell"
			>
				<template v-slot:prefix-grid-button>
					<InputSearch
						:id="customSearchField"
						:floatLabelType="'Never'"
						:isWritable="true"
						:placeholder="'Order ID'"
						:value="customSearchValue"
						class="mr-2"
						@reset="updateCustomSearchValue('')"
						@search="clickCustomSearch"
						@update:modelValue="updateCustomSearchValue"
					>
					</InputSearch>
				</template>
				<template v-slot:grid-button>
					<div class="btn-group">
						<ButtonBasic
							:needsAuthority="false"
							:type="ACTION.DELETE"
							class="text-red"
							@onClick="openModalDeleteOrder"
						/>
					</div>
					<div class="btn-group">
						<ButtonDropdown
							:items="actions"
							:needsAuthority="false"
							@onSelect="openModalConfirmOrder"
						/>
					</div>
				</template>
			</FormGrid>
		</div>
	</div>
</template>

<script>
import { ref, inject, watch, onActivated } from "vue";
import { useExecuteData } from "~/plugins/composables/dataHandler";
import { useSearchCondition } from "~/plugins/composables/tableHandler";
import { useTab } from "~/plugins/composables/authority";
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import {
	META,
	MENU,
	GRIDID,
	WORK_ORDER,
	SEARCH_CONDITION,
} from "~/system/mes/constants/mes_meta_constants.js";
import * as COMMON from "~/system/mes/api/common.js";
import FormOverviewState from "~/system/mes/components/common/form/FormOverviewState";

export default {
	name: "ActionWorkOrderView",
	components: {
		FormOverviewState,
	},
	setup() {
		//==================== Action Order
		const { executeList } = useExecuteData();
		const { addOrSelectTab } = useTab();
		const { getDefaultEqualCondition } = useSearchCondition();

		//==================== Common
		const gridRef = ref(null);
		const metaDataId = META.WORK_ORDER;

		const actions = [
			ACTION.CANCEL,
			ACTION.CLOSE,
			ACTION.CONFIRM,
			ACTION.OPEN,
			ACTION.REJECT,
			{
				action: ACTION.HOLD,
				menuId: MENU.HOLD_WORK_ORDER,
			},
			{
				action: ACTION.RELEASE,
				menuId: MENU.RELEASE_WORK_ORDER,
			},
			{
				action: ACTION.ASSIGN_LOT_TO_WORKORDER,
				menuId: MENU.ASSIGN_LOT_TO_WORKORDER,
			},
			{
				action: ACTION.CANCEL_ASSIGN_LOT_TO_WORKORDER,
				menuId: MENU.CANCEL_ASSIGN_LOT_TO_WORKORDER,
			},
			{
				action: ACTION.ASSIGN_EQUIPMENT_TO_WORKORDER,
				menuId: MENU.ASSIGN_EQUIPMENT_TO_WORKORDER,
			},
			{
				action: ACTION.RELEASE_WORKORDER_FOR_LOT,
				menuId: MENU.RELEASE_WORKORDER_FOR_LOT,
			},
			{
				action: ACTION.CANCEL_RELEASE_WORKORDER_FOR_LOT,
				menuId: MENU.CANCEL_RELEASE_WORKORDER_FOR_LOT,
			},
		];

		const orderList = ref([]);

		watch(
			() => gridRef.value?.gridItems,
			value => {
				orderList.value = value;
			},
		);

		const customSearchField = WORK_ORDER.ID;
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

		//==================== Grid Cell Hover
		function clickHoverCell({ data }) {
			const { workOrderId } = data;
			const condition = getDefaultEqualCondition({ workOrderId });
			addOrSelectTab(MENU.WORK_ORDER_STATUS, {
				dataConditions: JSON.stringify(condition),
			});
		}

		// Modal Injection
		const { openModalConfirmBy } = inject("confirm");

		function openModalDeleteOrder() {
			const items = gridRef.value.cloneCheckItems();
			openModalConfirmBy(ACTION.DELETE, metaDataId, items, async () => {
				const result = await executeList(() =>
					COMMON.remove(metaDataId, items),
				);

				// 성공한 경우에만 그리드 데이터 초기화
				if (result) {
					gridRef.value.initGridItems();
				}
			});
		}

		function openModalConfirmOrder({ item }) {
			const { id, menuId } = item;
			if (!id) {
				// 모달 오픈이 아닌 메뉴 이동으로 변경
				addOrSelectTab(menuId);
				return;
			}

			const orders = gridRef.value.cloneCheckItems();
			openModalConfirmBy(id, metaDataId, orders, async () => {
				const result = await executeList(() =>
					COMMON.execute(metaDataId, id, orders),
				);

				// 성공한 경우 그리드 데이터 초기화
				if (result) {
					gridRef.value.initGridItems(orders);
				}
			});
		}

		return {
			// Config
			META,
			MENU,
			GRIDID,
			WORK_ORDER,
			SEARCH_CONDITION,
			// Action
			ACTION,
			actions,

			// Data
			metaDataId,

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

			// Grid Cell
			clickHoverCell,
			// Modal
			openModalDeleteOrder,
			openModalConfirmOrder,

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
:deep(.search-field span.e-input-group) {
	width: 250px !important;
}
:deep(
		.e-input-group input.e-input,
		.e-float-input.e-input-group input,
		.e-input-group.e-control-wrapper input.e-input,
		.e-float-input.e-input-group.e-control-wrapper input,
		.e-float-input input,
		.e-float-input.e-control-wrapper input
	) {
	min-height: 10px !important;
}
.search-field :deep(button) {
	margin-top: 3px;
}
</style>
