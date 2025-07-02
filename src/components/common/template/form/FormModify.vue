<template>
	<div class="modify-form card">
		<div class="card-body suite-form">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<div class="item-title ml-1">
						<label>
							<span @click="$emit('close')">
								{{ $t(metaDataId) }}
							</span>
						</label>
						<Breadcrumb :items="[$t(ACTION.MODIFY)]" />
					</div>
					<div class="left-area ml-1">
						<Accordion :panelConfig="panelConfig">
							<template v-slot:item="item">
								<div class="item-field">
									<Checkbox
										:field="item.field"
										:header="item.headerText"
										:modelValue="item.checked"
										@update:modelValue="
											toggleField(item.field)
										"
									/>
								</div>
								<div class="item-input">
									<FormInput
										v-model="newItem[item.field]"
										:dependentTableId="configTableId"
										:fieldConfig="item"
										:hasLabel="false"
										:isDisabled="!item.checked"
										:target="newItem"
										floatLabelType="Never"
									/>
								</div>
							</template>
						</Accordion>
						<div class="item-box-button">
							<ButtonBasic
								class="btn-con-dblue"
								type="reset"
								@onClick="resetData"
							>
								Reset
							</ButtonBasic>
							<ButtonBasic
								type="changeData"
								@onClick="changeData"
							>
								Change Data
							</ButtonBasic>
						</div>
					</div>
				</template>
				<template v-slot:right>
					<Grid
						ref="gridRef"
						:checkbox="false"
						:columns="sortedColumns"
						:deleting="true"
						:excelQueryCellInfo="customizeExcel"
						:fields="fields"
						:freezing="true"
						:gridId="metaDataId"
						:gridItems="gridItems"
						:gridName="metaDataId"
						:importing="true"
						:selecting="false"
						@afterDelete="deleteData"
						@onImport="importData"
						@onQueryCellInfo="customizeCell"
					>
						<template v-slot:header-title>
							<span></span>
						</template>
						<template v-slot:header-content>
							<div class="btn-group">
								<ButtonText
									type="apply"
									@onClick="openModalConfirm"
								/>
							</div>
							<div class="btn-group">
								<ButtonText
									type="close"
									@onClick="$emit('close')"
								/>
							</div>
						</template>
					</Grid>
				</template>
			</Splitter>
		</div>
	</div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from "vue";
