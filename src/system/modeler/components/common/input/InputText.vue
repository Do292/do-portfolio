<template>
	<wfl-textbox
		ref="inputRef"
		:enteredValue="modelValue"
		:multiline="resizing"
		:showClearButton="showClearButton"
		:type="inputType"
		autocomplete="off"
		@input="updateAndResizeInput"
	></wfl-textbox>
</template>

<script>
import { ref, computed, watch, nextTick } from "vue";
import { ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "InputText",
	props: {
		showClearButton: { type: Boolean, default: true },
		modelValue: { type: String, default: "" },
		resizing: { type: Boolean, default: false },
		field: { type: String },
	},
	setup(props, { emit }) {
		//==================== Input
		const inputRef = ref(null);
		const inputType = computed(() =>
			props.field === ID.PASSWORD ? "password" : "text",
		);

		// value 크기에 따라 Input height 조정
		watch(
			() => props.modelValue,
			() => {
				if (props.resizing) {
					nextTick(resizeInput);
				}
			},
		);

		/**
		 * resizing 확인하여 height 업데이트하고 이벤트 전송
		 */
		function updateAndResizeInput({ value }) {
			if (props.resizing) {
				resizeInput();
			}
			emit("update:modelValue", value);
		}

		/**
		 * Input 크기를 조정한다.
		 */
		function resizeInput() {
			// Textarea 요소 찾기
			const $textarea = inputRef.value.$el.nextElementSibling;
			const $container = $textarea.parentNode;

			$textarea.style.height = "20px";

			const { scrollHeight } = $textarea;
			$textarea.style.height = `${scrollHeight}px`;
			$container.style.height = `${Math.max(30, scrollHeight + 2)}px`;
		}

		return { inputRef, inputType, updateAndResizeInput, resizeInput };
	},
};
</script>
