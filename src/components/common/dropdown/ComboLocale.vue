<template>
	<wfl-dropdownlist
		:dataSource="items"
		:defaultValue="language"
		@update:defaultValue="$emit('update:modelValue', $event)"
	></wfl-dropdownlist>
</template>

<script>
import { computed } from "vue";
import { useLanguage } from "~/plugins/composables/locale";

export default {
	name: "ComboLocale",
	props: {
		modelValue: { type: String },
	},
	emits: ["update:modelValue"],
	setup(props) {
		const { languageValueConfig } = useLanguage();
		// language 초기화
		const language = computed(() => props.modelValue);
		const items = computed(() =>
			Object.entries(languageValueConfig.value).map(([value, text]) => ({
				value,
				text,
			})),
		);

		return { language, items };
	},
};
</script>
