<template>
	<wfl-numericbox
		:id="id"
		ref="numericRef"
		:numericValue="numericValue"
		:showClearButton="showClearButton"
		:value="numericValue"
		format="###.###"
		@keyup.enter="enterValue"
		@update:value="$emit('update:modelValue', $event)"
	></wfl-numericbox>
</template>

<script>
import { ref, computed } from "vue";

export default {
	name: "Numericbox",
	props: {
		id: { type: [Number, String] },
		modelValue: { type: [Number, String] },
		showClearButton: { type: Boolean, default: false },
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const numericRef = ref(null);
		// null, undefined, ""와 0의 경우 분리
		const numericValue = computed(() =>
			![null, undefined, ""].includes(props.modelValue)
				? +props.modelValue
				: null,
		);

		/**
		 * 엔터 키 누르면 포커스 아웃하며 데이터 업데이트
		 */
		function enterValue() {
			numericRef.value.focusOut();
			emit("afterEnter");
		}

		return { numericRef, numericValue, enterValue };
	},
};
</script>
<style></style>
