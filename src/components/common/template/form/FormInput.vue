<template>
	<div :key="currentRef" class="input-field-box">
		<Numericbox
			v-if="isInputNumber"
			:enabled="!isDisabled"
			:floatLabelType="floatLabelType"
			:max="maxValue"
			:min="minValue"
			:modelValue="modelValue"
			:placeholder="placeholder"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
		<ComboQuery
			v-else-if="isInputCombo"
			:id="field"
			:defaultValue="defaultValue"
			:dependency="dependency"
			:enabled="!isDisabled"
			:expression="expression"
			:floatLabelType="floatLabelType"
			:inputMethod="inputMethod"
			:modelValue="modelValue"
			:placeholder="placeholder"
			@update:modelValue="$emit('update:modelValue', $event)"
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
			:value="modelValue"
			@reset="updateValueBySearch([])"
			@search="updateValueBySearch"
			@update="$emit('update:modelValue', $event)"
		/>
		<DatePicker
			v-else-if="isInputDate"
			:enabled="!isDisabled"
			:floatLabelType="floatLabelType"
			:hasTime="hasTime"
			:modelValue="modelValue"
			:placeholder="placeholder"
			:readonly="isDisabled"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
		<Textbox
			v-else
			:enabled="!isDisabled"
			:field="field"
			:floatLabelType="floatLabelType"
			:maxlength="maxValue"
			:minlength="minValue"
			:modelValue="modelValue"
			:multiline="hasMultiLine"
			:placeholder="placeholder"
			@update:modelValue="$emit('update:modelValue', $event)"
		/>
	</div>
</template>

<script>
import { ref, toRef, computed, watch } from "vue";
import { useItem } from "~/plugins/composables/dataHandler";
import { useFieldColumn } from "~/plugins/composables/tableHandler";

import { DATA_TYPE } from "~/constants/common_constants.js";
import { INPUT_METHOD } from "~/plugins/wfb-constants.js";

export default {
	name: "FormInput",
	props: {
		fieldConfig: { type: Object },
		target: { type: Object },
		dependentTableId: { type: String, default: "" },
		modelValue: { type: [String, Number], default: "" },

		isDisabled: { type: Boolean, default: false },
		floatLabelType: { type: String, default: "Always" },
		hasLabel: { type: Boolean, default: true },
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		//==================== Field Config
		const { ID, checkColumnNumber, createDependency } = useFieldColumn();

		// 변경 감지를 위해 ref로 선언
		const currentRef = ref(0);
		const { field, headerText } = props.fieldConfig;
		const inputMethod = props.fieldConfig[ID.INPUT_METHOD];
		const expression = props.fieldConfig[ID.INPUT_QUERY];
		const dataType = props.fieldConfig[ID.DATA_TYPE];
		const defaultValue = props.fieldConfig[ID.DEFAULT_VALUE];

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
		const isInputDate = inputMethod?.includes(INPUT_METHOD.DATE);
		const hasTime = inputMethod === INPUT_METHOD.DATE_TIME;

		// dataType이 숫자 형식이면 number input
		const isInputNumber = checkColumnNumber(props.fieldConfig);

		// input multi
		const hasMultiLine = dataType === DATA_TYPE.LOB;

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
			hasMultiLine,
			defaultValue,

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
