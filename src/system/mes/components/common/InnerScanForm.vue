<template>
	<div class="left-area hcalc-0 pr-3">
		<div class="row pt-1 pb-0">
			<div class="col-5 item-title pl-2">
				<label>{{ $t("Scan") }}</label>
			</div>

			<div class="col-7 mt-2">
				<div class="btn-area">
					<ButtonBasic
						class="mr-1"
						type="reset"
						@onClick="resetScanFields"
					>
						{{ $t("Reset") }}
					</ButtonBasic>
					<ButtonBasic type="addData" @onClick="$emit('addDataTo')">
						<slot>{{ $t("AddData") }}</slot>
					</ButtonBasic>
				</div>
			</div>
		</div>
		<div class="col-12">
			<div class="info-area">
				<div class="info-content">
					<div class="wfl-input-group">
						<div v-for="(field, index) in scanFields" :key="index">
							<div class="d-table" style="width: 100% !important">
								<div class="d-table-row">
									<label
										:class="{
											'input-title-redonly':
												isFieldRequired(field),
											'input-title':
												!isFieldRequired(field),
										}"
									>
										{{ field.label }}
									</label>
								</div>
								<div class="d-table-row input">
									<Textbox
										v-if="isTypeText(field)"
										:id="field.key.objectTypeDetailId"
										:ref="field.key.objectTypeDetailId"
										v-model="
											newItem[
												field.key.objectTypeDetailId
											]
										"
										:readonly="
											setReadOnlyValue(field, enabledObj)
										"
										@keyup.enter="
											onDirectKeyChange(
												field.key.objectTypeDetailId,
												$event.target.value,
												index,
											)
										"
									></Textbox
									><DropDownList
										v-else-if="isTypeCombo(field)"
										:id="field.key.objectTypeDetailId"
										:ref="field.key.objectTypeDetailId"
										v-model:selectValue="
											newItem[
												field.key.objectTypeDetailId
											]
										"
										:dependency="
											field.dependentId
												? field.dependency
												: null
										"
										:expression="field.inputQuery"
										:inputMethod="field.inputMethod"
										:readonly="
											setReadOnlyValue(field, enabledObj)
										"
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
										:readonly="
											setReadOnlyValue(field, enabledObj)
										"
										:value="
											newItem[
												field.key.objectTypeDetailId
											]
										"
									></InputSearch>
									<!-- todo: inputSearch -->
									<InputDate
										v-else-if="isTypeDate(field)"
										:id="field.key.objectTypeDetailId"
										:ref="field.key.objectTypeDetailId"
										v-model="
											newItem[
												field.key.objectTypeDetailId
											]
										"
										:hasTime="!isTypeDate(field)"
										:readonly="
											setReadOnlyValue(field, enabledObj)
										"
										style="width: 100%"
										@change="
											setNextFieldFocus($event, index);
											// @change 이벤트가 실행된 후, @keyup.enter 이벤트를 무시하기 위해 특정 속성을 설정
											this.isSkipKeyup = true;
										"
										@keyup.enter="
											if (!this.isSkipKeyup) {
												setNextFieldFocus(
													$event.target,
													index,
												);
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
											newItem[
												field.key.objectTypeDetailId
											]
										"
										:min="0"
										:readonly="
											setReadOnlyValue(field, enabledObj)
										"
										:showSpinButton="true"
										@keyup.enter="
											onNumberChanged(
												field.key.objectTypeDetailId,
												index,
											)
										"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- modify 항목 -->
		<div v-if="useModifyFields" class="scan-innerModify mt-4 pt-3">
			<div class="row pt-1 pb-0">
				<div class="col-5 item-title pl-2">
					<label>{{ $t("Modify") }}</label>
				</div>

				<div class="col-7 mt-2">
					<div class="btn-area">
						<ButtonBasic
							class="mr-1"
							type="reset"
							@onClick="resetModifyFields"
						>
							{{ $t("Reset") }}
						</ButtonBasic>
						<ButtonBasic
							type="addData"
							@onClick="$emit('changeData', modifyItem)"
						>
							<slot>{{ $t("Change Data") }}</slot>
						</ButtonBasic>
					</div>
				</div>
			</div>
			<div class="col-12">
				<div class="info-area">
					<div class="info-content">
						<div class="wfl-input-group">
							<div
								v-for="(field, index) in modifyFields"
								:key="index"
							>
								<div
									class="d-table"
									style="width: 100% !important"
								>
									<div class="d-table-row">
										<label
											:class="{
												'input-title-redonly':
													isFieldRequired(field),
												'input-title':
													!isFieldRequired(field),
											}"
										>
											{{ field.label }}
										</label>
									</div>
									<div class="d-table-row input">
										<Textbox
											v-if="isTypeText(field)"
											:id="field.key.objectTypeDetailId"
											:ref="field.key.objectTypeDetailId"
											v-model:selectValue="
												modifyItem[
													field.key.objectTypeDetailId
												]
											"
											:readonly="
												setReadOnlyValue(
													field,
													enabledObj,
												)
											"
											@keyup.enter="
												onDirectKeyChangeModify(
													field.key
														.objectTypeDetailId,
													$event.target.value,
													index,
												)
											"
										></Textbox
										><DropDownList
											v-else-if="isTypeCombo(field)"
											:id="field.key.objectTypeDetailId"
											:ref="field.key.objectTypeDetailId"
											v-model="
												modifyItem[
													field.key.objectTypeDetailId
												]
											"
											:defaultValue="modelValue"
											:dependency="
												field.dependentId
													? field.dependency
													: null
											"
											:expression="field.inputQuery"
											:inputMethod="field.inputMethod"
											:readonly="
												setReadOnlyValue(
													field,
													enabledObj,
												)
											"
											@update:modelValue="
												onDirectKeyChangeModify(
													field.key
														.objectTypeDetailId,
													$event,
													index,
												)
											"
										></DropDownList>
										<InputSearch
											v-else-if="isTypeSearch(field)"
											:id="field.key.objectTypeDetailId"
											:ref="field.key.objectTypeDetailId"
											:readonly="
												setReadOnlyValue(
													field,
													enabledObj,
												)
											"
											:value="
												modifyItem[
													field.key.objectTypeDetailId
												]
											"
											@search="searchItem(field)"
										></InputSearch>
										<!-- todo: inputSearch -->
										<InputDate
											v-else-if="isTypeDate(field)"
											:id="field.key.objectTypeDetailId"
											:ref="field.key.objectTypeDetailId"
											v-model="
												modifyItem[
													field.key.objectTypeDetailId
												]
											"
											:hasTime="!isTypeDate(field)"
											:readonly="
												setReadOnlyValue(
													field,
													enabledObj,
												)
											"
											style="width: 100%"
											@change="
												setNextFieldFocus(
													$event,
													index,
												);
												// @change 이벤트가 실행된 후, @keyup.enter 이벤트를 무시하기 위해 특정 속성을 설정
												this.isSkipKeyup = true;
											"
											@keyup.enter="
												if (!this.isSkipKeyup) {
													setNextFieldFocus(
														$event.target,
														index,
													);
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
												modifyItem[
													field.key.objectTypeDetailId
												]
											"
											:min="0"
											:readonly="
												setReadOnlyValue(
													field,
													enabledObj,
												)
											"
											:showSpinButton="true"
											@keyup.enter="
												onNumberChangedModify(
													field.key
														.objectTypeDetailId,
													index,
												)
											"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<slot name="searchModify"> </slot>
	</div>
</template>

<script>
import { ref, watch, computed } from "vue";
import { useModalSearch } from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "InnerScanForm",
	components: {},
	props: {
		// 왼쪽 영역 Columns
		scanFieldList: { type: Array },
		modifyFieldList: { type: Array },
		useModifyFields: { type: Boolean, default: false },

		// todo: 다음 field focus 및 데이터 일치여부 체크시 필요
		connectedField: { type: Object },
		setItemFieldDesc: { type: Function, required: false },
	},
	emits: ["addDataTo", "changeData"],
	data() {
		return {
			isSkipKeyup: true,
		};
	},
	setup(props) {
		const scanFields = ref(props.scanFieldList);
		const modifyFields = ref(props.modifyFieldList);
		const newItem = ref({});
		const modifyItem = ref({});
		const enabledObj = ref({});
		const { openModalSearch } = useModalSearch();

		watch(
			[() => props.scanFieldList, () => props.modifyFieldList],
			([newScanFieldValue, newModifyListValue]) => {
				scanFields.value = newScanFieldValue;
				modifyFields.value = newModifyListValue;
				setScanArea();
			},
		);

		// todo:
		const dependentFieldList = computed(() =>
			scanFields.value
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
			scanFields.value?.map(f => {
				enabledObj.value[f.key.objectTypeDetailId] = true;
				newItem.value[f.key.objectTypeDetailId] = "";
			});
			modifyFields.value?.map(f => {
				enabledObj.value[f.key.objectTypeDetailId] = true;
				modifyItem.value[f.key.objectTypeDetailId] = "";
			});
		}

		function searchItem(items) {
			console.log(items);
			openModalSearch();
		}

		return {
			scanFields,
			modifyFields,
			newItem,
			modifyItem,
			enabledObj,
			dependentFieldList,

			// methods
			searchItem,
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
		isFieldRequired(field) {
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

		// change Event todo - newItem(Scan)
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
		// change Event todo - newItem(Modify)
		onDirectKeyChangeModify(id, value, index) {
			const { dataType } = this.getColumnByField(this.fieldColumns, id);

			if (["Long", "Double"].includes(dataType)) {
				this.modifyItem[id] = /^\d+$/.test(value) ? value : 0;
			} else {
				this.modifyItem[id] = value;
			}

			this.setDependentFieldList(id, value);

			const nextCheck = this.setNextFieldValue(id, value);
			if (nextCheck) this.setNextFieldFocus({ value }, index);
		},
		onNumberChangedModify(id, index) {
			const value = this.formatNumber(id);
			this.modifyItem[id] = value;
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
		resetModifyFields() {
			Object.keys(this.modifyItem).forEach(key => {
				this.modifyItem[key] = "";
			});
		},
	},
};
</script>

<style scoped>
.item-title > label {
	font-weight: 500 !important;
}
.col-12 {
	line-height: 30px !important;
}
.e-input-group .e-control-wrapper {
	height: 25px !important;
	border: 1px solid !important;
	border-radius: 5px !important;
}
.hcalc-0 {
	height: calc(100vh - 215px);
}
.btn-area {
	float: right !important;
	margin-right: 0.4rem;
}

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
	margin-right: 5px;
}
.input-title-redonly:before {
	content: "\ea70";
	font-family: aimcons;
	color: red;
	margin-right: 5px;
}
.scan-innerModify {
	border-top: 1px solid #e0e0e0;
}
</style>
