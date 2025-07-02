<template>
	<div :class="{ on: modelValue, enabled }" class="switch-box">
		<wfl-switch
			:id="switchId"
			:checked="modelValue"
			:disabled="!enabled"
			@change="$emit('update:modelValue', $event.checked)"
		></wfl-switch>
		<label v-if="label" :for="switchId">{{ label }}</label>
	</div>
</template>

<script>
export default {
	name: "SwitchTemplate",
	props: {
		modelValue: { type: Boolean, default: false },
		label: { type: String },
		enabled: { type: Boolean, default: true },
	},
	setup() {
		const switchId = `switch-${Date.now()}`;

		return { switchId };
	},
};
</script>

<style scoped>
/* Layout */
.switch-box {
	display: inline-block;
	width: max-content;
}
.switch-box :deep(.e-switch-wrapper) {
	height: 17px;
	width: 37px;
	transform: translateY(2px);
}
.switch-box :deep(.e-switch-handle) {
	width: 13px;
	height: 13px;
	background: #fff !important;
	transform: translate(2px, -0px);
}
.switch-box :deep(.e-switch-handle.e-switch-active) {
	transform: translate(3px, -0px);
}
.switch-box :deep(.e-switch-on) {
	opacity: 0.9 !important;
	background: rgb(38, 206, 49) !important;
}
.switch-box :deep(.e-switch-off) {
	opacity: 0.9 !important;
	background: #b7b7b7 !important;
}
.switch-box :deep(.e-ripple-container) {
	display: none !important;
}
.switch-box :deep(.e-switch-wrapper.e-switch-disabled .e-switch-inner) {
	background: #ffffff00 !important;
	opacity: 0.5;
}

/* Label */
.switch-box label {
	color: rgba(0, 0, 0, 0.54);
	transform: translate(5px, -2px);
}
.switch-box.on label {
	color: rgba(0, 0, 0, 0.733);
}
.switch-box:not(.enabled) label {
	opacity: 0.5;
}
</style>
