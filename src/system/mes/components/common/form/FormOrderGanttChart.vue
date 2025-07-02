<template>
	<mes-ganttchart
		ref="ganttRef"
		:chartSeries="orderSeriesData"
		:refreshFunc="refreshFunc"
		:tooltipContent="tooltipContent"
		@search="$emit('search', $event)"
	></mes-ganttchart>
</template>

<script>
import { ref, watch, getCurrentInstance } from "vue";

import MesGanttChart from "#/mes/components/common/MesGanttChart";

export default {
	name: "FormOrderGanttChart",
	components: { "mes-ganttchart": MesGanttChart },
	props: {
		orderKey: { type: String },
		orderList: { type: Array, default: () => [] },
		refreshFunc: { type: Function },
	},
	emits: ["search"],
	setup(props) {
		const { proxy } = getCurrentInstance();
		//==================== Data Setting
		const orderSeriesData = ref([]);

		function setChartData() {
			const parseDateString = dateString => {
				return new Date(dateString.replace(" ", "T") + "Z");
			};

			orderSeriesData.value = props.orderList
				.filter(row => row.startDate && row.endDate)
				.map(row => {
					const { startDate, endDate, dueDate, description, note } =
						row;
					const orderId = row[props.orderKey];

					const startDateString = parseDateString(startDate);
					const endDateString = parseDateString(endDate);
					if (startDateString.getTime() === endDateString.getTime()) {
						// end날짜가 start와 같을 시 차트 표기를 위해, end의 시간을 23시59분으로 셋팅해줌.
						endDateString.setUTCHours(23, 59, 59, 999);
					}

					return {
						start: Date.parse(startDateString.toISOString()),
						end: Date.parse(endDateString.toISOString()),
						dueDateStamp: dueDate
							? Date.parse(parseDateString(dueDate).toISOString())
							: null,

						name: orderId,
						customName: description || note || orderId,
						y: 0,
						...row,
						// completed: {
						// 	amount: 0.7,
						// },
					};
				});

			proxy.$refs.ganttRef.updateSeriesData(orderSeriesData.value);
		}

		const tooltipContent = [
			{ field: "name", title: "Order ID", dateFormat: null },
			{ field: "start", title: "Start Date", dateFormat: "%Y-%m-%d" },
			{ field: "end", title: "End Date", dateFormat: "%Y-%m-%d" },
			{
				field: "dueDateStamp",
				title: "Due Date",
				dateFormat: "%Y-%m-%d",
			},
			{ field: "orderState", title: "Order State", dateFormat: null },
			{ field: "holdState", title: "Hold State", dateFormat: null },
			{ field: "description", title: "Description", dateFormat: null },
			{ field: "note", title: "Note", dateFormat: null },
		];

		watch(
			() => props.orderList,
			() => {
				setChartData();
			},
		);

		return {
			// Function
			setChartData,

			// Data
			orderSeriesData,
			tooltipContent,
		};
	},
};
</script>
