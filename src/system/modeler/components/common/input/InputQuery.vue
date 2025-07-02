<template>
	<div class="query-field">
		<InputText
			:enabled="!isDisabled"
			:floatLabelType="floatLabelType"
			:modelValue="modelValue"
			:placeholder="placeholder"
			:resizing="resizing"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
		<ButtonQuery
			:dependency="tableId"
			:isDisabled="isDisabled"
			@apply="$emit('update:modelValue', $event)"
		/>
	</div>
</template>

<script>
import InputText from "~/system/modeler/components/common/input/InputText";
import ButtonQuery from "~/system/modeler/components/common/button/ButtonQuery";

export default {
	name: "InputQuery",
	components: { InputText, ButtonQuery },
	props: {
		tableId: { type: String },
		modelValue: { type: String },
		isDisabled: { type: Boolean, default: false },
		resizing: { type: Boolean, default: false },

		// Label
		placeholder: { type: String },
		floatLabelType: { type: String },
	},
	emits: ["update:modelValue"],
};
</script>

<style scoped>
/* Button */
.query-field {
	position: relative;
}
.query-field > :deep(.btn-simple) {
	position: absolute;
	right: 1px;
	top: 6px;
}
:deep(.btn-simple:hover i) {
	color: #474747 !important;
}

/* Input  */
:deep(.e-input-group .e-clear-icon) {
	transform: translate(-20px, -2px);
}
:deep(.e-input-group.e-multi-line-input .e-clear-icon) {
	transform: translate(-20px, -2px);
}
</style>
