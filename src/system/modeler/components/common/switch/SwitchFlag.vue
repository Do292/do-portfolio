<template>
	<SwitchTemplate
		:enabled="enabled"
		:modelValue="checked"
		@update:modelValue="changeFlag"
	/>
</template>

<script>
import SwitchTemplate from "~/system/modeler/components/common/template/SwitchTemplate";

import { computed } from "vue";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { FLAG } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "SwitchFlag",
	components: {
		SwitchTemplate,
	},
	props: {
		config: { type: Object },
		target: { type: String },
		enabled: { type: Boolean, default: true },
	},
	setup(props, { emit }) {
		// Target이 없는 경우 column의 field로 대체(GridForm 사용)
		const key = computed(() => props.target ?? props.config.column.field);
		const checked = computed(() => props.config[key.value] === FLAG.Y);

		const { deepCloneItems } = useItem();

		/**
		 * @param {Boolean} flag
		 */
		function changeFlag(flag) {
			const [item] = deepCloneItems([props.config]);
			item[key.value] = flag ? FLAG.Y : FLAG.N;
			emit("onChange", item);
		}

		return { checked, changeFlag };
	},
};
</script>

<style scoped>
.switch-box :deep(.e-switch-handle::after) {
	content: "N";
	position: absolute;
	width: 100%;
	height: 100%;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	line-height: 13px;
	font-size: 8px !important;
	font-family: "Roboto" !important;
	text-indent: 0 !important;
	font-weight: 700;
	color: #58585890 !important;
}
.switch-box :deep(.e-switch-handle.e-switch-active::after) {
	content: "Y";
	color: rgb(38, 206, 49) !important;
}
.switch-box :deep(.e-switch-disabled .e-switch-handle::after) {
	opacity: 1 !important;
}
</style>
