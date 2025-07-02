<template>
	<wfl-numericbox
		:showClearButton="showClearButton"
		:value="numericValue"
		@update:value="$emit('update:modelValue', $event)"
	></wfl-numericbox>
</template>

<script>
import { computed } from "vue";

export default {
	name: "InputNumber",
	props: {
		modelValue: { type: [Number, String] },
		showClearButton: { type: Boolean, default: false },
	},
	emits: ["update:modelValue"],
	setup(props) {
		// null, undefined, ""와 0의 경우 분리
		const numericValue = computed(() =>
			![null, undefined, ""].includes(props.modelValue)
				? +props.modelValue
				: null,
		);
		return { numericValue };
	},
};
</script>
