<template>
	<CheckboxTemplate
		:field="checkboxId"
		:modelValue="checked"
		@update:modelValue="changeCheckbox"
	/>
</template>

<script>
import CheckboxTemplate from "../template/CheckboxTemplate.vue";

import { computed } from "vue";

export default {
	name: "CheckboxColumn",
	components: { CheckboxTemplate },
	props: {
		columnConfig: { type: Object },
		configs: { type: Array },
	},
	setup(props, { emit }) {
		const checkboxId = computed(() => {
			const { index, column } = props.columnConfig;
			return `checkbox-${index}-${column.field}`;
		});

		const checked = computed(() => {
			const { index, column } = props.columnConfig;
			return (
				props.configs.length > 0 && props.configs[index][column.field]
			);
		});

		function changeCheckbox(flag) {
			const { index, column } = props.columnConfig;
			emit("onChange", +index, column.field, flag);
		}

		return { checkboxId, checked, changeCheckbox };
	},
};
</script>
