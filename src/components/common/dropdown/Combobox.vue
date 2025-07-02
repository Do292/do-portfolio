<template>
	<wfl-combobox
		:id="id"
		:ref="id"
		:allowFiltering="allowFiltering"
		:dataSource="itemsSource"
		:enabled="!isDisabled"
		:fields="comboFields"
		:headerTemplate="isUseheaderTemplate ? 'hTemplate' : null"
		:itemTemplate="isUseItemTemplate ? 'iTemplate' : null"
		:placeholder="placeholder"
		:selectValue="modelValue"
		:showClearButton="isShowClearButton"
		@update:selectValue="$emit('update:modelValue', $event)"
	>
		<template #hTemplate>
			<slot name="hTemplate"></slot>
		</template>
		<template #iTemplate="{ rowData }">
			<slot :rowData="rowData" name="iTemplate"></slot>
		</template>
	</wfl-combobox>
</template>

<script>
export default {
	name: "Combobox",
	props: {
		id: { type: String, required: false },
		itemsSource: { type: Array, required: false },
		modelValue: { type: [String, Number], required: false },
		comboFields: { type: Object },
		allowFiltering: { type: Boolean, default: true },
		placeholder: { type: String, default: " " },

		isUseheaderTemplate: { type: Boolean, default: false },
		isUseItemTemplate: { type: Boolean, default: false },
		isShowClearButton: { type: Boolean, required: false, default: true },
		isDisabled: { type: Boolean, default: false },
	},
	data() {
		return {};
	},
	methods: {},
};
</script>

<style scoped></style>
