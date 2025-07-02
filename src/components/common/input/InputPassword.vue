<template>
	<div :class="passwordClass" class="input-group password">
		<span>
			<i class="aim aimcons_lock-outline"></i>
		</span>
		<input
			ref="inputRef"
			:placeholder="placeholderText"
			:readonly="isReadOnly"
			:type="inputType"
			:value="modelValue"
			@input="$emit('update:modelValue', $event.target.value)"
			@keypress.enter="$emit('onEnter')"
		/>
	</div>
</template>

<script>
import { ref, computed } from "vue";
import { useInput } from "~/plugins/composables/uiControl";
import { ACTION } from "~/plugins/wfb-constants.js";

export default {
	name: "InputPassword",
	components: {},
	props: {
		modelValue: { type: String },
		placeholderText: { type: String, default: " " },
		isReadOnly: { type: Boolean, default: false },
		isValid: { type: Boolean, default: true },
		canToggle: { type: Boolean, default: true },
	},
	setup(props) {
		//==================== Input
		const { inputRef, focus, blur } = useInput();
		const passwordClass = computed(() =>
			props.isValid ? "valid" : "invalid",
		);

		//==================== Button
		const shouldHide = ref(true);
		const inputType = computed(() =>
			!props.canToggle || shouldHide.value ? "password" : "text",
		);
		const buttonType = computed(() =>
			shouldHide.value ? ACTION.SHOW : ACTION.HIDE,
		);

		function togglePassword() {
			shouldHide.value = !shouldHide.value;
			focus();

			// 포커싱 후 커서 마지막 글자로 이동
			setTimeout(() => {
				// const { length } = inputRef.value.value;
				// inputRef.value.selectionStart = length;
				// inputRef.value.selectionEnd = length;
			}, 5);
		}

		return {
			inputRef,
			focus,
			blur,
			passwordClass,

			// Button
			shouldHide,
			inputType,
			buttonType,
			togglePassword,
		};
	},
};
</script>

<style scoped></style>
