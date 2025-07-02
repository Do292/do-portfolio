<template>
	<div>
		<wfl-multiselectdropdown
			:id="id"
			:ref="id"
			:allowFiltering="allowFiltering"
			:dataSource="itemsSource"
			:defaultValue="modelValue"
			:enabled="!isDisabled"
			:fields="comboFields"
			:headerTemplate="isUseheaderTemplate ? 'hTemplate' : null"
			:itemTemplate="isUseItemTemplate ? 'iTemplate' : null"
			:mode="multiMode"
			:name="id"
			:noRecordsTemplate="noRecordsTemplate"
			:placeholder="placeholder"
			:showClearButton="isShowClearButton"
			:showDropDownIcon="true"
			@update:defaultValue="$emit('update:modelValue', $event)"
		>
			<template #hTemplate>
				<slot name="hTemplate"></slot>
			</template>
			<template #iTemplate="{ rowData }">
				<slot :rowData="rowData" name="iTemplate"></slot>
			</template>
		</wfl-multiselectdropdown>
	</div>
</template>

<script>
export default {
	name: "MultiDropDownList",
	props: {
		id: { type: String, required: false },
		itemsSource: { type: Array, required: false },
		modelValue: { type: [String, Number], required: false },
		comboFields: { type: Object },
		allowFiltering: { type: Boolean, default: true },
		placeholder: { type: String, default: " " },
		noRecordsTemplate: { type: String, default: "No records found" },

		isDisabled: { type: Boolean, default: false },
		isShowClearButton: { type: Boolean, required: false, default: true },
		isUseheaderTemplate: { type: Boolean, default: false },
		isUseItemTemplate: { type: Boolean, default: false },
	},
	data() {
		return {
			multiMode: "CheckBox",
		};
	},
	computed: {},
	methods: {},
};
</script>

<style scoped></style>
