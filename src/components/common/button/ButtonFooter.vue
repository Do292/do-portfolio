<template>
	<button
		:id="buttonId"
		ref="buttonRef"
		:class="buttonStyle"
		:disabled="isDisabled"
		class="btn btn-md btn-bottom-dark"
		@click="$emit('onClick')"
	>
		{{ label }}
	</button>
</template>

<script>
import { useButton } from "~/plugins/composables/uiControl";

export default {
	// 모달 하단 버튼
	name: "ButtonFooter",
	props: {
		type: { type: String },
		isDisabled: { type: Boolean, default: false },
	},
	emits: ["onClick"],
	setup({ type }) {
		const { buttonRef, focus } = useButton(type);

		return { buttonRef, focus };
	},
	computed: {
		buttonId() {
			return `button-${this.type}`;
		},
		buttonStyle() {
			const style = ["ok", "apply", "set", "submit"].includes(this.type)
				? "reg"
				: "dblue";
			return `btn btn-md p-2 btn-con-${style}`;
		},
		label() {
			return this.$t(`button.${this.type}`);
		},
	},
};
</script>

<style scoped></style>
