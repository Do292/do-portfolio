<template>
	<wfl-textbox
		ref="inputRef"
		:enteredValue="modelValue"
		:multiline="multiline"
		:showClearButton="showClearButton"
		:type="inputType"
		autocomplete="off"
		@input="$emit('update:modelValue', $event.value)"
	></wfl-textbox>
</template>

<script>
import { ref, computed } from "vue";

export default {
	name: "Textbox",
	props: {
		showClearButton: { type: Boolean, default: true },
		modelValue: { type: String, default: "" },
		multiline: { type: Boolean, default: false },
		field: { type: String },
	},
	setup(props) {
		//==================== Input
		const inputRef = ref(null);
		const inputType = computed(() =>
			/^password$/i.test(props.field) ? "password" : "text",
		);

		return { inputRef, inputType };
	},
};
</script>

<style></style>
