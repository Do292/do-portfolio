<template>
	<div class="input-group user">
		<span>
			<i class="aim aimcons_user-outline"></i>
		</span>
		<input
			ref="inputRef"
			:placeholder="placeholderText"
			:readonly="isReadOnly"
			:value="modelValue"
			type="text"
			@input="$emit('update:modelValue', $event.target.value)"
			@keyup.enter="$emit('onEnter')"
		/>
	</div>
</template>

<script>
import { useInput } from "~/plugins/composables/uiControl";

export default {
	name: "InputUserId",
	props: {
		modelValue: { type: String },
		isReadOnly: { type: Boolean, default: true },
		placeholderText: { type: String, default: " " },
	},
	setup() {
		const { inputRef, focus, blur } = useInput();
		return { inputRef, focus, blur };
	},
};
</script>

<style scoped></style>
