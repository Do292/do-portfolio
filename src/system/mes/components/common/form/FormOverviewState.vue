<template>
	<div class="row">
		<div class="col status-container">
			<div class="tab-box">
				<ul class="tabs">
					<li
						v-for="{
							detailId,
							condition,
							count,
							defaultValue,
							label,
						} in statusList"
						:key="detailId"
						class="tab-name status-tab"
						@click="$emit('search', { condition })"
					>
						<div class="number-label">
							<div>{{ count }}</div>
						</div>
						<div class="state-box">
							<div
								:class="getStateIcon(defaultValue)"
								class="state-icon"
							></div>
							<div class="state-name">
								{{ label }}
								<!-- getTabLabel(name) -->
							</div>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, watch, getCurrentInstance, onBeforeMount } from "vue";
import { useSearchCondition } from "~/plugins/composables/tableHandler";
import { STATUS_ICON } from "~/system/mes/constants/mes_constants.js";
import { useNaming } from "~/plugins/composables/locale";

export default {
	name: "FormOverviewState",
	components: {},
	props: {
		conditionId: { type: String, required: true, default: "ScheduleState" },
		orderList: { type: Array, default: () => [] },
	},
	emits: ["search"],
	setup(props) {
		const { proxy } = getCurrentInstance();
		const { pascalOrKebabToCamel } = useNaming();

		//==================== Data Setting
		const { searchConditionDetail, fetchSearchConditionDetail } =
			useSearchCondition();

		const statusList = ref([]);
		const defaultStates = ref([]);
		const todayDate = proxy.$moment().format("YYYY-MM-DD");

		const isInitialize = ref(false);

		onBeforeMount(async () => {
			await setDefaultStatusList();
		});

		const setDefaultStatusList = async () => {
			if (isInitialize.value) return;
			await fetchSearchConditionDetail(props.conditionId);
			defaultStates.value = searchConditionDetail.value.map(detail => {
				var {
					searchConditionDetailId: detailId,
					label,
					dataType,
					operationType,
					defaultValue,
				} = detail;
				var conditionKey = detailId.includes(".")
					? detailId.split(".")[0]
					: detailId;
				var value =
					detailId.includes(".") && defaultValue === "Today"
						? todayDate
						: defaultValue;
				return {
					count: 0,
					detailId,
					label,
					defaultValue,
					condition: {
						key: conditionKey,
						dataType,
						operationType,
						values: [value],
					},
				};
			});
			statusList.value = defaultStates.value;
			isInitialize.value = true;
		};

		function getStateIcon(value) {
			return `aimcons_${STATUS_ICON[pascalOrKebabToCamel(value)]}`;
		}

		watch(
			() => props.orderList,
			() => {
				setStatusList();
			},
		);

		async function setStatusList() {
			await setDefaultStatusList();

			// status 리스트 count 초기화 필요
			defaultStates.value.map(s => {
				s.count = 0;
			});

			props.orderList
				.filter(row => row.startDate && row.endDate)
				.map(row => {
					defaultStates.value.map(s => {
						const { key, dataType, operationType, values } =
							s.condition;
						if (
							dataType == "String" &&
							operationType == "Equal" &&
							row[key] == values[0]
						) {
							s.count++;
						} else if (
							dataType == "Date" &&
							checkDate(row[key], s.condition)
						) {
							s.count++;
						}
					});
				});

			statusList.value = defaultStates.value;
		}

		function checkDate(date, { operationType, values }) {
			if (!date) return false;
			const normalizedDate = old => new Date(old).setHours(0, 0, 0, 0);

			switch (operationType) {
				case "Equal":
					return normalizedDate(date) === normalizedDate(values[0]);
				case "LessThan":
					return normalizedDate(date) < normalizedDate(values[0]);
				default:
					return false;
			}
		}

		return {
			// Data
			getStateIcon,
			statusList,
			// Function
			setStatusList,
		};
	},
};
</script>
