<template>
	<div class="handling-info-box">
		<div v-for="(item, index) of orderList" :key="getKey(item)">
			<div v-if="index !== 0" class="handling-info-border"></div>
			<div
				:class="[
					'handling-info-card',
					{ selecting: isItemSelected(item) },
				]"
				:style="{ borderColor: getBorderLeftColor(item) }"
				@click="selectItem(item)"
			>
				<div class="handling-info-header mb-1">
					<div class="handling-info-title">
						<span>{{ getKey(item) }}</span>
					</div>
					<div>
						<span class="handling-info-priority mr-1">
							<!-- <i v-if="item.holdState" class="aimcons_tag1"></i> -->
							{{ item.holdState }}
						</span>
					</div>
				</div>
				<div class="card-contents">
					<table class="categoryList">
						<tr v-for="col in config" :key="col.field">
							<td
								style="
									width: 44%;
									font-weight: 600 !important;
									padding-right: 10px;
								"
							>
								{{ $t(col.label) }}
							</td>
							<td style="width: 56%">
								{{ getValue(col.field, item) }}
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, computed, onBeforeMount } from "vue";
import { useSpinner } from "~/plugins/composables/uiControl";
import {
	useColumnDef,
	useFieldColumn,
} from "~/plugins/composables/tableHandler";
import { useFetchData } from "~/plugins/composables/dataHandler";
import * as COMMON from "~/api/common";
import { MENU } from "~/system/mes/constants/mes_meta_constants.js";

export default {
	name: "FormOrderCard",
	props: {
		metaDataId: { type: String },
		gridId: { type: String },
		menuId: { type: String },
	},
	setup(props, { emit }) {
		const orderList = ref([]);
		const { gridColumns, fetchGridColumns } = useColumnDef();
		const { fetchList } = useFetchData();
		const { executeWithSpinner } = useSpinner();

		//==================== Key
		const PRODUCTION_ORDER_KEY = "productionOrderId";
		const WORK_ORDER_KEY = "workOrderId";

		//==================== Field
		const { checkColumnVisible } = useFieldColumn();
		const selectedItem = ref({});
		const config = computed(() =>
			gridColumns.value.filter(checkColumnVisible),
		);

		const isItemSelected = computed(() => item => {
			if (props.menuId === MENU.PRODUCTION_ORDER_STATUS) {
				return (
					selectedItem.value[PRODUCTION_ORDER_KEY] ===
					item[PRODUCTION_ORDER_KEY]
				);
			} else if (props.menuId === MENU.WORK_ORDER_STATUS) {
				return (
					selectedItem.value[WORK_ORDER_KEY] === item[WORK_ORDER_KEY]
				);
			}
			return false;
		});

		function selectItem(config) {
			selectedItem.value = config;
			emit("select", config);
		}

		function fetchItemList(searchCondition) {
			const metaDataId = toCamelCase(props.metaDataId);

			executeWithSpinner(async () => {
				orderList.value = await fetchList(() =>
					COMMON.getBy({ metaDataId, searchCondition }),
				);
				if (orderList.value) {
					selectItem(orderList.value[0]);
				}
			});
		}
		function toCamelCase(str) {
			return str.charAt(0).toLowerCase() + str.slice(1);
		}

		// card columns
		onBeforeMount(async () => {
			await fetchGridColumns(props.menuId, props.gridId);
		});

		function getValue(field, item) {
			if (field in item) {
				return item[field];
			}
		}
		function getBorderLeftColor(item) {
			const stateColors = {
				Created: "#06c755",
				Released: "#0744cc",
			};

			const state =
				props.menuId === MENU.PRODUCTION_ORDER_STATUS
					? item.orderState
					: props.menuId === MENU.WORK_ORDER_STATUS
					? item.workOrderState
					: null;

			return state ? stateColors[state] : "black";
		}

		function getKey(item) {
			const keyMap = {
				[MENU.PRODUCTION_ORDER_STATUS]: PRODUCTION_ORDER_KEY,
				[MENU.WORK_ORDER_STATUS]: WORK_ORDER_KEY,
			};
			const key = keyMap[props.menuId];
			return key ? item[key] : "";
		}

		return {
			config,
			orderList,
			getKey,
			getValue,
			fetchItemList,

			isItemSelected,
			selectItem,
			getBorderLeftColor,
		};
	},
};
</script>

<style scoped>
.handling-info-priority {
	background: #fce4ec;
	color: #d81b60;
}
</style>
