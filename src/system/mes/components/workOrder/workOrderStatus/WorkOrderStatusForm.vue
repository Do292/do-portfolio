<template>
	<div>
		<FormSearchCondition
			:conditionId="conditionId"
			:menuId="MENU.WORK_ORDER_STATUS"
			@searchByCondition="getDataByCondition"
		/>
		<Splitter :paneConfigs="horizontalConfigs">
			<template v-slot:left>
				<FormOrderCard
					ref="cardRef"
					:gridId="GRIDID.WORK_ORDER_STATUS"
					:menuId="menuId"
					:metaDataId="metaDataId"
					@select="selectOrder"
				/>
			</template>
			<template v-slot:right>
				<FormTab :items="tabList" @selectTab="selectedTab" />
				<FormGrid
					v-show="currentTabIndex === 0"
					ref="gridRef"
					:condition="condition"
					:customApi="customApi"
					:gridId="gridId"
					:initSearch="false"
					:isUseCreate="false"
					:isUseDelete="false"
					:isUseModify="false"
					:menuId="menuId"
					@clickHoverCell="clickHoverCell"
					><template v-slot:grid-path>
						<Breadcrumb
							:isUseRootBtn="true"
							:items="crumbPath"
							@clickItem="searchParentItem"
							@clickRoot="clickRootIcon"
						/>
					</template>
				</FormGrid>
				<FormGrid
					v-show="currentTabIndex === 1"
					:customItems="operationSepcItems"
					:gridId="'OperationSpec'"
					:isUseCreate="false"
					:isUseDelete="false"
					:isUseModify="false"
					:menuId="menuId"
				/>
				<FormGrid
					v-show="currentTabIndex === 2"
					:customItems="bomItems"
					:gridId="'Bom'"
					:isUseCreate="false"
					:isUseDelete="false"
					:isUseModify="false"
					:menuId="menuId"
				/>
			</template>
		</Splitter>
	</div>
</template>

<script>
import { ref, computed, watch, onActivated } from "vue";
import { useFetchData } from "~/plugins/composables/dataHandler";
import { useSpinner } from "~/plugins/composables/uiControl";

import FormOrderCard from "~/system/mes/components/common/form/FormOrderCard";

import {
	MENU,
	META,
	GRIDID,
	PROCESS_OPERATION,
	WORK_ORDER,
	LOT,
} from "~/system/mes/constants/mes_meta_constants.js";
import * as LOTAPI from "~/system/mes/api/lot.js";
import * as WORKORDER from "~/system/mes/api/work-order.js";

