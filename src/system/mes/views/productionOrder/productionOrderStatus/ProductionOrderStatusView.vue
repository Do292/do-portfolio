<template>
	<div class="card">
		<div class="card-body">
			<ProductionOrderStatusForm />
		</div>
	</div>
</template>

<script>
import ProductionOrderStatusForm from "~/system/mes/components/productionOrder/productionOrderStatus/ProductionOrderStatusForm";

export default {
	name: "ProductionOrderStatusView",
	components: { ProductionOrderStatusForm },
	setup() {
		return {};
	},
};
</script>
