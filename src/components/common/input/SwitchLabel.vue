<template>
	<div :class="{ on: modelValue, enabled }" class="switch-box">
		<label v-if="isLeftPosition" :for="switchId">{{ label }}</label>
		<wfl-switch
			:id="switchId"
			:checked="modelValue"
			:disabled="!enabled"
			@change="$emit('update:modelValue', $event.checked)"
		></wfl-switch>
		<label v-if="!isLeftPosition" :for="switchId">{{ label }}</label>
	</div>
</template>

<script>
import { computed } from "vue";
export default {
	name: "SwitchLabel",
	props: {
		modelValue: { type: Boolean, default: false },
		label: { type: String, default: "" },
		labelPosition: { type: String, default: "right" },
		enabled: { type: Boolean, default: true },
	},
	setup(props) {
		const switchId = `switch-` + props.label;
		const isLeftPosition = computed(() =>
			props.labelPosition == "left" ? true : false,
		);
		return { switchId, isLeftPosition };
	},
};
</script>

<style scoped></style>
