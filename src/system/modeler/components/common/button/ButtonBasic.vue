<template>
	<button
		v-if="isVisible"
		:disabled="isDisabled"
		class="btn btn-md btn-default"
		@click="$emit('onClick', type)"
	>
		<i :class="iconClass"></i>
		<slot></slot>
	</button>
</template>

<script>
import { useButton } from "~/system/modeler/plugins/composables/modeler-uiControl";

export default {
	// CRUD용 박스 버튼
	name: "ButtonBasic",
	props: {
		type: { type: String },
		needsAuthority: { type: Boolean, default: false },
	},
	setup(props) {
		const { type, needsAuthority } = props;
		const { iconClass, isVisible, isDisabled } = useButton(
			type,
			needsAuthority,
		);

		return { iconClass, isVisible, isDisabled };
	},
};
</script>

<style scoped></style>
