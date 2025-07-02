<template>
	<Grid
		ref="templateRef"
		:adding="adding"
		:autoFit="autoFit"
		:checkbox="checkbox"
		:columns="gridColumns"
		:deleting="deleting"
		:dragging="dragging"
		:dropTargetId="dropTargetId"
		:exporting="exporting"
		:fields="fields"
		:freezing="freezing"
		:gridId="gridId ?? metaDataId"
		:gridItems="gridItems"
		:gridName="gridName"
		:isCrossGridDrop="isCrossGridDrop"
		:paging="paging"
		@afterBindData="$emit('onAfterBindData')"
		@afterCrossDrop="onAfterCrossDrop"
		@afterDrop="onAfterDrop"
		@onCheckBoxChange="updateCheckItems"
		@onQueryCellInfo="customizeCell"
		@onRecordClick="clickRow"
		@onRecordDoubleClick="rowDoubleClick"
		@onRowDataBound="customizeRow"
	>
		<template v-slot:header-title>
			<label>
				{{ gridName }}
			</label>
			<slot name="grid-path">
				<Breadcrumb
					v-if="hasPath && isUsePath"
					:isSelectable="canSelectBreadcrumb"
					:items="paths"
				/>
			</slot>
		</template>
		<template v-slot:header-content>
			<slot name="prefix-grid-button"></slot>
			<slot name="grid-button">
				<div v-if="isUseFilter || isUseRefresh" class="btn-group">
					<ButtonFilter
						v-if="isUseFilter"
						@onFilter="filterGridItems"
					/>
					<ButtonBasic
						v-if="isUseRefresh"
						type="refresh"
						@onClick="initGridItems()"
					/>
				</div>
				<div
					v-if="isUseCreate || isUseModify || isUseAction"
					class="btn-group"
				>
					<ButtonBasic
						v-if="isUseCreate"
						:needsAuthority="false"
						:type="ACTION.CREATE"
						class="text-green"
						@onClick="openModalCreate"
					/>
					<ButtonBasic
						v-if="isUseModify"
						:needsAuthority="false"
						:type="ACTION.MODIFY"
						@onClick="openModalModify"
					/>
					<ButtonBasic
						v-if="isUseDelete"
						:needsAuthority="false"
						:type="ACTION.DELETE"
						class="text-red"
						@onClick="openModalDelete"
					/>
				</div>
				<div v-if="isUseAction" class="btn-group">
					<ButtonDropdown
						:items="actionItems"
						:needsAuthority="false"
						@onSelect="selectAction"
					></ButtonDropdown>
				</div>
			</slot>
			<slot name="postfix-grid-button"></slot>
		</template>

		<!-- Column Template -->
		<template v-slot:[COLUMN_TEMPLATE.HOVER]="data">
			<a
				class="custom-cell-hover"
				@click="$emit('clickHoverCell', { ...$event, data })"
			>
				{{ data[data.column.field] }}
			</a>
		</template>
		<template v-slot:[COLUMN_TEMPLATE.SWITCH]="config">
			<SwitchFlag
				:config="config"
				:enabled="isModifiable(config)"
				@onChange="changeFlag"
			/>
		</template>
		<template v-slot:[COLUMN_TEMPLATE.NUMERIC]="data">
			<Numericbox
				:id="formatComponentId('numeric', data)"
				:modelValue="data[data.column.field]"
				:showSpinButton="true"
				@afterEnter="afterEnterNumericCell(data)"
				@update:modelValue="
					changeCell($event, 'changeNumericCell', data, data.index)
				"
			/>
		</template>
		<template v-slot:[COLUMN_TEMPLATE.TEXTBOX]="data">
			<Textbox
				:id="formatComponentId('textbox', data)"
				:modelValue="data[data.column.field]"
				:showClearButton="true"
				@update:modelValue="
					changeCell($event, 'changeTextboxCell', data, data.index)
				"
			/>
		</template>
		<template v-slot:[COLUMN_TEMPLATE.COMBO]="data">
			<wfl-combobox
				:id="formatComponentId('combobox', data)"
				v-model="data[data.column.field]"
				:dataSource="data[data.column.field + 'ComboSource']"
				:headerTemplate="'hTemplate'"
				:itemTemplate="'iTemplate'"
				:placeholder="' '"
				@update:modelValue="
					changeCell($event, 'changeComboCell', data, data.index)
				"
			>
				<template #hTemplate>
					<div v-show="data[data.column.field + 'MultiColumns']">
						<thead>
							<tr>
								<th
									v-for="col in data[
										data.column.field + 'ComboColumn'
									]"
									:key="
										formatComponentId('combobox', data) +
										'_header_' +
										col
									"
								>
									{{ col }}
								</th>
							</tr>
						</thead>
					</div>
				</template>
				<template #iTemplate="{ rowData }">
					<div v-show="data[data.column.field + 'MultiColumns']">
						<tr class="row">
							<td
								v-for="col in data[
									data.column.field + 'ComboColumn'
								]"
								:key="
									formatComponentId('combobox', data) +
									'_item_' +
									col
								"
								class="col"
							>
								{{ rowData[col] }}
							</td>
						</tr>
					</div>
				</template>
			</wfl-combobox>
		</template>
	</Grid>
