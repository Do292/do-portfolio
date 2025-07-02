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
import { useButton } from "~/system/modeler/plugins/composables/modeler-uiControl";

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
			const style = ["ok", "apply", "set"].includes(this.type)
				? "apply"
				: "close";
			return `btn btn-md p-2 btn-${style}`;
		},
		label() {
			return this.$t(`button.${this.type}`);
		},
	},
};
</script>

<style scoped>
button.button-footer {
	padding: 0.3rem !important;
}
</style>
