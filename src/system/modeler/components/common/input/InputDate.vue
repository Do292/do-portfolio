<template>
	<wfl-datetimepicker
		v-if="hasTime"
		:floatLabelType="floatLabelType"
		:max="max"
		:min="min"
		:showClearButton="showClearButton"
		:value="modelValue"
		:width="width"
		@update:dateTimeValue="updateDateTime"
	></wfl-datetimepicker>
	<wfl-datepicker
		v-else
		:floatLabelType="floatLabelType"
		:showClearButton="showClearButton"
		:value="modelValue"
		@update:dateValue="$emit('update:modelValue', $event)"
	></wfl-datepicker>
</template>

<script>
export default {
	name: "InputDate",
	props: {
		// Config
		modelValue: { type: [String, Date] },
		hasTime: { type: Boolean, default: false },
		max: { type: String },
		min: { type: String },

		// Style
		floatLabelType: { type: String, default: "Never" },
		showClearButton: { type: Boolean, default: true },
		width: { type: String, default: "100%" },
	},
	setup(_, { emit }) {
		/**
		 * Server format으로 변환 후 이벤트 전송
		 * @param {String} value
		 */
		function updateDateTime(value) {
			const dateValue = value.replace(" ", "T");
			emit("update:modelValue", dateValue);
		}

		return { updateDateTime };
	},
};
</script>
