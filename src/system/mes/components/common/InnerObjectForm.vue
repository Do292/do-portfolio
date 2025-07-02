<template>
	<div id="field-area">
		<div class="d-table">
			<div
				v-for="(category, index) in groupedConditionList"
				:key="index"
				class="category"
			>
				<div v-if="!proxy.$isEmpty(category[0].category)">
					<label>
						{{ $t(category[0].category) }}
					</label>
				</div>
				<div
					v-for="field in category"
					:key="field.category + field.key.objectTypeDetailId"
					class="table-item wfl-input-item"
				>
					<div class="d-table-row">
						<span
							:class="{
								'mr-2 input-title-redonly':
									isFieldMandatory(field),
								'mr-2 input-title': !isFieldMandatory(field),
							}"
						>
							{{ $t(field.caption) }}
						</span>
					</div>
					<div class="d-table-row input">
						<wfl-textbox
							v-if="isTypeText(field)"
							:id="field.key.objectTypeDetailId"
							:ref="field.key.objectTypeDetailId"
							v-model="newItem[field.key.objectTypeDetailId]"
							:readonly="setReadOnlyValue(field, enabledObj)"
							@keyup.enter="
								onDirectKeyChange(
									field.key.objectTypeDetailId,
									$event.target.value,
									index,
								)
							"
						></wfl-textbox
						><DropDownList
							v-else-if="isTypeCombo(field)"
							:id="field.key.objectTypeDetailId"
							:ref="field.key.objectTypeDetailId"
							v-model:selectValue="
								newItem[field.key.objectTypeDetailId]
							"
							:dependency="
								field.dependentId ? field.dependency : {}
							"
							:expression="field.inputQuery"
							:inputMethod="field.inputMethod"
							:readonly="setReadOnlyValue(field, enabledObj)"
							@update:modelValue="
								onDirectKeyChange(
									field.key.objectTypeDetailId,
									$event,
									index,
								)
							"
						></DropDownList>
						<InputSearch
							v-else-if="isTypeSearch(field)"
							:id="field.key.objectTypeDetailId"
							:ref="field.key.objectTypeDetailId"
							:readonly="setReadOnlyValue(field, enabledObj)"
							:value="newItem[field.key.objectTypeDetailId]"
						></InputSearch>
						<!-- todo: inputSearch -->
						<wfl-datepicker
							v-else-if="isTypeDate(field)"
							:id="field.key.objectTypeDetailId"
							:ref="field.key.objectTypeDetailId"
							v-model="newItem[field.key.objectTypeDetailId]"
							:readonly="setReadOnlyValue(field, enabledObj)"
							style="width: 100%"
							@change="
								setNextFieldFocus($event, index);
								// @change 이벤트가 실행된 후, @keyup.enter 이벤트를 무시하기 위해 특정 속성을 설정
								this.isSkipKeyup = true;
							"
							@keyup.enter="
								if (!this.isSkipKeyup) {
									setNextFieldFocus($event.target, index);
								} else {
									// @change 이벤트에서 설정된 경우에는 아무것도 실행하지 않음.
									// 이렇게 하면 @keyup.enter 이벤트를 무시할 수 있음.
									this.isSkipKeyup = false; // 이후 이벤트를 다시 활성화하려면 이 부분을 필요에 따라 조정할 수 있음.
								}
							"
						/>
						<Numericbox
							v-else-if="isTypeNum(field)"
							:id="field.key.objectTypeDetailId"
							:ref="field.key.objectTypeDetailId"
							v-model:value="
								newItem[field.key.objectTypeDetailId]
							"
							:min="0"
							:readonly="setReadOnlyValue(field, enabledObj)"
							:showSpinButton="true"
							@keyup.enter="
								onNumberChanged(
									field.key.objectTypeDetailId,
									index,
								)
							"
						/>
						<!-- <wfl-textbox
											v-else
											:id="field.key.objectTypeDetailId"
											:ref="field.key.objectTypeDetailId"
											:readonly="
												setReadOnlyValue(
													field,
													enabledObj,
												)
											"
											v-model="newItem[field.key.objectTypeDetailId]"
											@keyup.enter="
												onDirectKeyChange(
													field.key.objectTypeDetailId,
													$event.target.value,
													index,
												)
											"
										></wfl-textbox> -->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { getCurrentInstance, ref, watch, computed } from "vue";

