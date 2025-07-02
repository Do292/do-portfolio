<template>
	<CheckboxTemplate
		:field="checkboxId"
		:header="label"
		:modelValue="checked"
		@update:modelValue="changeCheckbox"
	/>
</template>

<script>
import CheckboxTemplate from "../template/CheckboxTemplate.vue";

import { computed } from "vue";

export default {
	name: "CheckboxHeader",
	components: { CheckboxTemplate },
	props: {
		columnConfig: { type: Object },
		configs: { type: Array },
	},
	setup(props, { emit }) {
		const checkboxId = computed(() => `header-${props.columnConfig.field}`);

		const checked = computed(() => {
			const { field } = props.columnConfig;
			return (
				props.configs.length > 0 &&
				props.configs.every(config => config[field])
			);
		});

		const label = computed(() => {
			return props.columnConfig?.headerText;
		});

		function changeCheckbox(flag) {
			const { field } = props.columnConfig;
			emit("onChange", field, flag);
		}

		return { checkboxId, checked, label, changeCheckbox };
	},
};
</script>
<style scoped>
.check-template :deep(.e-checkbox-wrapper) {
}
.check-template :deep(.e-label) {
	font-family: "Roboto", "Segoe UI", "GeezaPro", "DejaVu Serif", "sans-serif",
		"-apple-system", "BlinkMacSystemFont" !important;
	font-weight: 500;
	color: #0000008a !important;
}
</style>
