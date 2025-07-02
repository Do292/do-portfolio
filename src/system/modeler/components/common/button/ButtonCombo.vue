<template>
	<wfl-dropdownbutton
		:content="$t(title)"
		:items="comboItems"
		class="btn btn-md btn-default"
		@select="$emit('onSelect', $event)"
	></wfl-dropdownbutton>
</template>

<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useButton } from "~/system/modeler/plugins/composables/modeler-uiControl";

export default {
	name: "ButtonCombo",
	props: {
		items: { type: Array },
		needsAuthority: { type: Boolean, default: false },
		title: { type: String, default: "button.action" },
	},
	setup(props) {
		const { t } = useI18n();

		const comboItems = computed(() =>
			props.items
				.map(item => defineItemConfig(item))
				.filter(item => item.isVisible),
		);

		function defineItemConfig(item) {
			const { title, isVisible, isDisabled, iconClass } = useButton(
				item,
				props.needsAuthority,
			);
			return {
				id: item,
				text: t(title),
				isVisible: isVisible.value,
				disabled: isDisabled.value,
				iconCss: iconClass,
			};
		}

		return { comboItems };
	},
};
</script>

<style scoped>
:deep(.e-icons.e-caret) {
	color: #4d4d4d !important;
	line-height: 20px !important;
}
.e-btn {
	line-height: inherit !important;
}
</style>
