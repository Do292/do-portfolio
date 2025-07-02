<template>
	<div>
		<FormSearchCondition
			:conditionId="conditionId"
			:menuId="MENU.PRODUCTION_ORDER_STATUS"
			@searchByCondition="getDataByCondition"
		/>
		<Splitter :paneConfigs="horizontalConfigs">
			<template v-slot:left>
				<FormOrderCard
					ref="cardRef"
					:gridId="GRIDID.PRODUCTION_ORDER_STATUS"
					:menuId="menuId"
					:metaDataId="metaDataId"
					@select="selectOrder"
				/>
			</template>
			<template v-slot:right>
				<FormGrid
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
			</template>
		</Splitter>
	</div>
</template>

<script>
import { ref, watch, onActivated } from "vue";
import { useSpinner } from "~/plugins/composables/uiControl";
import FormOrderCard from "~/system/mes/components/common/form/FormOrderCard";
import {
	MENU,
	META,
	GRIDID,
	PRODUCTION_ORDER,
	PROCESS_OPERATION,
	LOT,
} from "~/system/mes/constants/mes_meta_constants.js";
import * as LOTAPI from "~/system/mes/api/lot.js";

export default {
	name: "ProductionOrderStatusForm",
	components: {
		FormOrderCard,
	},
	setup() {
		const cardRef = ref(null);

		//==================== Config
		const horizontalConfigs = [
			{ key: "left", size: 25, min: 0 },
			{ key: "right", size: 75, min: 0 },
		];
		const metaDataId = ref(META.PRODUCTION_ORDER);
		const menuId = ref(MENU.PRODUCTION_ORDER_STATUS);
		const gridId = ref(GRIDID.WIP);
		const conditionId = ref("ProductionOrderStatus");

		const selectedOrder = ref({});
		const crumbPath = ref([]);
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
		const customApi = ref(() => {});
		const condition = ref({});

		const { executeWithSpinner } = useSpinner();

		watch(selectedOrder, newSelectedOrder => {
			getRootItem(newSelectedOrder);
		});

		function getRootItem(newOrder) {
			if (newOrder) {
				gridId.value = GRIDID.WIP;
				customApi.value = LOTAPI.getWIPListByOrder;
				condition.value = {
					orderType: PRODUCTION_ORDER.TYPE,
					orderId: newOrder[PRODUCTION_ORDER.ID],
				};
			}
		}

		//==================== Event
		function getDataByCondition(condition) {
			cardRef.value.fetchItemList(condition);
			crumbPath.value = [];
		}

		function selectOrder(order) {
			selectedOrder.value = order;
		}

		function clickHoverCell({ data }) {
			executeWithSpinner(async () => {
				// 클릭한 columnId을 기준으로 configItems에서 찾아 item으로 가짐
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
							orderType: PRODUCTION_ORDER.TYPE,
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
					orderId: selectedOrder.value[PRODUCTION_ORDER.ID],
				},
			};
			clickHoverCell(data);
			crumbPath.value.pop();
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
			metaDataId,
			menuId,
			gridId,
			conditionId,
			MENU,
			META,
			GRIDID,

			// event
			getDataByCondition,
			selectOrder,
			clickHoverCell,
			searchParentItem,
			clickRootIcon,

			// customItems
			crumbPath,
			customApi,
			condition,
		};
	},
};
</script>
<style scoped></style>
