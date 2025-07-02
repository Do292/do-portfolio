<template>
	<wfl-combobox
		ref="comboRef"
		:allowCustom="isWritable"
		:dataSource="items"
		:floatLabelType="floatLabelType"
		:isWrite="isWritable"
		:selectValue="modelValue"
		:showClearButton="showClearButton"
		@click="openCombo"
		@update:selectValue="$emit('update:modelValue', $event)"
	></wfl-combobox>
</template>

<script>
import { ref } from "vue";
export default {
	name: "ComboBasic",
	props: {
		modelValue: { type: String },
		items: {
			type: Array,
			default() {
				return [];
			},
		},

		// Label
		floatLabelType: { type: String, default: "Always" },

		isWritable: { type: Boolean, default: false },
		showClearButton: { type: Boolean, default: false },
	},
	setup() {
		//==================== Combo
		const comboRef = ref(null);

		/**
		 * 클릭 시 콤보 박스 열기
		 */
		function openCombo() {
			comboRef.value.showPopup();
		}

		return { comboRef, openCombo };
	},
};
</script>
