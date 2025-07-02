<template>
	<div class="col">
		<div class="search-box">
			<div class="search-items">
				<div class="search-box-top-btn-area">
					<ButtonBasic
						v-show="!checkGroupOne"
						:class="{ 'filter-expanded': isFilterExpanded }"
						type="filter"
						@onClick="isFilterExpanded = !isFilterExpanded"
					/>
					<ButtonBasic type="search" @onClick="clickSearch" />
				</div>

				<template v-if="checkGroupOne">
					<div class="d-table table-item">
						<div
							v-for="(groups, key) in groupedConditionList"
							:key="key"
							class="d-table-row"
						>
							<div
								v-for="item in groups[0]"
								:key="item + getDetailValue(item)"
								class="d-table-cell col-4"
							>
								<div class="d-table-cell">
									<span
										:class="{
											'mr-2 input-title-redonly':
												isFieldMandatory(item),
											'mr-2 input-title':
												!isFieldMandatory(item),
										}"
									>
										{{ $t(item.label) }}
									</span>
								</div>
								<div class="d-table-cell">
									<InputSearch
										v-if="isInputMethodSearch(item)"
										:id="getDetailValue(item)"
										:dependency="getDependency(item)"
										:value="
											searchCondition[
												getDetailValue(item)
											]
										"
										@reset="
											onResetInputSearch(
												getDetailValue(item),
											)
										"
										@search="
											openModalSearch(
												getDetailValue(item),
											)
										"
										@update:modelValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
									<div
										v-else-if="isInputMethodCheckDate(item)"
									>
										<slot name="customPeriod"></slot>

										<template
											v-if="isOperationTypeBetween(item)"
										>
											<div
												style="
													display: flex !important;
													margin-top: 10px !important;
												"
											>
												<DatePicker
													:id="
														getDetailValue(item) +
														DATE_FROM
													"
													v-model:modelValue="
														searchCondition[
															getDetailValue(
																item,
															) +
																JOIN_CHAR +
																DATE_FROM
														]
													"
													:hasTime="
														!(
															item.dataType ===
															DATA_TYPE.DATE
														)
													"
													:timeType="item.dataType"
												/>
												<DatePicker
													:id="
														getDetailValue(item) +
														DATE_TO
													"
													v-model:modelValue="
														searchCondition[
															getDetailValue(
																item,
															) +
																JOIN_CHAR +
																DATE_TO
														]
													"
													:hasTime="
														!(
															item.dataType ===
															DATA_TYPE.DATE
														)
													"
													:timeType="item.dataType"
												/>
											</div>
										</template>
										<template v-else>
											<div
												style="
													margin-top: 10px !important;
												"
											>
												<DatePicker
													:id="getDetailValue(item)"
													v-model:modelValue="
														searchCondition[
															getDetailValue(item)
														]
													"
													:hasTime="
														!(
															item.dataType ===
															DATA_TYPE.DATE
														)
													"
													:timeType="item.dataType"
												/>
											</div>
										</template>
									</div>
									<ComboQuery
										v-else-if="isInputMethodCombo(item)"
										:id="getDetailValue(item)"
										:ref="getDetailValue(item)"
										v-model:modelValue="
											searchCondition[
												getDetailValue(item)
											]
										"
										:defaultValue="item.defaultValue"
										:dependency="getDependency(item)"
										:expression="item.inputQuery"
										:inputMethod="item.inputMethod"
										style="max-height: 74px !important"
										@update:modelValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
									<Numericbox
										v-else-if="isInputMethodNumber(item)"
										:id="getDetailValue(item)"
										:ref="getDetailValue(item)"
										v-model:value="
											searchCondition[
												getDetailValue(item)
											]
										"
										:min="0"
										:showSpinButton="true"
										@update:modelValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
									<Textbox
										v-else
										:id="getDetailValue(item)"
										:ref="getDetailValue(item)"
										v-model="
											searchCondition[
												getDetailValue(item)
											]
										"
										:showClearButton="true"
										@update:enteredValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
								</div>
							</div>
						</div>
						<slot name="customSearchCondition"></slot>
					</div>
				</template>

				<div
					v-for="(groups, category, index) in groupedConditionList"
					v-show="isFilterExpanded"
					:key="index"
					class="w100 category-items"
				>
					<div v-if="!this.$isEmpty(category)">
						<label
							:class="{ 'collapsed-label': collapsed[index] }"
							class="category-label"
							@click="toggleCategory(index)"
						>
							{{ $t(category) }}
						</label>
					</div>
					<div
						v-if="!collapsed[index]"
						class="d-table table-item w100"
					>
						<div
							v-for="(group, key) in groups"
							:key="key"
							class="d-table-row"
						>
							<div
								v-for="item in group"
								:key="item + getDetailValue(item)"
								class="d-table-cell col-4"
							>
								<div class="d-table-cell">
									<span
										:class="{
											'mr-2 input-title-redonly':
												isFieldMandatory(item),
											'mr-2 input-title':
												!isFieldMandatory(item),
										}"
									>
										{{ $t(item.label) }}
									</span>
								</div>
								<div class="d-table-cell">
									<InputSearch
										v-if="isInputMethodSearch(item)"
										:id="getDetailValue(item)"
										:dependency="getDependency(item)"
										:value="
											searchCondition[
												getDetailValue(item)
											]
										"
										@reset="
											onResetInputSearch(
												getDetailValue(item),
											)
										"
										@search="
											openModalSearch(
												getDetailValue(item),
											)
										"
										@update:modelValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
									<div
										v-else-if="isInputMethodCheckDate(item)"
									>
										<slot name="customPeriod"></slot>

										<template
											v-if="isOperationTypeBetween(item)"
										>
											<div
												style="
													display: flex !important;
													margin-top: 10px !important;
												"
											>
												<DatePicker
													:id="
														getDetailValue(item) +
														DATE_FROM
													"
													v-model:modelValue="
														searchCondition[
															getDetailValue(
																item,
															) +
																JOIN_CHAR +
																DATE_FROM
														]
													"
													:hasTime="
														!(
															item.dataType ===
															DATA_TYPE.DATE
														)
													"
													:timeType="item.dataType"
												/>
												<DatePicker
													:id="
														getDetailValue(item) +
														DATE_TO
													"
													v-model:modelValue="
														searchCondition[
															getDetailValue(
																item,
															) +
																JOIN_CHAR +
																DATE_TO
														]
													"
													:hasTime="
														!(
															item.dataType ===
															DATA_TYPE.DATE
														)
													"
													:timeType="item.dataType"
												/>
											</div>
										</template>
										<template v-else>
											<div
												style="
													margin-top: 10px !important;
												"
											>
												<DatePicker
													:id="getDetailValue(item)"
													v-model:modelValue="
														searchCondition[
															getDetailValue(item)
														]
													"
													:hasTime="
														!(
															item.dataType ===
															DATA_TYPE.DATE
														)
													"
													:timeType="item.dataType"
												/>
											</div>
										</template>
									</div>
									<ComboQuery
										v-else-if="isInputMethodCombo(item)"
										:id="getDetailValue(item)"
										:ref="getDetailValue(item)"
										v-model:modelValue="
											searchCondition[
												getDetailValue(item)
											]
										"
										:defaultValue="item.defaultValue"
										:dependency="getDependency(item)"
										:expression="item.inputQuery"
										:inputMethod="item.inputMethod"
										style="max-height: 74px !important"
										@update:modelValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
									<Numericbox
										v-else-if="isInputMethodNumber(item)"
										:id="getDetailValue(item)"
										:ref="getDetailValue(item)"
										v-model:value="
											searchCondition[
												getDetailValue(item)
											]
										"
										:min="0"
										:showSpinButton="true"
										@update:modelValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
									<Textbox
										v-else
										:id="getDetailValue(item)"
										:ref="getDetailValue(item)"
										v-model="
											searchCondition[
												getDetailValue(item)
											]
										"
										:showClearButton="true"
										@update:enteredValue="
											onValueChanged(
												getDetailValue(item),
												$event,
											)
										"
									/>
								</div>
							</div>
						</div>
						<slot name="customSearchCondition"></slot>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { getCurrentInstance, ref, computed, onMounted, watch } from "vue";
