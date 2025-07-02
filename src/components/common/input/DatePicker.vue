<template>
	<wfl-datetimepicker
		v-if="hasTime"
		:floatLabelType="floatLabelType"
		:showClearButton="showClearButton"
		:type="timeType.toLowerCase()"
		:value="modelValue"
		:width="width"
		@update:dateTimeValue="$emit('update:modelValue', $event)"
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
	name: "DatePicker",
	props: {
		// Config
		modelValue: { type: [String, Date] },
		hasTime: { type: Boolean, default: false },
		timeType: { type: String, default: "time" },

		// Style
		floatLabelType: { type: String, default: "Always" },
		showClearButton: { type: Boolean, default: true },
		width: { type: String, default: "100%" },
	},
	setup(props, { emit }) {
		/**
		 * ISO format으로 변환 후 이벤트 전송
		 * @param {String} value
		 */
		function updateDateTimeWithISO(value) {
			const isoString = value ? new Date(value).toISOString() : value;
			emit("update:modelValue", isoString);
		}

		return { updateDateTimeWithISO };
	},
};
</script>
<style></style>