export default {
	name: "WorkOrderStatusForm",
	components: {
		FormOrderCard,
	},
	props: {},
	setup() {
		const cardRef = ref(null);

		//==================== Config
		const horizontalConfigs = [
			{ key: "left", size: 25, min: 0 },
			{ key: "right", size: 75, min: 0 },
		];
		const metaDataId = ref(META.WORK_ORDER);
		const menuId = ref(MENU.WORK_ORDER_STATUS);
		const gridId = ref(GRIDID.WIP);
		const tabList = ["OrderStatus", "OperationSpec", "Bom"];
		const conditionId = ref("WorkOrderStatus");

		const tabIndex = ref(0);
		const currentTabIndex = computed(() => tabIndex.value);

		const { executeWithSpinner } = useSpinner();
		const configItems = ref([
			{
				columnId: PROCESS_OPERATION.ID,
				gridId: GRIDID.LOT,
				customApi: LOTAPI.getLotListByOperation,
				condition: {},
			},
			{
				columnId: LOT.ID,
				gridId: GRIDID.EVENT_HISTORY,
				customApi: LOTAPI.getLotHistory,
				condition: {},
			},
		]);

		const bomItems = ref([]);
		const operationSepcItems = ref([]);

		const { fetchList } = useFetchData();

		const selectedOrder = ref({});
		const crumbPath = ref([]);
		const customApi = ref(() => {});
		const condition = ref({});

		watch([tabIndex, selectedOrder], ([newTabIndex, newSelectedOrder]) => {
			getGridItems(newTabIndex, newSelectedOrder);
			crumbPath.value = [];
		});

		/**
		 * 현재 index에 따라서 api연결
		 * @param {*} index 현재 index
		 * @param {*} order 선택한 workOrder
		 */
		async function getGridItems(index, order) {
			if (index === 0) {
				getRootItem(order);
			}
			if (index === 1) {
				operationSepcItems.value = await fetchList(() =>
					WORKORDER.getOperationsByOrder({
						workOrderId: order[WORK_ORDER.ID],
					}),
				);
			}
			if (index == 2) {
				bomItems.value = await fetchList(() =>
					WORKORDER.getBomListByOrder({
						workOrderId: order[WORK_ORDER.ID],
					}),
				);
			}
		}

		function getRootItem(newOrder) {
			gridId.value = GRIDID.WIP;
			customApi.value = LOTAPI.getWIPListByOrder;
			condition.value = {
				orderType: WORK_ORDER.TYPE,
				orderId: newOrder[WORK_ORDER.ID],
			};
		}

		//==================== Event
		function getDataByCondition(condition) {
			cardRef.value.fetchItemList(condition);
			crumbPath.value = [];
		}

		function clickHoverCell({ data }) {
			executeWithSpinner(async () => {
				const item = configItems.value.find(
					item => data.column.columnId == item.columnId,
				);
				setCustomItems(item, data);
			});
		}

		/**
		 * gridId.value - grid column 재할당
		 * customApi.value, condition.value - gridItem 할당
		 * crumbPath.value - cell의 value값 (array)
		 * @param {*} crumbData configItems에서 columnId기준으로 찾은 data
		 * @param {*} data clickHoverCell시 해당 column에 대한 정보
		 */
		function setCustomItems(crumbData, data) {
			let keyColumn = data.column.columnId;
			customApi.value = crumbData.customApi;
			gridId.value = crumbData.gridId;
			condition.value =
				keyColumn == PROCESS_OPERATION.ID
					? {
							orderType: WORK_ORDER.TYPE,
							data: {
								orderId: data.orderId,
								[keyColumn]: data[keyColumn],
							},
					  }
					: { [keyColumn]: data[keyColumn] };
			crumbPath.value = getBreadCrumbPath(
				data.column.columnId,
				data[data.column.columnId],
			);
		}

		/**
		 *
		 * @param {*} columnId clickHoverCell시 해당 cell의 columnId
		 * @param {*} value crumbPath.value에 추가 할 cell의 value
		 */
		function getBreadCrumbPath(columnId, value) {
			if (
				(crumbPath.value.length === 0 &&
					columnId === PROCESS_OPERATION.ID) ||
				(crumbPath.value.length === 1 && columnId === LOT.ID)
			) {
				crumbPath.value.push(value);
			}
			return crumbPath.value;
		}

		function clickRootIcon() {
			getRootItem(selectedOrder.value);
			crumbPath.value = [];
		}

		function searchParentItem(e) {
			// TODO: [수정필요] 현재는 depth가 찾아갈 수 있는 parent가 하나뿐이라서..
			let data = {
				data: {
					column: { columnId: PROCESS_OPERATION.ID },
					processOperationId: e,
					orderId: selectedOrder.value[WORK_ORDER.ID],
				},
			};
			clickHoverCell(data);
			crumbPath.value.pop();
		}

		function selectedTab({ index }) {
			tabIndex.value = index;
		}

		function selectOrder(order) {
			selectedOrder.value = order;
		}

		onActivated(() => {
			if (history.state) {
				const { dataConditions } = history.state;
				if (dataConditions) {
					getDataByCondition(JSON.parse(dataConditions));
				}
			}
		});

		return {
			// config
			cardRef,
			horizontalConfigs,
			tabList,
			metaDataId,
			menuId,
			gridId,
			conditionId,
			MENU,
			META,
			GRIDID,

			// event
			selectedTab,
			selectOrder,
			clickHoverCell,
			searchParentItem,
			clickRootIcon,
			currentTabIndex,
			getDataByCondition,

			// customItems
			crumbPath,
			customApi,
			condition,
			bomItems,
			operationSepcItems,
		};
	},
};
</script>
<style scoped></style>
