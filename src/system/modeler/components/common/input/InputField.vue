<template>
	<div :key="currentRef" class="input-field-box">
		<InputNumber
			v-if="isInputNumber"
			:enabled="!isDisabled"
			:floatLabelType="floatLabelType"
			:max="maxValue"
			:min="minValue"
			:modelValue="modelValue"
			:placeholder="placeholder"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
		<ComboExpression
			v-else-if="isInputCombo"
			:dependency="dependency"
			:enabled="!isDisabled"
			:expression="expression"
			:floatLabelType="floatLabelType"
			:inputMethod="inputMethod"
			:placeholder="placeholder"
			:selectValue="modelValue"
			@update:selectValue="$emit('update:modelValue', $event)"
		/>
		<InputSearch
			v-else-if="isInputSearch"
			:dependency="dependency"
			:expression="expression"
			:field="field"
			:floatLabelType="floatLabelType"
			:inputMethod="inputMethod"
			:isDisabled="isDisabled"
			:placeholder="placeholder"
			:title="title"
			:value="modelValue"
			@search="updateValueBySearch"
			@update="$emit('update:modelValue', $event)"
		/>
		<InputQuery
			v-else-if="isInputQuery"
			:floatLabelType="floatLabelType"
			:isDisabled="isDisabled"
			:modelValue="modelValue"
			:placeholder="placeholder"
			:tableId="tableId"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
		<InputDate
			v-else-if="isInputDate"
			:enabled="!isDisabled"
			:floatLabelType="floatLabelType"
			:hasTime="hasTime"
			:modelValue="modelValue"
			:placeholder="placeholder"
			:readonly="isDisabled"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
		<InputText
			v-else
			:enabled="!isDisabled"
			:field="field"
			:floatLabelType="floatLabelType"
			:modelValue="modelValue"
			:placeholder="placeholder"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
	</div>
</template>

<script>
import ComboExpression from "~/system/modeler/components/common/combo/ComboExpression";
import InputNumber from "~/system/modeler/components/common/input/InputNumber";
import InputSearch from "~/system/modeler/components/common/input/InputSearch";
import InputText from "~/system/modeler/components/common/input/InputText";
import InputQuery from "~/system/modeler/components/common/input/InputQuery";
import InputDate from "~/system/modeler/components/common/input/InputDate";

import { readonly, ref, toRef, computed, watch } from "vue";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useFieldColumn } from "~/system/modeler/plugins/composables/modeler-tableHandler";

import { ID, DATA_TYPE } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "InputField",
	components: {
		ComboExpression,
		InputNumber,
		InputSearch,
		InputText,
		InputQuery,
		InputDate,
	},
	props: {
		fieldConfig: { type: Object },
		target: { type: Object },
		tableId: { type: String, default: "" },
		modelValue: { type: [String, Number], default: "" },

		isDisabled: { type: Boolean, default: false },
		floatLabelType: { type: String, default: "Auto" },
		hasLabel: { type: Boolean, default: true },
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		//==================== Field Config
		const { checkColumnNumber, createDependency } = useFieldColumn();
		const INPUT_METHOD = readonly({
			DIRECT: "Direct",
			CHOOSE: "Choose",
			SEARCH: "Search",
		});

		// 변경 감지를 위해 ref로 선언
		const currentRef = ref(0);
		const { field, headerText } = props.fieldConfig;
		const inputMethod = props.fieldConfig[ID.INPUT_METHOD];
		const expression = props.fieldConfig[ID.INPUT_QUERY];
		const dataType = props.fieldConfig[ID.DATA_TYPE];

		// inputMethod가 Choose를 포함하면 combo input
		const isInputCombo = inputMethod?.includes(INPUT_METHOD.CHOOSE);

		// Input Search
		const isInputSearch = inputMethod?.includes(INPUT_METHOD.SEARCH);

		/**
		 * @param {Object[]} items
		 */
		function updateValueBySearch(items) {
			const itemValues = items.map(
				item => item[field] ?? Object.values(item)[0],
			);
			emit("update:modelValue", itemValues.join());
		}

		// query input
		const isInputQuery = field === ID.INPUT_QUERY;

		// input Date
		const isInputDate = dataType?.includes(DATA_TYPE.DATE);
		const hasTime = dataType === DATA_TYPE.DATE_TIME;

		// dataType이 숫자 형식이면 number input
		const isInputNumber = checkColumnNumber(props.fieldConfig);

		const placeholder = props.hasLabel ? headerText : null;

		// 비활성 여부 변경 시, input 초기화
		watch(
			() => props.isDisabled,
			() => currentRef.value++,
		);

		// number 타입 비활성화인 경우, modelValue 변경 감지
		watch(
			() => props.modelValue,
			() => {
				if (props.isDisabled && isInputNumber) {
					currentRef.value++;
				}
			},
		);

		//==================== Dependency
		const { checkItemsEqual } = useItem();
		const targetRef = toRef(props, "target");

		const dependency = computed(() =>
			createDependency(
				props.fieldConfig[ID.DEPENDENT_COLUMN_ID],
				targetRef.value,
			),
		);

		// dependency 변경 시, 데이터 초기화
		watch(dependency, (newValue, oldValue) => {
			if (!checkItemsEqual(newValue, oldValue)) {
				emit("update:modelValue", "");
				currentRef.value++;
			}
		});

		//==================== Min & Max
		const maxValue = computed(() => {
			const value = props.fieldConfig[ID.MAX_VALUE];
			return value ? +value : Infinity;
		});
		const minValue = computed(() => {
			const value = props.fieldConfig[ID.MIN_VALUE];
			// 최대값 보다 작아야 함.
			return value ? Math.min(+value, maxValue.value) : -Infinity;
		});

		return {
			// Config
			currentRef,
			isInputNumber,
			isInputCombo,
			isInputQuery,

			// Input Search
			isInputSearch,
			updateValueBySearch,

			// Input Date
			isInputDate,
			hasTime,

			// Field
			placeholder,
			inputMethod,
			expression,

			// Dependency
			dependency,
			...props.fieldConfig,

			// Min & Max
			minValue,
			maxValue,
		};
	},
};
</script>

<style scoped>
:deep(.e-input-group:not(.e-disabled)) {
	background: white !important;
}
</style>
