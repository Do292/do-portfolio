<template>
	<div>
		<wfl-combobox
			:id="id"
			ref="comboRef"
			:allowCustom="isWritable"
			:allowFiltering="allowFiltering"
			:dataSource="items"
			:defaultValue="modelValue"
			:enabled="enabled"
			:floatLabelType="floatLabelType"
			:headerTemplate="'hTemplate'"
			:isWrite="isWritable"
			:itemTemplate="'iTemplate'"
			:noRecordsTemplate="noRecordsTemplate"
			:placeholder="placeholder"
			:selectValue="modelValue"
			:showClearButton="isShowClearButton"
			@update:selectValue="$emit('update:modelValue', $event)"
		>
			<template #hTemplate>
				<div v-show="isMultiColumns">
					<thead>
						<tr>
							<th
								v-for="col in dropdownColumns"
								:key="id + '_header_' + col"
							>
								{{ col }}
							</th>
						</tr>
					</thead>
				</div>
			</template>
			<template v-if="isMultiColumns" #iTemplate="{ rowData }">
				<tr class="row">
					<td
						v-for="col in dropdownColumns"
						:key="id + '_item_' + col"
						class="col"
					>
						{{ rowData[col] }}
					</td>
				</tr>
			</template>
			<template v-else #iTemplate="{ rowData }">
				<tr class="row">
					<td>{{ rowData.text }}</td>
				</tr>
			</template>
		</wfl-combobox>
	</div>
</template>

<script>
import { ref, computed, onBeforeMount, onMounted, watch } from "vue";
import { useFieldColumn } from "~/plugins/composables/tableHandler";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import * as SYSTEM_COMMON from "~/api/system-common.js";

export default {
	name: "ComboQuery",
	props: {
		id: { type: String, required: false },
		modelValue: { type: [String, Number], required: false },
		allowFiltering: { type: Boolean, default: false },
		enabled: { type: Boolean, default: true },
		placeholder: { type: String, default: " " },
		floatLabelType: { type: String },
		noRecordsTemplate: { type: String, default: "No records found" },

		isUseheaderTemplate: { type: Boolean, default: false },
		isUseItemTemplate: { type: Boolean, default: false },
		isDisabled: { type: Boolean, default: false },
		isShowClearButton: { type: Boolean, required: false, default: true },

		defaultValue: { type: String, default: "" },
		dependency: { type: Object },
		expression: { type: String },
		inputMethod: { type: String },
		showClearButton: { type: Boolean, default: true },
	},
	data() {
		return {};
	},
	setup(props) {
		//==================== Expression
		const items = ref([]);
		const comboRef = ref(null);

		const dropdownColumns = ref([]);

		const { parseExpression } = useFieldColumn();
		const { openModalError } = useModalAlert();
		const { inputMethod, expression, dependency } = props;

		const isMultiColumns = computed(() => dropdownColumns.value.length > 1);

		const isWritable = computed(() => props.inputMethod.includes("Edit"));

		/**
		 * InputMethod  <br>
		 * ChooseOnlyC, ChooseEditC : expression 값을 | 로 구분해서 사용 <br>
		 * ChooseOnlyD, ChooseEditD : dependentId 값을 , 로 구분해서 사용
		 */
		async function fetchItems(condition = {}) {
			try {
				if (inputMethod.at(-1) === "C") {
					items.value = parseExpression(expression).map(item => {
						var trimItem = item?.trim();
						return { text: trimItem, value: trimItem };
					});
				} else {
					if (
						Object.keys(condition).length == 0
						// && Object.keys(dependency).length == 0
					) {
						Object.keys(dependency).forEach(dep => {
							condition[dep] = dependency[dep];
						});
					}

					const { data } = expression
						? await SYSTEM_COMMON.getByInputQuery(
								expression,
								condition,
						  )
						: [];

					dropdownColumns.value = Object.keys(
						Object.assign({}, ...data.data),
					);

					// 현재 Combo에 매핑된 field 값으로 text, value 매핑
					if (
						dropdownColumns.value.length == 2 &&
						dropdownColumns.value[0].toUpperCase() === "TEXT" &&
						dropdownColumns.value[1].toUpperCase() === "VALUE"
					) {
						items.value = data.data.map(item => {
							return {
								text: item[dropdownColumns.value[0]],
								value: item[dropdownColumns.value[1]],
								...item,
							};
						});
					} else {
						var dataKey = props.id.toUpperCase();
						items.value = data.data.map(item => {
							return {
								text: item[dataKey],
								value: item[dataKey],
								...item,
							};
						});
					}
				}
			} catch (error) {
				console.log(error);
				openModalError(error);
			}
		}

		onBeforeMount(async () => {
			await fetchItems();
		});

		onMounted(async () => {
			// 기본 값 셋팅
			comboRef.value.$el.value = props.defaultValue;
		});

		// reset된 경우 combo box 초기화되지 않는 오류 개선
		watch(
			() => comboRef.value?.selectValue,
			value => {
				if (value !== comboRef.value.$el.value) {
					comboRef.value.$el.value = value;
				}
			},
		);

		return {
			// Combo
			comboRef,

			// Expression
			fetchItems,
			items,
			dropdownColumns,
			isMultiColumns,
			isWritable,
		};
	},
};
</script>

<style scoped></style>
