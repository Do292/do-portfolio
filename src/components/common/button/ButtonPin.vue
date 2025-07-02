<template>
	<button
		:class="{ fixed: modelValue }"
		class="btn btn-sm btn-pin mb-2"
		@click="togglePin"
	>
		<i class="aim aimcons_pin"></i>
	</button>
</template>

<script>
export default {
	name: "ButtonPin",
	props: {
		modelValue: { type: Boolean, default: false },
	},
	setup(props, { emit }) {
		/**
		 * Pin Toggle
		 */
		function togglePin() {
			emit("update:modelValue", !props.modelValue);
		}

		return { togglePin };
	},
};
</script>

<style scoped></style>