import {
	useModalAlert,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";
import { useSpinner } from "~/plugins/composables/uiControl";
import { useItem, useUpdateData } from "~/plugins/composables/dataHandler";
import {
	useColumnDef,
	useFields,
	useFieldColumn,
} from "~/plugins/composables/tableHandler";
import { useCustomization } from "~/plugins/composables/syncfusionHelper";
import { useKeyEvent } from "~/plugins/composables/eventHandler";

import { COLUMN_TYPE } from "~/constants/common_constants.js";
import { ACTION } from "~/plugins/wfb-constants.js";

export default {
	name: "FormModify",
	components: {},
	props: {
		menuId: { type: String },
		metaDataId: { type: String },
		items: { type: Array },
		shouldDelegate: { type: Boolean, default: false },
		api: { type: Function },
	},
	emits: ["apply", "close"],
	setup(props, { emit }) {
		//==================== Config
		const { executeWithSpinner } = useSpinner();
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();
		const { openModalConfirmBy } = useModalConfirm();

		const { modifyList } = useUpdateData();

		const { ID } = useColumnDef();
		const configTableId = props.items[0][ID.TABLE_ID];

		const paneConfigs = [
			{ key: "left", size: 25, min: "250px" },
			{ key: "right", size: 75, min: 50 },
		];

		/**
		 * Confirm 모달 활성화
		 * @todo 수정된 아이템이 없을 경우 에러 여부 확인
		 */
		function openModalConfirm() {
			const hasModifiedItem =
				checkedFields.value.length || importedItems.value.length;
			const items = hasModifiedItem ? gridItems.value : [];

			if (props.shouldDelegate) {
				emit("modify", deepCloneItems(items));
				return;
			}
			openModalConfirmBy(
				ACTION.MODIFY,
				props.metaDataId,
				items,
				modifyData,
			);
		}

		//==================== Grid
		const { metaColumns: columns, fetchModalColumns: fetchColumns } =
			useColumnDef();
		const {
			checkColumnRequired,
			checkColumnModifiable,
			checkColumnVisible,
		} = useFieldColumn();
		const sortedColumns = ref([]);
		const modifyColumns = reactive([]);

		const {
			createItem,
			deepCloneItems,
			filterItem,
			sortItems,
			groupByItems,
		} = useItem();
		const gridRef = ref(null);
		const gridItems = ref(deepCloneItems(props.items));

		const newItem = ref({});
		const modifiedItem = ref({}); // Change 버튼 클릭 기점으로 그리드에 반영
		const importedItems = ref([]);

		// modified 칼럼 우선 정렬
		watch(modifiedItem, modifiedValue => {
			const checkFieldModified = ({ field }) =>
				modifiedValue[field] !== undefined;

			sortedColumns.value = sortItems(
				deepCloneItems(columns.value),
				checkFieldModified,
			);
		});

		onMounted(async () => {
			await fetchColumns(props.menuId, props.metaDataId, ACTION.MODIFY);
			sortedColumns.value = deepCloneItems(columns.value);
			columns.value
				.filter(checkColumnModifiable)
				.forEach(column =>
					modifyColumns.push({ ...column, checked: false }),
				);
		});

		//==================== Field
		const {
			fields,
			keyFields,
			compareKeyField,
			extractFields,
			findColumnByField,
		} = useFields(columns);

		const checkedFields = computed(() =>
			extractFields(modifyColumns, field => field.checked),
		);

		// type 별로 field 데이터를 분류한 패널 객체
		const panelConfig = computed(() =>
			groupByItems(
				ID.COLUMN_TYPE,
				modifyColumns.filter(f => checkColumnVisible(f)),
				COLUMN_TYPE.STANDARD,
			),
		);

		/**
		 * 체크 상태 전환
		 * @param {String} field
		 */
		function toggleField(field) {
			const target = findColumnByField(field, modifyColumns);

			//체크 전환에 따른 Field 값 초기화
			newItem.value[field] = "";
			target.checked = !target.checked;
		}

		/**
		 * @param {Object} target
		 * @return {Object}
		 */
		function mergeModifyItem(target) {
			const importedItem =
				importedItems.value.find(item =>
					compareKeyField(item, target),
				) ?? {};

			return createItem(
				fields.value,
				key =>
					modifiedItem.value[key] ?? importedItem[key] ?? target[key],
			);
		}

		//==================== Customization
		const MODIFY_FIELD = "modify-field";
		const { createBadge, prependIcon } = useCustomization();

		/**
		 * 새로운 값이 있는 경우 엑셀 내부에 화살표로 표기해준다.
		 * @param {Object} config
		 */
		function customizeExcel(config) {
			const newValue = validateNewValue(config);

			if (newValue) {
				config.value += ` -> ${newValue}`;
				config.style = { backColor: "#f9bf9c" };
			}
		}

		/**
		 * 새로운 값이 있는 경우 셀 내부 화살표 표기
		 * @param {Object} event
		 * @param {HTMLTableCellElement} event.cell
		 */
		function customizeCell({ cell, ...config }) {
			const newValue = validateNewValue(config);

			// 빈 값도 Arrow 표기되어야 하므로 null만 체크
			if (newValue !== null) {
				const $span = createBadge(newValue);
				// 화살표 아이콘을 텍스트 노드 이전으로 삽입
				prependIcon($span, "arrow");
				cell.appendChild($span);
				cell.classList.add(MODIFY_FIELD);
			}
		}

		/**
		 * 새로운 값이 있는지 검증; modifyField에 해당되지 않으면 null 반환
		 * @param {Object} config
		 * @param {Object} config.data
		 * @param {String} config.column.field
		 * @returns {String|null}
		 */
		function validateNewValue({ data, column: { field } }) {
			const { [field]: newValue } = mergeModifyItem(data);
			const oldValue = data[field] ?? "";
			// newValue가 undefined이면 수정되지 않은 것.
			if (newValue !== undefined && newValue !== oldValue) {
				return newValue;
			}
			return null;
		}

		//==================== Event
		const { activateApplyEvent, activateUpdateEvent, activateResetEvent } =
			useKeyEvent();

		// F2로 create 수행
		activateApplyEvent(window, () => openModalConfirm(gridItems.value));

		// F3로 changeData
		activateUpdateEvent(window, changeData);

		// ESC키로 리셋
		activateResetEvent(window, resetData);

		/**
		 * 데이터 생성 후 모달 닫기
		 */
		async function modifyData(comment) {
			const items = gridItems.value.map(mergeModifyItem);
			const { length } = await modifyList(
				props.api,
				props.metaDataId,
				items,
				comment,
			);

			// 성공 데이터가 있는 경우에만 모달 닫기
			if (length > 0) {
				emit("close", items);
			}
		}

		/**
		 * orgItem 값을 newItem에 할당
		 */
		function resetData() {
			executeWithSpinner(() => {
				importedItems.value = [];
				modifiedItem.value = {};
				newItem.value = {};
				gridItems.value = deepCloneItems(gridItems.value);
				modifyColumns.forEach(field => (field.checked = false));
			});
		}

		/**
		 * @param {Object} deletedItem
		 */
		function deleteData(deletedItem) {
			gridItems.value = gridItems.value.filter(
				item => !compareKeyField(item, deletedItem),
			);
		}

		/**
		 * newItem을 검증 후 그리드에 적용한다.
		 */
		async function changeData() {
			if (!checkedFields.value.length) {
				openModalWarning("modal.create.noData");
				return;
			}
			if (!validateEmptyFields(newItem.value)) {
				return;
			}

			//아이템 초기화
			gridItems.value = deepCloneItems(gridItems.value);
			executeWithSpinner(() => {
				modifiedItem.value = filterItem(
					newItem.value,
					checkedFields.value,
				);
			});
		}

		/**
		 * @param {Object[]} dataItems 엑셀 데이터
		 */
		function importData(dataItems) {
			const newItems = [];

			for (const dataItem of dataItems) {
				const orgItem = gridItems.value.find(item =>
					compareKeyField(item, dataItem),
				);

				// 그리드에서 선택하지 않은 데이터가 포함될 경우 배제
				if (orgItem) {
					const modifyFields = extractFields(modifyColumns);
					const item = filterItem(dataItem, [
						...keyFields.value,
						...modifyFields,
					]);
					if (!validateEmptyFields(item)) {
						return;
					}
					newItems.push(item);
				}
			}

			resetData();
			importedItems.value = newItems;
		}

		/**
		 * Empty 필드에 대한 검증
		 * @param {Object} newItem
		 * @return {Boolean}
		 */
		function validateEmptyFields(newItem) {
			const emptyFieldColumns = checkedFields.value
				.filter(field => !`${newItem[field] ?? ""}`)
				.map(field => findColumnByField(field));

			//필수일 경우 검증 실패
			if (emptyFieldColumns.some(checkColumnRequired)) {
				openModalWarning("modal.create.requiredKey");
				return false;
			}

			//empty field 안내
			if (emptyFieldColumns.length) {
				openModalInfo("info.emptyData", {
					param: extractFields(emptyFieldColumns),
				});
			}

			return true;
		}

		return {
			// Config
			ACTION,
			openModalConfirm,
			openModalInfo,
			openModalWarning,
			openModalError,
			executeWithSpinner,
			configTableId,
			paneConfigs,

			// Field Variable
			modifyColumns,
			fields,
			keyFields,
			checkedFields,

			// Field Method
			compareKeyField,
			extractFields,
			findColumnByField,
			checkColumnRequired,
			toggleField,

			// Grid
			gridRef,
			sortedColumns,
			gridItems,
			filterItem,
			deepCloneItems,

			// Grid Field Item
			panelConfig,
			newItem,
			modifiedItem,
			importedItems,

			// Customization
			customizeExcel,
			customizeCell,

			// Event
			modifyData,
			resetData,
			deleteData,
			changeData,
			importData,
			validateEmptyFields,
		};
	},
};
</script>
<style scoped>
/* Grid Button */
/* :deep(#right-pane .item-box .btn-default) {
	color: #767676 !important;
} */

/* Field Container */
/* :deep(#left-pane .info-container) {
	height: calc(100vh - 322px) !important;
} */
</style>
