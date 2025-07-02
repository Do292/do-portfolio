<template>
	<button
		:title="title"
		class="btn btn-default02 btn-simple"
		@click="$emit('onClick', type)"
	>
		<i :class="iconClass"></i>
	</button>
</template>

<script>
import { useButton } from "~/system/modeler/plugins/composables/modeler-uiControl";
export default {
	// 아이콘 버튼
	name: "ButtonSimple",
	props: {
		type: { type: String },
	},
	setup({ type }) {
		const { iconClass, title } = useButton(type);

		return { iconClass, title };
	},
};
</script>

<style scoped>
.btn.btn-simple {
	color: #c1c1c1 !important;
}
.btn.btn-simple:disabled {
	background: none !important;
}
</style>
