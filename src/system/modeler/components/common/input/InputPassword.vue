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
		<ButtonSimple
			v-if="canToggle"
			:key="buttonType"
			:type="buttonType"
			@onClick="togglePassword"
		/>
	</div>
</template>

<script>
import ButtonSimple from "~/system/modeler/components/common/button/ButtonSimple";

import { ref, computed } from "vue";
import { useInput } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { ACTION } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "InputPassword",
	components: { ButtonSimple },
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
				const { length } = inputRef.value.value;

				inputRef.value.selectionStart = length;
				inputRef.value.selectionEnd = length;
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

<style scoped>
/* Common */

.input-group input:read-only {
	background: #f8f8f8 !important;
}
.input-group span {
	position: absolute;
	z-index: 100;
	font-size: medium;
	transform: translate(10px, 5px);
	color: #858384cf;
}

/* Required Style */
.input-group.password.required input:placeholder-shown {
	background: #dc354511 !important;
}
.input-group.password.required input:placeholder-shown:focus {
	border-color: #dc3545 !important;
	outline: 1px solid #dc3545 !important;
}
.input-group.password.required input:focus {
	border-color: #28a745 !important;
	outline: 1px solid #28a745 !important;
}

/* Valid */
.input-group.password.invalid input {
	background: #fdf2f3 !important;
}
.input-group.password.invalid input:focus {
	border-color: #dc3545 !important;
	outline: 1px solid #dc3545 !important;
}
.input-group.password.valid input:focus {
	border-color: #28a745 !important;
	outline: 1px solid #28a745 !important;
}

/* Toggle Button */
.input-group.password button {
	position: absolute;
	top: 5px;
	right: 27px;
}
.input-group.password button :deep(i) {
	font-size: 18px;
	color: #21252949;
}
.input-group.password button:hover :deep(i) {
	color: #21252988;
}
</style>
