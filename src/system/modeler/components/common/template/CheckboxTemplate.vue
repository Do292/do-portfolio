<template>
	<span class="check-template">
		<wfl-checkbox
			:id="field"
			:checked="modelValue"
			:label="header"
			labelPosition="After"
			@change="$emit('update:modelValue', $event.checked)"
		></wfl-checkbox>
	</span>
</template>

<script>
export default {
	name: "CheckboxTemplate",
	props: {
		field: { type: String },
		modelValue: { type: Boolean, default: false },
		header: { type: String },
	},
};
</script>
<style scoped></style>