export default {
	name: "InnerObjectForm",
	components: {},
	props: {
		// 왼쪽 영역 Columns
		scanFieldList: { type: Array },

		// todo: 다음 field focus 및 데이터 일치여부 체크시 필요
		connectedField: { type: Object },
		setItemFieldDesc: { type: Function, required: false },
	},
	data() {
		return {
			isSkipKeyup: true,
		};
	},
	setup(props) {
		const { proxy } = getCurrentInstance();

		const fieldList = ref(props.scanFieldList);
		const newItem = ref({});
		const enabledObj = ref({});

		watch(
			() => props.scanFieldList,
			newValue => {
				fieldList.value = newValue;
				setScanArea();
			},
		);

		const groupedConditionList = computed(() => {
			const result = {};
			if (fieldList.value) {
				fieldList.value.forEach(condition => {
					const { category, visibilityFlag } = condition;
					if (visibilityFlag === "N") return; // visibilityFlag가 Y인 것만 보여줍니다.
					if (!result[category]) {
						result[category] = [];
					}
					result[category].push(condition);
				});

				for (const key in result) {
					result[key].sort(
						(a, b) => a.categoryPosition - b.categoryPosition,
					);
				}
				return result;
			} else {
				return [];
			}
		});

		// todo:
		const dependentFieldList = computed(() =>
			fieldList.value
				.filter(({ dependentAttributeId }) =>
					this.isFieldValid(dependentAttributeId),
				)
				.map(({ dependentAttributeId, ...field }) => {
					const dependents = dependentAttributeId
						.replaceAll(" ", "")
						.split(",");
					return { ...field, dependentAttributeId, dependents };
				}),
		);

		function setScanArea() {
			fieldList.value?.map(f => {
				enabledObj.value[f.key.objectTypeDetailId] = true;
				newItem.value[f.key.objectTypeDetailId] = "";
			});
		}
		return {
			proxy,

			fieldList,
			newItem,
			enabledObj,
			dependentFieldList,
			groupedConditionList,
		};
	},
	methods: {
		// 화면그리기용 함수 todo: constants정의?
		isTypeText({ inputMethod: type }) {
			return type === "Direct" || this.$isEmpty(type);
		},
		isTypeSearch({ inputMethod: type }) {
			return type === "Search";
		},
		isTypeCombo({ inputMethod: type }) {
			const chooseType = type?.at(-1);
			return ["C", "D"].includes(chooseType);
		},
		isTypeDate({ inputMethod: type }) {
			return type === "Date";
		},
		isTypeNum({ inputMethod: type }) {
			return type === "Double" || "Long";
		},
		isFieldMandatory(field) {
			return field.mandatoryFlag === "Y";
		},
		setReadOnlyValue(field, enabledObj) {
			if (
				field.inputType === "Never" ||
				enabledObj[field.key.objectTypeDetailId] === false
			) {
				return true;
			}
			return false;
		},

		// change Event todo
		onDirectKeyChange(id, value, index) {
			const { dataType } = this.getColumnByField(this.fieldColumns, id);

			if (["Long", "Double"].includes(dataType)) {
				this.newItem[id] = /^\d+$/.test(value) ? value : 0;
			} else {
				this.newItem[id] = value;
			}

			this.setDependentFieldList(id, value);

			const nextCheck = this.setNextFieldValue(id, value);
			if (nextCheck) this.setNextFieldFocus({ value }, index);
		},
		onNumberChanged(id, index) {
			const value = this.formatNumber(id);
			this.newItem[id] = value;
			this.setDependentFieldList(id, value);

			this.setNextFieldFocus({ value }, index);
		},

		// todo: connectedField, 포커스
		setNextFieldValue(id, value) {
			if (this.$isEmpty(this.connectedField)) return false;
			if (this.$isEmpty(this.connectedField[id])) return true; // 딸린 field가 없으면 패스
			return this.setItemFieldDesc(id, value);
		},
		setNextFieldFocus({ value }, index) {
			if (!this.isShowScanArea) return;
			if (this.$isEmpty(value)) return;
			if (
				this.fieldColumns[index].inputType ==
				this.$APP_AIM_CONSTANTS.NEVER
			)
				return;
			const nextList = this.fieldColumns.slice(index + 1);
			const foundNextColumn = nextList.find(
				i => i.inputType !== this.$APP_AIM_CONSTANTS.NEVER,
			);
			if (!this.$isEmpty(foundNextColumn)) {
				const nextColumnId = foundNextColumn.field;
				this.$refs[nextColumnId][0].focusIn();
			} else {
				setTimeout(() => {
					this?.addDataTo();
				}, 100);
			}
		},

		resetScanFields() {
			Object.keys(this.newItem).forEach(key => {
				this.newItem[key] = "";
			});
		},

		// Action
		async addDataTo() {
			this.$emit("addDataTo");
		},
	},
};
</script>

<style scoped>
/* #field-area {
	background-color: aqua;
} */
.input-title,
.input-title-redonly {
	width: fit-content;
	min-width: 109px !important;
	margin-bottom: 0px !important;
	font-size: 0.8rem !important;
	font-weight: 400;
}
.input-title:before {
	content: "\ea70";
	font-family: aimcons;
	color: #ddd;
}
.input-title-redonly:before {
	content: "\ea70";
	font-family: aimcons;
	color: #f97203;
}
</style>
