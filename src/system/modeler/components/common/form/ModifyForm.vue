<template>
	<div class="modify-form card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<div class="item-title ml-1">
						<label>
							<span @click="$emit('close')">
								{{ $t(tableId) }}
							</span>
						</label>
						<BreadcrumbTemplate :items="[$t(ACTION.MODIFY)]" />
					</div>
					<div class="left-area ml-1">
						<PanelTemplate
							:getHeader="getPanelTitle"
							:panelConfig="panelConfig"
						>
							<template v-slot:item="item">
								<div class="item-field">
									<CheckboxTemplate
										:field="item.field"
										:header="item.headerText"
										:modelValue="item.checked"
										@update:modelValue="
											toggleField(item.field)
										"
									/>
								</div>
								<div class="item-input">
									<InputField
										v-model="newItem[item.field]"
										:fieldConfig="item"
										:hasLabel="false"
										:isDisabled="!item.checked"
										:tableId="configTableId"
										:target="newItem"
										floatLabelType="Never"
										@click="initGenerator"
										@keyup.enter="nextGenerator"
									/>
								</div>
							</template>
						</PanelTemplate>
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
					<GridTemplate
						ref="gridRef"
						:checkbox="false"
						:columns="sortedColumns"
						:deleting="true"
						:excelQueryCellInfo="customizeExcel"
						:fields="fields"
						:freezing="true"
						:gridItems="gridItems"
						:gridName="tableId"
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
					</GridTemplate>
				</template>
			</Splitter>
		</div>
	</div>
</template>

<script>
import GridTemplate from "~/system/modeler/components/common/template/GridTemplate";
import PanelTemplate from "~/system/modeler/components/common/template/PanelTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import CheckboxTemplate from "~/system/modeler/components/common/template/CheckboxTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import InputField from "~/system/modeler/components/common/input/InputField";

import { readonly, ref, reactive, computed, watch, onMounted } from "vue";
import {
	useModalAlert,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useItem,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useColumnDef,
	useFields,
	useFieldColumn,
} from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useCustomization } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import {
	useKeyEvent,
	useInputFocusGenerator,
} from "~/system/modeler/plugins/composables/modeler-eventHandler";

import {
	ID,
	COLUMN_TYPE,
	ACTION,
} from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "ModifyForm",
	components: {
		// Template
		GridTemplate,
		PanelTemplate,
		BreadcrumbTemplate,
		CheckboxTemplate,

		// Basic Component
		ButtonBasic,
		ButtonText,
		InputField,
	},
	props: {
		tableId: { type: String },
		items: { type: Array },
		shouldDelegate: { type: Boolean, default: false },
	},
	emits: ["apply", "close"],
	setup(props, { emit }) {
		//==================== Config
		const { executeWithSpinner } = useSpinner();
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();
		const { openModalConfirmBy } = useModalConfirm();

		const { modifyList } = useUpdateData();
		const configTableId =
			props.items[0][ID.META_ID] || props.items[0][ID.TABLE_ID];

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
			openModalConfirmBy(ACTION.MODIFY, props.tableId, items, modifyData);
		}

		//==================== Grid
		const { columns, fetchMetaColumns } = useColumnDef();
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
			await fetchMetaColumns(props.tableId);
			sortedColumns.value = deepCloneItems(columns.value);
			columns.value
				.filter(checkColumnVisible)
				.filter(checkColumnModifiable)
				.forEach(column =>
					modifyColumns.push({ ...column, checked: false }),
				);
		});

		//==================== Field
		const CHECKBOX = readonly({
			DELAY: 100,
			SELECTOR:
				".e-acrdn-panel:not(.e-content-hide) .e-checkbox-wrapper input",
		});

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
				modifyColumns.filter(checkColumnVisible),
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

			// input 활성화 되면 자동 포커싱
			if (target.checked) {
				// 해당 field를 기준으로 체크박스를 찾아 index를 구한다.
				const $checkboxes = document.querySelectorAll(
					CHECKBOX.SELECTOR,
				);
				const index = [...$checkboxes].findIndex(
					({ id }) => id === field,
				);
				setTimeout(() => {
					initAndFocusGenerator(index);
				}, CHECKBOX.DELAY);
			}
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
		 * 새로운 값이 있는지 검증 후 반환; modifyField에 해당되지 않으면 null 반환
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
			const newItems = await modifyList(props.tableId, items, comment);

			// 성공한 데이터가 있는 경우에만 모달 닫기
			if (newItems.length) {
				// 성공한 경우 새로운 값으로 치환
				const finalItems = items.map(item => {
					const newItem = newItems.find(newItem =>
						compareKeyField(newItem, item),
					);
					return newItem ?? item;
				});
				emit("close", finalItems);
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

		//==================== Input
		const { initGenerator, nextGenerator, initAndFocusGenerator } =
			useInputFocusGenerator();

		return {
			// Config
			ACTION,
			openModalConfirm,
			openModalInfo,
			openModalWarning,
			openModalError,
			executeWithSpinner,
			configTableId,

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
			validateEmptyFields,

			// Input Event
			initGenerator,
			nextGenerator,
		};
	},
	data() {
		return {
			paneConfigs: [
				{ key: "left", size: 25, min: "250px" },
				{ key: "right", size: 75, min: 50 },
			],
		};
	},
	methods: {
		//==================== Field Data
		/**
		 * @param {Object[]} dataItems 엑셀 데이터
		 */
		importData(dataItems) {
			const newItems = [];

			for (const dataItem of dataItems) {
				const orgItem = this.gridItems.find(item =>
					this.compareKeyField(item, dataItem),
				);

				// 그리드에서 선택하지 않은 데이터가 포함될 경우 배제
				if (orgItem) {
					const item = this.deepCloneItems(dataItem);
					newItems.push(item);
				}
			}

			this.resetData();
			this.importedItems = newItems;
		},
	},
};
</script>
<style scoped>
/* Splitter */
:deep(.e-split-bar) {
	margin: 40px 10px 10px 10px !important;
}

/* Layout */

.item-title span {
	cursor: pointer;
	white-space: nowrap !important;
}
.item-title span:hover {
	text-decoration: underline;
}

/* Grid Button */
:deep(#right-pane .item-box .btn-default) {
	color: #767676 !important;
}

/* Field Container */
:deep(#left-pane .info-container) {
	height: calc(100vh - 322px) !important;
	overflow: auto;
}

/* Modify Field */
:deep(.modify-field) {
	padding-right: 14px !important;
}
:deep(.modify-field span) {
	font-weight: 500;
	color: #f96103 !important;
}
:deep(.modify-field i) {
	margin: 0px 5px;
	transform: translateY(1px);
	color: black !important;
}
</style>