</template>

<script>
// Modeler
import ButtonFilter from "~/system/modeler/components/common/button/ButtonFilter";

// Common
import { ref, computed, watch, onMounted, nextTick } from "vue";
import {
	useCustomization,
	useGrid,
} from "~/plugins/composables/syncfusionHelper";
import {
	useModalAlert,
	useModalSuccess,
} from "~/plugins/composables/modalHandler";
import {
	useSpinner,
	useInformation,
	useImage,
} from "~/plugins/composables/uiControl";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/plugins/composables/dataHandler";
import {
	useColumnDef,
	useFields,
	useFieldColumn,
	useFiltering,
} from "~/plugins/composables/tableHandler";
import { useMenu } from "~/plugins/composables/authority";
import { useKeyEvent } from "~/plugins/composables/eventHandler";

// Modeler
import { useDefaultFactory } from "~/system/modeler/plugins/composables/modeler-authority";

import { ACTION, USER, DEFAULT_SEQEUNCE } from "~/plugins/wfb-constants.js";
import { CELL_TYPE } from "~/constants/common_constants.js";

import * as COMMON from "~/api/common";

export default {
	name: "FormGrid",
	components: { ButtonFilter },
	props: {
		/* Grid */
		menuId: { type: String },
		metaDataId: { type: String },
		gridId: { type: String },
		gridTitle: { type: String },
		condition: {
			type: Object,
			default() {
				return {};
			},
		},
		searchCondition: {
			type: [Array, Object],
			default() {
				return [];
			},
		},
		isUsePath: { type: Boolean, default: true },
		isUseRefresh: { type: Boolean, default: true },
		isUseCreate: { type: Boolean, default: true },
		isUseModify: { type: Boolean, default: true },
		isUseDelete: { type: Boolean, default: true },

		/* Grid Option */
		checkbox: { type: Boolean, default: true },
		dragging: { type: Boolean, default: false },
		dropTargetId: { type: String },
		freezing: { type: Boolean, default: true },
		paging: { type: Boolean, default: true },
		deleting: { type: Boolean, default: false },
		adding: { type: Boolean, default: false },
		exporting: { type: Boolean, default: true },
		autoFit: { type: Boolean, default: true },

		/* Option */
		useMetaColumn: { type: Boolean, default: false },
		useAPI: { type: Boolean, default: false },
		initSearch: { type: Boolean, default: true },

		/* Custom */
		customItems: { type: Array },
		customSequence: { type: String },
		customPattern: { type: RegExp },
		canSelectBreadcrumb: { type: Boolean, default: false },
		needsDataState: { type: Boolean, default: true },
		needsDefaultFactory: { type: Boolean, default: false },

		/* API */
		customApi: { type: Function },
		createApi: { type: Function },
		modifyApi: { type: Function },
		deleteApi: { type: Function },
	},
	emits: [
		"refresh",
		"create",
		"modify",
		"delete",
		"changePosition",
		"clickParent",
		"onAfterBindData",
		"onCrossGridDrop",
		"onSelectionChanged",
		"onCheckBoxChange",
		"initGridItems",
		"fetchGridItems",
		"clickHoverCell",
		"changeNumericCell",
		"changeComboCell",
		"changeTextboxCell",
		"onRowClick",
	],
	setup(props, { emit }) {
		//==================== Common
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();
		const { toggleModalSuccess } = useModalSuccess();
		const { executeWithSpinner } = useSpinner();
		const {
			deepCloneItems,
			checkItemsEqual,
			sortItems,
			mergeItems,
			convertField,
		} = useItem();
		const { assignDataState, fetchList } = useFetchData();
		const { infoConfig } = useInformation();
		const { ID } = useColumnDef();

		//==================== Grid Info
		const { COLUMN_TEMPLATE } = useGrid();
		// GridId가 없을 경우, metaDataId를 default로 사용한다.
		const { menuId, metaDataId, gridId = metaDataId, gridTitle } = props;

		// Column
		const {
			// Grid
			gridColumns,
			fetchGridColumns,
			mergeGridConfig,

			// Meta
			metaColumns,
			fetchMetaColumns,
			mergeMetaConfig,
		} = useColumnDef();

		// Default Column
		const fieldColumns = computed(() =>
			props.useMetaColumn ? metaColumns.value : gridColumns.value,
		);

		const {
			// Field
			fields,
			assignFieldItem,

			// Sequence
			SEQUENCE,
			hasSequence,

			// KeyField
			keyFieldComparator,
			// createKeyItem,
			compareKeyField,
		} = useFields(fieldColumns, props.customSequence);

		const templateRef = ref(null);
		const gridName = ref(gridTitle ?? gridId ?? metaDataId);

		watch(
			() => props.gridTitle,
			value => {
				gridName.value = value;
			},
		);

		// Default Factory
		const { defaultFactory, hasDefaultFactory, assignDefaultFactory } =
			useDefaultFactory(props.needsDefaultFactory, fieldColumns);

		watch(
			() => defaultFactory.value,
			() => {
				if (hasDefaultFactory.value) {
					fetchGridItems(); // 데이터 새로 가져오기
				}
			},
		);

		// Path
		const paths = computed(() => {
			// Factory Path 설정
			const defaultPath = hasDefaultFactory.value
				? [defaultFactory.value]
				: [];
			const paths = Object.values(props.condition);

			return paths.every(path => path)
				? [...defaultPath, ...paths]
				: defaultPath;
		});
		const hasPath = computed(() => paths.value.length);

		// Data State
		const createdOnly = ref(true);
		const hasDataState = computed(
			() => props.needsDataState && fields.value.includes(ID.DATA_STATE),
		);

		// 토글 전환 이후, 그리드 데이터 바인딩
		watch(
			() => createdOnly.value,
			() => {
				setTimeout(() => initGridItems(), 100);
			},
		);

		// Row Click
		/**
		 * handle row click
		 * @param {Object} event
		 */
		function clickRow(event) {
			const { row, rowData, column } = event;
			selectionChanged(rowData);
			emit("onRowClick", event);

			// numeric cell 선택 시, input box fucus로 활성화함.
			if (column.cellType === CELL_TYPE.NUMERIC) {
				focusNumericCell(column, row.dataset.rowindex);
			}
		}

		/**
		 * 선택한 행의 정보 전송
		 * @param {Object} event
		 * @param {Object} event.rowData
		 */
		function selectionChanged(row = {}) {
			if (infoConfig.row !== row) {
				// Table Column 사용 여부에 따라 config 병합
				const information = mergeGridConfig({ row });
				emit("onSelectionChanged", information);
			}
		}

		function rowDoubleClick(e) {
			let selectRow = e.rowData;
			emit("onRowDoubleClick", selectRow);
		}

		function updateCheckItems() {
			emit("onCheckBoxChange", templateRef.value.getCheckItems());
		}

		//==================== Grid Filter; condition
		// Grid Column 기준으로 Filtering 수행
		const {
			filterConfig,
			filters,
			hasFilter: isUseFilter,
			isFiltering,
			// caseSensitive,
			toggleModalFilter,
			highlightFilterHeader,
			highlightFilterCell,
		} = useFiltering(gridColumns, props.condition);

		/**
		 * 조건 정의 및 데이터 초기화
		 */
		function filterGridItems() {
			initGridItems();
			highlightFilterHeader(templateRef);
		}

		/**
		 * 필터 및 그리드 새로고침
		 */
		function refreshGridItems() {
			// 필터 조건 초기화
			filterConfig.value = {};
			toggleModalFilter(false);

			fetchGridItems();
		}

		// 선행 조건 변경 시 초기화
		watch(
			() => props.condition,
			(newValue, oldValue) => {
				if (!checkItemsEqual(newValue, oldValue)) {
					refreshGridItems();
				}
			},
		);

		// 검색 조건 변경 시 초기화
		watch(() => props.searchCondition, refreshGridItems);

		// 그리드 데이터 변경 감지
		watch(
			() => props.customItems,
			() => {
				refreshGridItems();
			},
		);

		//Initialize columns on component mount
		onMounted(async () => {
			// useMetaColumn 여부에 따라 칼럼 가져오기
			if (props.useMetaColumn) {
				await fetchMetaColumns(metaDataId);
			}
			// Grid Column 초기화
			if (menuId && gridId) {
				await fetchGridColumns(menuId, gridId);
			} else if (props.useMetaColumn) {
				gridColumns.value = deepCloneItems(metaColumns.value);
			}

			selectionChanged();

			// 선행 조건 없을 경우 그리드 데이터 바인딩
			initGridItems();
		});
		watch(
			() => props.gridId,
			async value => {
				await fetchGridColumns(props.menuId, value);
				gridName.value = props.gridId;
			},
		);

		//==================== Grid Authority
		const { checkColumnModifiable } = useFieldColumn();

		const isModifiable = computed(
			() =>
				({ column }) =>
					checkColumnModifiable(column),
		);

		const isDraggable = computed(
			() => props.dragging || isCrossGridDrop.value,
		);

		//==================== Grid DropdownButton
		const { currentMenuItemAuthConfig } = useMenu();

		const actionItems = computed(() => {
			const { CREATE, MODIFY, DELETE, APPLY } = ACTION;
			return Object.keys(currentMenuItemAuthConfig.value).filter(
				key => ![CREATE, MODIFY, DELETE, APPLY].includes(key),
			);
		});

		const isUseAction = computed(() => actionItems.value.length > 0);

		function selectAction({ item }) {
			emit("selectAction", item.id);
		}

		//==================== Grid Data
		const gridItems = ref([]);
		const newItems = ref([]);
		const { updateState, modifyList } = useUpdateData();

		watch(
			() => updateState.metaDataId,
			newValue => {
				if (newValue === metaDataId) {
					initGridItems(updateState.items);
				}
			},
		);

		/**
		 * 그리드 및 information 초기화
		 * @param {Object|null} targetItems
		 */
		function initGridItems(targetItems = []) {
			gridItems.value = [];
			emit("initGridItems");

			setTimeout(() => {
				fetchGridItems(targetItems);
				// TargetItems의 가장 처음 값 할당 or 초기화
				selectionChanged(targetItems[0]);
			}, 100);
		}

		/**
		 * 그리드 데이터를 바인딩한다.
		 * @param {Object} targetItems
		 */
		function fetchGridItems(targetItems = []) {
			// Custom items 있을 경우
			if (props.customItems) {
				executeWithSpinner(
					() => setGridItems(props.customItems, targetItems),
					0,
				);
				return;
			}

			// Condition 재정의
			const params = {
				...props.searchCondition,
				...props.condition,
				...filterConfig.value,
			};
			const isConditionValid = Object.values(params).every(
				value => value,
			);

			if (!props.initSearch) {
				// Custom Query에서 params 가 빈 값이면 에러 발생하여 임시 처리함.
				if (Object.keys(params).length == 0) {
					setGridItems([]);
					return;
				}
			}

			// Default Factory 지정
			assignDefaultFactory(params);

			// Data State 지정
			if (hasDataState.value && createdOnly.value) {
				assignDataState(params);
			}

			const getBy = props.customApi ?? COMMON.getBy;

			executeWithSpinner(async () => {
				if (isConditionValid) {
					const { metaDataId, searchCondition } = props;
					const items = await fetchList(() =>
						getBy({ metaDataId, searchCondition, params }),
					);
					setGridItems(items, targetItems);
				} else {
					setGridItems([]);
				}
			}, 300);
		}

		/**
		 * @param {Object} items
		 * @param {Object[]|Object} target
		 */
		function setGridItems(items, target = []) {
			mergeItems(items);

			// Object일 경우 Array로 변환
			newItems.value = Array.isArray(target) ? target : [target];

			if (hasSequence.value) {
				// Sequence 기준 오름차순 정렬
				items.sort((a, b) => a[SEQUENCE] - b[SEQUENCE]);
			} else {
				// Sequence가 없으면 신규 아이템 우선 정렬함.
				items.sort((a, b) =>
					isItemNew(a) ? -!isItemNew(b) : +isItemNew(b),
				);
			}

			if (isUpperField(items)) {
				items = convertField(items, gridColumns);
			}
			nextTick(() => (gridItems.value = deepCloneItems(items)));
		}

		/**
		 * 아이템의 field가 uppercase인지 확인
		 * @param {Object} items
		 * @returns {Boolean}
		 */
		function isUpperField(items) {
			if (items.length > 0) {
				let firstField = Object.keys(items[0])[0];
				return /^[A-Z]/g.test(firstField);
			} else {
				return false;
			}
		}

		/**
		 * 아이템이 새로운 값인지 확인
		 * @param {Object} item
		 * @returns {Boolean}
		 */
		function isItemNew(item) {
			return newItems.value.some(newItem =>
				keyFieldComparator(item)(newItem),
			);
		}

		/**
		 * @returns {Object[]} 선택 아이템 복사본
		 */
		function cloneCheckItems() {
			const items = templateRef.value.getCheckItems();
			return deepCloneItems(items);
		}

		/**
		 * @returns {Object[]} 현재 페이지 아이템 복사본
		 */
		function cloneCurrentItems() {
			const items = templateRef.value.getCurrentItems();
			return deepCloneItems(items);
		}

		/**
		 * 인덱스 리스트에 해당하는 row 클릭
		 * @param {Number[]} rowIndexes
		 */
		function selectRows(rowIndexes) {
			templateRef.value.selectRows(rowIndexes);
		}

		//==================== Data Change
		const isCrossGridDrop = computed(
			() =>
				props.dragging &&
				props.dropTargetId &&
				gridName.value !== props.dropTargetId,
		);

		/**
		 * 포지션을 index 기준 정의하고, 그리드 데이터 할당
		 * @param {Object|Object[]|null} target
		 * @param {Object[]|null} customItems
		 */
		function changeSequence(target, customItems = gridItems.value) {
			if (!hasSequence.value) return;

			executeWithSpinner(async () => {
				const items = customItems.map((item, index) => ({
					...item,
					[SEQUENCE]: index + DEFAULT_SEQEUNCE,
				}));

				if (await validateChangeItems(items)) {
					setGridItems(items, target);
				}
			}, 100);
		}

		/**
		 * @param {Object} target
		 */
		function changeFlag(target) {
			executeWithSpinner(async () => {
				const item = assignFieldItem(target);
				const index = gridItems.value.findIndex(gridItem =>
					compareKeyField(gridItem, item),
				);

				if (await validateChangeItems([item])) {
					gridItems.value[index] = item;
				}
			});
		}

		/**
		 * @param {Object[]} items
		 * @returns {Promise<Boolean>}
		 */
		async function validateChangeItems(items) {
			const { length } = await modifyList(
				props.modifyApi,
				metaDataId,
				items,
				"",
				false,
			);
			// Modify 성공한 경우만 true
			if (length > 0) {
				return true;
			}

			// 실패 시, 리셋
			setGridItems(gridItems.value);
			return false;
		}

		//==================== Customization
		const { prependIcon, validateBadgeToCell } = useCustomization();
		const { prependImage } = useImage();

		const iconPattern = /(user|time)$/i;

		/**
		 * @param {Object} event
		 * @param {HTMLTableRowElement} event.row
		 * @param {Object} event.data
		 */
		function customizeRow({ row, data }) {
			row.classList.toggle("new-row", isItemNew(data));
		}

		/**
		 * @param {Object} event 이벤트 데이터
		 * @param {Object} event.data row 데이터
		 * @param {HTMLTableCellElement} event.cell
		 * @param {String|null} event.column.field
		 */
		function customizeCell({ data, cell, column: { field } }) {
			const value = data[field];
			if (!value) {
				return;
			}

			// Badge 변경
			if (validateBadgeToCell(cell, field, value)) {
				return;
			}

			// 필터 조건 표기
			highlightFilterCell(cell, field, value);

			// Icon 추가
			if (iconPattern.test(field)) {
				prependIcon(cell, field.match(iconPattern)[0].toLowerCase());
			}

			if (field === USER.ID) {
				prependImage(cell, data[USER.IMAGE]);
			}
		}

		//==================== Event
		/**
		 * 선택 아이템이 하나 이하인지 확인 후 생성 이벤트 전송
		 */
		function openModalCreate() {
			const checkItems = cloneCheckItems();
			if (checkItems.length > 1) {
				openModalWarning("warning.selectOneData");
				return;
			}

			toggleModalFilter(false);
			emit(
				"create",
				mergeMetaConfig({
					api: props.createApi,
					items: checkItems,
					menuId,
					metaDataId,
					gridId,
				}),
			);
		}

		/**
		 * 선택 아이템이 하나 이상인지 확인 후 수정 이벤트 전송
		 */
		function openModalModify() {
			const checkItems = cloneCheckItems();
			if (checkItems.length == 0) {
				openModalWarning("warning.selectData");
				return;
			}

			toggleModalFilter(false);
			emit(
				"modify",
				mergeMetaConfig({
					api: props.modifyApi,
					items: checkItems,
					menuId,
					metaDataId,
					gridId,
				}),
			);
		}

		/**
		 * 선택 아이템이 하나 이상인지 확인 후 삭제 이벤트 전송
		 */
		function openModalDelete() {
			const checkItems = cloneCheckItems();
			if (checkItems.length == 0) {
				openModalWarning("warning.selectData");
				return;
			}

			// 키 데이터만 전송 -> row 데이터 전체로 변경 (24.08.05)
			// const items = checkItems.map(item => createKeyItem(item));
			emit(
				"delete",
				mergeMetaConfig({
					api: props.deleteApi,
					items: checkItems,
					metaDataId,
				}),
			);
		}

		//==================== Numeric Box
		/**
		 * @param {Object} data
		 * @param {String} data.column.field
		 * @param {String} data.index
		 */
		function formatComponentId(type, { column: { field }, index }) {
			return `${type}` + `-${field}-${index}`;
		}

		/**
		 * @param {Object} data
		 * @param {Object} data.column
		 * @param {String} data.index
		 */
		function afterEnterNumericCell({ column, index }) {
			// 다음 row의 index에 포커싱하기 위해 숫자로 변경 후 1을 더함.
			focusNumericCell(column, Number(index) + 1);
		}

		/**
		 * @param {Object} column
		 * @param {String} index
		 */
		function focusNumericCell(column, index) {
			const $numericInput = document.getElementById(
				formatComponentId("numeric", { column, index }),
			);

			if ($numericInput) {
				// click한 후 focus해야 cell selection과 동기화됨.
				$numericInput.click();
				$numericInput.focus();
			}
		}

		function changeCell(value, eventName, data, index) {
			if (value) {
				// 변경된 row의 index 포함
				emit(eventName, {
					field: data.column.field,
					value,
					index,
					data,
				});
			}
			let existItems = this.gridItems.slice();
			existItems[index][data.column.field] = value;
		}

		onMounted(() => {
			// 그리드에 포커싱돼야 키이벤트 활성화
			const target = templateRef.value.gridTargetRef;
			const { KEY, defineButtonConfig, activateButtonEvent } =
				useKeyEvent();

			const buttonConfigs = [
				// 조회
				defineButtonConfig(KEY.FILTER, toggleModalFilter),
				defineButtonConfig(KEY.RESET, initGridItems),

				// 모달
				defineButtonConfig(KEY.CREATE, openModalCreate),
				defineButtonConfig(KEY.MODIFY, openModalModify),
				defineButtonConfig(KEY.DELETE, openModalDelete),
			];

			activateButtonEvent(target, buttonConfigs);
		});

		return {
			// Common
			executeWithSpinner,
			openModalInfo,
			openModalWarning,
			openModalError,
			toggleModalSuccess,

			// Grid Template
			COLUMN_TEMPLATE,
			templateRef,
			gridName,
			gridColumns,
			paths,
			hasPath,
			hasSequence,
			mergeMetaConfig,

			// Modeler Only
			createdOnly,
			hasDataState,

			// Click Row
			selectionChanged,
			clickRow,
			rowDoubleClick,

			// Grid Filter
			isUseFilter,
			filters,
			filterConfig,
			isFiltering,
			filterGridItems,
			toggleModalFilter,

			// Grid Authority
			isModifiable,
			isDraggable,

			// Grid ActionButton
			actionItems,
			isUseAction,
			selectAction,

			// Grid Field
			fields,
			keyFieldComparator,

			// Grid Items
			gridItems,
			initGridItems,
			fetchGridItems,
			setGridItems,
			isItemNew,
			cloneCheckItems,
			cloneCurrentItems,
			selectRows,
			sortItems,
			updateCheckItems,

			// Grid Change Data
			isCrossGridDrop,
			changeSequence,
			changeFlag,

			// Column Template
			formatComponentId,
			changeCell,

			// Numeric
			afterEnterNumericCell,

			// Customization
			customizeRow,
			customizeCell,

			// Event
			ACTION,
			openModalCreate,
			openModalModify,
			openModalDelete,
		};
	},
	methods: {
		//==================== Grid Template
		/**
		 * @param {Object} target
		 * @param {Number|null} forceIndex null이면 특정 인덱스가 없음을 의미
		 */
		onAfterDrop(target, forceIndex) {
			// 아이템 정렬
			if (Number.isInteger(forceIndex)) {
				// target을 첫 번째 위치로 배치할지
				const prioritized = forceIndex === 0;
				this.sortItems(
					this.gridItems,
					this.keyFieldComparator(target),
					prioritized,
				);
			}
			this.changeSequence(target);
		},

		/**
		 * @param {Object[]} targets
		 * @param {Number|null} forceIndex null이면 하단 드랍을 의미
		 */
		onAfterCrossDrop(targets, forceIndex) {
			this.$emit("onCrossGridDrop", targets, forceIndex);
		},
	},
};
</script>
<style scoped></style>
