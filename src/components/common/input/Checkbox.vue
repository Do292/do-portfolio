<template>
	<span class="suite-checkbox">
		<wfl-checkbox
			:id="field"
			:checked="modelValue"
			:disabled="disabled"
			:label="header"
			labelPosition="After"
			@change="$emit('update:modelValue', $event.checked)"
		></wfl-checkbox>
	</span>
</template>

<script>
export default {
	name: "Checkbox",
	props: {
		field: { type: String },
		modelValue: { type: Boolean, default: false },
		header: { type: String },
		disabled: { type: Boolean, default: false },
	},
};
</script>
<style scoped></style>
