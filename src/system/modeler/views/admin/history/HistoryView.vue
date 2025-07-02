<template>
	<div>
		<HistoryForm />
	</div>
</template>

<script>
import HistoryForm from "~/system/modeler/components/admin/history/HistoryForm";

export default {
	name: "HistoryView",
	components: {
		HistoryForm,
	},
	setup() {
		return {};
	},
};
</script>
