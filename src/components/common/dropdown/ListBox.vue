<template>
	<div>
		<wfl-listbox
			:id="id"
			ref="comboRef"
			:allowFiltering="allowFiltering"
			:class="dynamicHeightClass"
			:dataSource="items"
			:headerTemplate="hTemplate"
			:itemTemplate="iTemplate"
			:noRecordsTemplate="noRecordsTemplate"
			:selectValue="modelValue"
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
			<template #iTemplate="{ rowData }">
				<div v-show="isMultiColumns">
					<tr class="row">
						<td
							v-for="col in dropdownColumns"
							:key="id + '_item_' + col"
							class="col"
						>
							{{ rowData[col] }}
						</td>
					</tr>
				</div>
			</template>
		</wfl-listbox>
	</div>
</template>

<script>
import { getCurrentInstance, ref, computed, onBeforeMount, watch } from "vue";
import { useFieldColumn } from "~/plugins/composables/tableHandler";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import * as SYSTEM_COMMON from "~/api/system-common.js";

export default {
	name: "ListBox",
	props: {
		id: { type: String, required: false },
		modelValue: { type: [String, Number], required: false },
		allowFiltering: { type: Boolean, default: false },
		noRecordsTemplate: { type: String, default: "No records found" },

		isUseheaderTemplate: { type: Boolean, default: false },
		isUseItemTemplate: { type: Boolean, default: false },

		dependency: { type: String },
		expression: { type: String },
		inputMethod: { type: String },
	},
	data() {
		return {};
	},
	setup(props) {
		//==================== Combo
		const { proxy } = getCurrentInstance();
		const comboRef = ref(null);

		// reset된 경우 combo box 초기화되지 않는 오류 개선
		watch(
			() => comboRef.value?.props?.selectValue,
			value => {
				if (value !== comboRef.value.$el.value) {
					comboRef.value.$el.value = value;
				}
			},
		);

		//==================== Expression
		const isFetched = ref(false);
		const items = ref([]);

		const dropdownColumns = ref([]);

		const { parseExpression } = useFieldColumn();
		const { openModalError } = useModalAlert();
		const {
			inputMethod,
			expression,
			dependency,
			isUseheaderTemplate,
			isUseItemTemplate,
		} = props;

		const isMultiColumns = computed(() =>
			dropdownColumns.value.length < 1 ? false : true,
		);
		const hTemplate = computed(() =>
			isMultiColumns.value ? "hTemplate" : null,
		);
		const iTemplate = computed(() =>
			isMultiColumns.value ? "iTemplate" : null,
		);

		const dynamicHeightClass = computed(() =>
			items.value.length == 0 ? "" : "large",
		);

		/**
		 * InputMethod  <br>
		 * ChooseOnlyC, ChooseEditC : expression 값을 | 로 구분해서 사용 <br>
		 * ChooseOnlyD, ChooseEditD : dependentId 값을 , 로 구분해서 사용
		 */
		async function fetchItems(condition = {}) {
			try {
				if (inputMethod.at(-1) === "C") {
					//ChooseOnlyC일 경우 구분자로 expression 분할
					items.value = parseExpression(expression).map(item => {
						var trimItem = item?.trim();
						return { text: trimItem, value: trimItem };
					});
				} else {
					//ChooseOnlyD일 경우
					if (
						Object.keys(condition).length == 0 &&
						!proxy.$isEmpty(dependency)
					) {
						parseExpression(dependency).map(dep => {
							condition[dep] = "";
						});
					}

					const { data } = expression
						? await SYSTEM_COMMON.getByInputQuery(
								expression,
								condition,
						  )
						: [];

					const dropdownCols = [
						...new Set(
							data.data
								.flatMap(Object.keys)
								.map(key => key.toLowerCase()), // key 소문자로 변경
						),
					];

					var result = [];
					if (
						dropdownCols.length > 1 ||
						isUseheaderTemplate ||
						isUseItemTemplate
					) {
						result =
							data.data.map(item => {
								return { text: item.TEXT, value: item.VALUE };
							}) ?? [];
					} else {
						// 컬럼이 1개일 경우에는 header 불필요, 데이터에도 text, value 동일하게 들어가도록
						if (dropdownCols.length == 1) {
							const key = dropdownCols[0].toUpperCase();
							result = data.data.map(item => {
								return { text: item[key], value: item[key] };
							});
						}
					}

					dropdownColumns.value = dropdownCols;
					items.value = result;
					isFetched.value = true;
				}
			} catch (error) {
				console.log(error);
				openModalError(error);
			}
		}

		async function setDependencyItems(params) {
			await fetchItems(params);
		}

		onBeforeMount(async () => {
			await fetchItems();
			isFetched.value = true;
		});

		return {
			// Combo
			comboRef,

			// Expression
			fetchItems,
			setDependencyItems,
			isFetched,
			items,
			dropdownColumns,
			isMultiColumns,
			hTemplate,
			iTemplate,
			dynamicHeightClass,
		};
	},
};
</script>

<style scoped></style>
