<template>
	<div class="card">
		<ModalAction
			v-if="isShowModalAction"
			:action="action"
			:gridId="gridIdValue"
			:menuId="menuId"
			:metaDataId="metaIdValue"
			:orderKey="orderKeyValue"
			@close="closeModalAction"
		/>
		<div class="card-body">
			<FormSearchCondition
				:conditionId="META.PRODUCTION_ORDER"
				:menuId="META.PRODUCTION_ORDER"
				@searchByCondition="getDataByCondition"
			/>
			<FormGrid
				ref="gridRef"
				:condition="gridCondition"
				:metaDataId="metaDataId"
				:searchCondition="searchCondition"
			>
				<template v-slot:custom-content>
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
import { ACTION } from "~/system/mes/constants/mes_constants.js";
import {
	META,
	MENU,
	PRODUCTION_ORDER,
	SEARCH_CONDITION,
} from "~/system/mes/constants/mes_meta_constants.js";
import * as COMMON from "~/system/mes/api/common.js";
import ModalAction from "~/system/mes/components/common/modal/ModalAction.vue";

export default {
	name: "ActionInventoryView",
	components: {
		ModalAction,
	},
	setup() {
		//==================== Common
		const gridRef = ref(null);
		const metaDataId = META.PRODUCTION_ORDER;

		const actions = [
			ACTION.CANCEL,
			ACTION.CLOSE,
			ACTION.CONFIRM,
			ACTION.OPEN,
			ACTION.REJECT,
			{
				action: ACTION.HOLD,
				gridIdValue: META.PRODUCTION_ORDER,
				menuId: MENU.HOLD_PRODUCTION_ORDER,
				metaIdValue: META.HOLD_PRODUCTION_ORDER,
				orderKeyValue: PRODUCTION_ORDER.ID,
			},
			{
				action: ACTION.RELEASE,
				gridIdValue: META.PRODUCTION_ORDER,
				menuId: MENU.RELEASE_PRODUCTION_ORDER,
				metaIdValue: META.RELEASE_PRODUCTION_ORDER,
				orderKeyValue: PRODUCTION_ORDER.ID,
			},
		];

		const orderList = ref([]);

		watch(
			() => gridRef.value?.gridItems,
			value => {
				orderList.value = value;
			},
		);

		const customSearchField = PRODUCTION_ORDER.ID;
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

		//==================== Action Order
		const { executeList } = useExecuteData();

		//==================== ModalAction
		const isShowModalAction = ref(false);
		const action = ref(""),
			gridIdValue = ref(""),
			menuId = ref(""),
			metaIdValue = ref(""),
			orderKeyValue = ref("");

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
			if (item.id == "") {
				action.value = item.action;
				gridIdValue.value = item.gridIdValue;
				metaIdValue.value = item.metaIdValue;
				menuId.value = item.menuId;
				orderKeyValue.value = item.orderKeyValue;
				isShowModalAction.value = true;
				return;
			}

			const orders = gridRef.value.cloneCheckItems();
			openModalConfirmBy(item.id, metaDataId, orders, async () => {
				const result = await executeList(() =>
					COMMON.execute(metaDataId, item.id, orders),
				);

				// 성공한 경우 그리드 데이터 초기화
				if (result) {
					gridRef.value.initGridItems(orders);
				}
			});
		}

		function closeModalAction(items) {
			isShowModalAction.value = false;
			gridRef.value.initGridItems(items);
		}

		return {
			// Config
			META,
			ACTION,
			MENU,
			PRODUCTION_ORDER,
			SEARCH_CONDITION,
			actions,

			// ModalAction
			action,
			gridIdValue,
			menuId,
			metaIdValue,
			orderKeyValue,

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
			openModalDeleteOrder,
			openModalConfirmOrder,

			isShowModalAction,
			closeModalAction,

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