import { useSearchCondition } from "~/plugins/composables/tableHandler";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import { COLUMN_TYPE, DATA_TYPE } from "~/constants/common_constants.js";
export default {
	name: "FormSearchConditionLine",
	components: {},
	props: {
		menuId: { type: String, default: "" },
		conditionId: { type: String, default: "" },
		isUseCustomQuery: { type: Boolean, default: false },
		isInitExpanded: { type: Boolean, default: false },
	},
	emits: ["searchByCondition"],
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();
		const { openModalWarning } = useModalAlert();

		// SearchCondition Setting
		const {
			searchConditionDetail,
			fetchSearchConditionDetail,

			checkColumnVisible,
			isInputMethodSearch,
			isInputMethodCombo,
			isInputMethodCheckDate,
			isInputMethodDate,
			isInputMethodNumber,
			isInputMethodText,
			isOperationTypeBetween,
			isFieldMandatory,
			// isFieldValid,
			getDateTimeType,
			getDetailValue,

			// Dependent
			getDependency,
			dependentMap,
			dependentFieldList,

			// Check Mandatory
			checkMandatoryToCustomQuery,
			checkMandatoryToSearch,

			searchConditionData,
			formatToCustomQuery,
			formatToSearch,
			// addMenuSearchCondition,
		} = useSearchCondition();

		const isFilterExpanded = ref(props.isInitExpanded);

		const groupedConditionList = ref([]);
		const searchCondition = ref({});

		const checkGroupOne = ref(false);

		watch(
			() => props.conditionId,
			() => {
				initConditions();
			},
		);

		async function initConditions() {
			await fetchSearchConditionDetail(props.conditionId);
			var grouped = searchConditionDetail.value.reduce((acc, cur) => {
				const { category } = cur;
				if (!checkColumnVisible(cur)) return acc;
				const key = !category ? COLUMN_TYPE.STANDARD : category;
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(cur);
				return acc;
			}, {});

			Object.keys(grouped).forEach(key => {
				const items = grouped[key];
				const chunked = [];
				for (let i = 0; i < items.length; i += 3) {
					chunked.push(items.slice(i, i + 3));
				}
				grouped[key] = chunked;
			});
			groupedConditionList.value = grouped;

			checkGroupOne.value =
				searchConditionDetail.value.filter(checkColumnVisible).length <
				4;
		}

		onMounted(() => {
			if (props.conditionId) initConditions();
		});

		// input search
		const isShowModalSearch = ref(false);
		const modalSearchField = ref("");
		const modalSearchInputQuery = ref("");

		const DETAIL_ID = ref("searchConditionDetailId");
		const OPERATIONTYPE_ID = ref("operationType");
		const JOIN_CHAR = ref("^");
		const DATE_FROM = ref("From");
		const DATE_TO = ref("To");
		const SEARCHCONDITION_ID = ref("searchConditionId");

		/* Input Search */
		function onApplyInputSearch(item) {
			const id = modalSearchField.value;
			searchCondition.value[id] = item[id];
			isShowModalSearch.value = false;
			setDependentFieldList(id);
		}
		function onResetInputSearch(id) {
			searchCondition.value[id] = "";
			setDependentFieldList(id);
		}
		async function openModalSearch(id) {
			const { inputQuery } = searchConditionDetail.value.find(
				f => f[DETAIL_ID.value] == id,
			);
			modalSearchField.value = id;
			modalSearchInputQuery.value = inputQuery;
			isShowModalSearch.value = true;
		}

		/* Input Event */
		function onValueChanged(id, value = "") {
			searchCondition.value[id] = value;
			setDependentFieldList(id, value);
		}

		function setDependentFieldList(key) {
			if (!dependentMap.value[key]) return;

			for (const searchField of dependentMap.value[key]) {
				searchCondition.value[searchField] = "";

				const { inputMethod, dependents } =
					dependentFieldList.value.find(
						i => i[DETAIL_ID.value] === searchField,
					) ?? {};
				if (inputMethod.includes("Choose") && dependents) {
					const params = dependents.reduce((acc, cur) => {
						acc[cur] = searchCondition.value[cur] ?? "";
						return acc;
					}, {});
					proxy.$nextTick(() => {
						proxy.$refs[searchField][0]?.fetchItems(params);
					});
				}
			}
		}

		// 각 항목의 접힘 상태를 저장하는 배열
		const collapsed = ref(groupedConditionList.value.map(() => false));
		/**
		 * Category 아이템 접힘 상태 토글
		 * @param index
		 */
		function toggleCategory(index) {
			collapsed.value[index] = !collapsed.value[index];
		}

		const searchItemsFormatted = computed(() => {
			return searchCondition.value
				.reduce((acc, item) => {
					if (item.value === undefined) {
						item.value = ""; // undefined인 경우 빈 문자열로 치환
					}

					let found = false;
					acc.forEach((formattedItem, index) => {
						if (
							formattedItem.key === item.searchConditionDetailId
						) {
							found = true;
							if (item.operationType === "Between") {
								if (item.value !== "") {
									const [start, end] = item.value
										.split(",")
										.map(str => str.trim());
									acc[index].value = `${start} ~ ${end}`;
								}
							} else {
								acc[index].value = item.value;
							}
						}
					});

					if (!found) {
						if (item.operationType === "Between") {
							if (item.value !== "") {
								const [start, end] = item.value
									.split(",")
									.map(str => str.trim());
								acc.push({
									key: item.searchConditionDetailId,
									label: item.label,
									value: `${start} ~ ${end}`,
								});
							}
						} else {
							acc.push({
								key: item.searchConditionDetailId,
								label: item.label,
								value: item.value,
							});
						}
					}

					return acc;
				}, [])
				.filter(
					item =>
						item.value !== "" &&
						item.value !== null &&
						item.value !== undefined,
				);
		});

		function clickSearch() {
			const formattedData = props.isUseCustomQuery
				? formatToCustomQuery(searchCondition.value)
				: formatToSearch(proxy, searchCondition.value);

			const areFieldsMandatory = props.isUseCustomQuery
				? checkMandatoryToCustomQuery(proxy, formattedData)
				: checkMandatoryToSearch(proxy, formattedData);

			if (!areFieldsMandatory) {
				openModalWarning("Mandatory value is null");
				return;
			}
			emit("searchByCondition", formattedData);
		}

		return {
			checkGroupOne,
			isFilterExpanded,

			initConditions,
			groupedConditionList,
			searchCondition,
			getDetailValue,

			// Dependency
			getDependency,
			dependentMap,
			dependentFieldList,
			onApplyInputSearch,
			onResetInputSearch,
			openModalSearch,
			onValueChanged,

			// Constants
			DATA_TYPE,
			DETAIL_ID,
			JOIN_CHAR,
			DATE_FROM,
			DATE_TO,
			OPERATIONTYPE_ID,
			SEARCHCONDITION_ID,

			// Field Check
			isFieldMandatory,
			isInputMethodSearch,
			isInputMethodCombo,
			isInputMethodCheckDate,
			isInputMethodDate,
			isInputMethodNumber,
			isInputMethodText,
			isOperationTypeBetween,
			getDateTimeType,

			// Input Search
			isShowModalSearch,
			modalSearchField,
			modalSearchInputQuery,

			collapsed,
			toggleCategory,

			clickSearch,
			searchItemsFormatted,
			searchConditionData,
		};
	},
};
</script>
<style scoped>
.search-items {
	background-color: #f0f2f6 !important;
	padding-right: 10px !important;
}
.category-items:not(:last-child) {
	border-bottom: 1px solid #ccc; /* 중간 항목들 사이의 보더 */
	padding-bottom: 5px;
}

.search-box-top-btn-area {
	float: right;
	margin-left: 10px;
	margin-top: 8px;
	position: absolute;
	/* top: calc(100% - 37px); */
	left: calc(100% - 85px);
	z-index: 100000;
}
.search-box-top-btn-area > button {
	margin-left: 0 !important;
	border: none !important;
	background-color: transparent !important;
	border-radius: 0 !important;
}

:deep(.search-field button) {
	margin-top: 22px !important;
}

.category-label {
	margin-bottom: 0px !important;
	margin-top: 5px !important;
	font-size: 1rem !important;
	font-weight: 500;
	cursor: pointer;
}
.category-label:hover {
	text-decoration: underline;
}

.collapsed-label {
	/* border-bottom: 1px solid #ccc9c9; */
	margin-bottom: 10px !important;
}
.filter-expanded {
	color: #fd7e14;
}
</style>
