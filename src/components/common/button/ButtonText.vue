<template>
	<button
		v-if="isVisible"
		:class="buttonClass"
		:disabled="isDisabled || disabled"
		@click="$emit('onClick')"
	>
		<slot>{{ $t(title) }}</slot>
	</button>
</template>

<script>
import { computed } from "vue";
import { useButton } from "~/plugins/composables/uiControl";

export default {
	name: "ButtonText",
	props: {
		type: { type: String },
		showFirst: { type: Boolean },
		needsAuthority: { type: Boolean, default: false },

		// disabled force
		disabled: { type: Boolean, default: false },
	},
	setup({ type, needsAuthority }) {
		const { buttonRef, focus, title, isVisible, isDisabled } = useButton(
			type,
			needsAuthority,
		);
		const buttonClass = computed(() => {
			const style = ["ok", "apply", "set", "preview"].includes(type)
				? "apply"
				: "default";
			return `btn btn-md btn-${style}`;
		});

		return { buttonRef, isVisible, isDisabled, buttonClass, focus, title };
	},
};
</script>

<style scoped></style>
