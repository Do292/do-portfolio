<template>
	<wfl-combobox
		ref="comboRef"
		:allowCustom="isWritable"
		:dataSource="items"
		:isWrite="isWritable"
		:showClearButton="showClearButton"
		@click="openCombo"
	></wfl-combobox>
</template>

<script>
import { ref, computed, watch, onBeforeMount } from "vue";
import { useFieldColumn } from "~/system/modeler/plugins/composables/modeler-tableHandler";

export default {
	name: "ComboExpression",
	props: {
		dependency: { type: Object },
		expression: { type: String },
		inputMethod: { type: String },
		showClearButton: { type: Boolean, default: true },
	},
	emits: ["update"],
	setup(props) {
		//==================== Combo
		const comboRef = ref(null);

		// reset된 경우 combo box 초기화되지 않는 오류 개선
		watch(
			() => comboRef.value?.selectValue,
			value => {
				if (value !== comboRef.value.$el.value) {
					comboRef.value.$el.value = value;
				}
			},
		);

		/**
		 * 클릭 시 콤보 박스 열기
		 */
		function openCombo() {
			comboRef.value.showPopup();
		}

		//==================== Expression
		const isFetched = ref(false);
		const items = ref([]);
		const { parseExpression, getExpressionResultByQuery } =
			useFieldColumn();

		/**
		 * 콤보 타입인 경우에만 데이터 쿼리 결과 할당
		 */
		async function fetchItems() {
			if (props.inputMethod.at(-1) === "C") {
				//ChooseOnlyC, ChooseEditC 일 경우 구분자로 expression 분할
				items.value = parseExpression(props.expression);
			} else {
				const result = await getExpressionResultByQuery(
					props.expression,
					props.dependency,
				);

				/** @todo 형식 변경될 경우 확인 필요 */
				items.value = result
					.map(item => Object.values(item)[0]?.trim())
					.filter(item => item);
			}
		}

		const isWritable = computed(() => props.inputMethod.includes("Edit"));

		onBeforeMount(async () => {
			await fetchItems();
			isFetched.value = true;
		});

		return {
			// Combo
			comboRef,
			openCombo,

			// Expression
			isFetched,
			items,
			isWritable,
		};
	},
};
</script>
