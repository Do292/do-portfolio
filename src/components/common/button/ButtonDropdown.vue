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
import { useButton } from "~/plugins/composables/uiControl";

export default {
	name: "ButtonDropdown",
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
				typeof item === "string" ? item : item.action,
				props.needsAuthority,
			);

			if (typeof item === "string") {
				return {
					id: item,
					text: t(title),
					isVisible: isVisible.value,
					disabled: isDisabled.value,
					iconCss: iconClass,
				};
			} else if (typeof item === "object") {
				return {
					...item,
					text: t(title),
					isVisible: isVisible.value,
					disabled: isDisabled.value,
					iconCss: iconClass,
				};
			}
		}

		return { comboItems };
	},
};
</script>

<style scoped></style>
