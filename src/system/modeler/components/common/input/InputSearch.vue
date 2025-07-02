<template>
	<div ref="currentRef" class="search-field">
		<Textbox
			:enabled="!isDisabled"
			:floatLabelType="floatLabelType"
			:modelValue="value"
			:placeholder="placeholder"
			@update:modelValue="$emit('update', $event)"
		/>
		<ButtonSimple
			:disabled="isDisabled"
			type="search"
			@onClick="openModalSearch(config)"
		/>
	</div>
</template>

<script>
import ButtonSimple from "~/system/modeler/components/common/button/ButtonSimple";

import { ref, reactive, readonly, watch, onMounted, computed } from "vue";
import { useFieldColumn } from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { useModalSearch } from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "InputSearch",
	components: { ButtonSimple },
	props: {
		value: { type: String },
		isDisabled: { type: Boolean, default: false },

		// Config
		field: { type: String },
		title: { type: String },
		inputMethod: { type: String },

		// Label
		placeholder: { type: String },
		floatLabelType: { type: String },

		// Expression
		dependency: { type: Object },
		expression: { type: String },

		// Custom
		customItems: { type: Array },
	},
	emits: ["update"],
	setup(props, { emit }) {
		//==================== Common
		const SEARCH_METHOD = readonly({
			SINGLE: "SearchItem",
			MULTIPLE: "SearchItems",
		});

		//==================== Expression
		const expressionItems = ref([]);
		const { getExpressionResultByQuery } = useFieldColumn();

		async function fetchExpressionItems() {
			expressionItems.value = await getExpressionResultByQuery(
				props.expression,
				props.dependency,
			);
		}

		onMounted(() => {
			if (!props.customItems) {
				fetchExpressionItems();
			}
		});

		//==================== ModalSearch
		const currentRef = ref(null);
		const { targetItems, openModalSearch } = useModalSearch(currentRef);

		// Search Config
		const items = computed(() =>
			props.customItems ? props.customItems : expressionItems.value,
		);
		const isMultiple = props.inputMethod === SEARCH_METHOD.MULTIPLE;
		const config = reactive({ ...props, items, isMultiple });

		watch(
			() => targetItems.value,
			items => {
				emit("search", items);
			},
		);

		return {
			// Expression
			items,

			// Modal
			currentRef,
			openModalSearch,
			config,
		};
	},
};
</script>

<style scoped>
/* Input */
.search-field {
	position: relative;
}
.search-field :deep(.e-input-group) {
	width: 100% !important;
	padding-left: 9px;
}
.search-field :deep(.e-input-group input) {
	min-height: 10px;
}
.search-field :deep(.e-input-group.e-disabled input) {
	background-color: transparent !important;
}

/* Button */
.btn-simple:hover :deep(i) {
	color: #474747 !important;
}
</style>
