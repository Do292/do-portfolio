<template>
	<div class="btn-collapse-box">
		<button class="btn btn-collapse" @click="toggleCollapse">
			<i v-if="modelValue" class="aim aimcons_arrow_right"></i>
			<i v-else class="aim aimcons_arrow_left"></i>
		</button>
	</div>
</template>

<script>
export default {
	name: "ButtonCollapse",
	props: {
		modelValue: { type: Boolean, default: false },
	},
	setup(props, { emit }) {
		/**
		 * Collapse Toggle
		 */
		function toggleCollapse() {
			emit("update:modelValue", !props.modelValue);
		}

		return { toggleCollapse };
	},
};
</script>

<style scoped></style>
