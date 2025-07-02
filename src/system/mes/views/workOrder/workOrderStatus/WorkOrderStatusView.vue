<template>
	<div class="card">
		<div class="card-body">
			<WorkOrderStatusForm />
		</div>
	</div>
</template>

<script>
import WorkOrderStatusForm from "~/system/mes/components/workOrder/workOrderStatus/WorkOrderStatusForm";

export default {
	name: "WorkOrderStatusView",
	components: { WorkOrderStatusForm },
	setup() {
		return {};
	},
};
</script>
