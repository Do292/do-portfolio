<template>
	<GridTemplate
		ref="templateRef"
		:checkbox="checkbox"
		:columns="columns"
		:dragging="isDraggable"
		:dropTargetId="dropTargetId"
		:fields="fields"
		:freezing="freezing"
		:gridItems="gridItems"
		:gridName="gridName"
		:isCrossGridDrop="isCrossGridDrop"
		:paging="paging"
		@afterBindData="$emit('onAfterBindData')"
		@afterCrossDrop="onAfterCrossDrop"
		@afterDrop="onAfterDrop"
		@onQueryCellInfo="customizeCell"
		@onRecordClick="clickRow"
		@onRowDataBound="customizeRow"
	>
		<template v-slot:header-title>
			<label>
				{{ $t(gridName) }}
			</label>
			<slot name="grid-path">
				<BreadcrumbTemplate
					v-if="hasPath"
					:isSelectable="canSelectBreadcrumb"
					:items="paths"
				/>
			</slot>
		</template>
		<template v-slot:header-content>
			<div class="btn-group">
				<ButtonFilter v-if="hasFilter" @onFilter="filterGridItems" />
				<ButtonBasic type="refresh" @onClick="initGridItems()" />
			</div>
			<slot name="grid-button">
				<div class="btn-group">
					<ButtonBasic
						:needsAuthority="true"
						:type="ACTION.CREATE"
						class="text-green"
						@onClick="openModalCreate"
					/>
					<ButtonBasic
						:needsAuthority="true"
						:type="ACTION.MODIFY"
						@onClick="openModalModify"
					/>
					<ButtonBasic
						:needsAuthority="true"
						:type="ACTION.DELETE"
						class="text-red"
						@onClick="openModalDelete"
					/>
				</div>
			</slot>
			<div v-if="hasComboButton" class="btn-group">
				<ButtonCombo
					:items="comboButtonItems"
					:needsAuthority="true"
					@onSelect="selectComboButton"
				></ButtonCombo>
			</div>
		</template>
		<template v-slot:[COLUMN_TEMPLATE.SWITCH]="config">
			<SwitchFlag
				:config="config"
				:enabled="isModifiable"
				@onChange="changeFlag"
			/>
		</template>
	</GridTemplate>
</template>

<script>
import GridTemplate from "~/system/modeler/components/common/template/GridTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonFilter from "~/system/modeler/components/common/button/ButtonFilter";
import ButtonCombo from "~/system/modeler/components/common/button/ButtonCombo";

import SwitchFlag from "~/system/modeler/components/common/switch/SwitchFlag";

import { ref, computed, watch, onMounted, nextTick } from "vue";
import {
	useCustomization,
	useGrid,
} from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import {
	useModalAlert,
	useModalSuccess,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useSpinner,
	useInformation,
	useImage,
} from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useDefaultFactory } from "~/system/modeler/plugins/composables/modeler-authority";
import {
	useColumnDef,
	useFields,
	useFiltering,
} from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { useKeyEvent } from "~/system/modeler/plugins/composables/modeler-eventHandler";
import { useMenu } from "~/system/modeler/plugins/composables/modeler-authority";

import {
	ID,
	USER,
	ACTION,
	FLAG,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";

import * as COMMON from "~/system/modeler/api/modeler-common";

export default {
	name: "GridForm",
	components: {
		GridTemplate,
		BreadcrumbTemplate,
		ButtonBasic,
		ButtonFilter,
		ButtonCombo,
		SwitchFlag,
	},
	props: {
		/* Grid */
		menuId: { type: String },
		tableId: { type: String },
		gridId: { type: String },
		condition: {
			type: Object,
			default() {
				return {};
			},
		},

		/* Option */
		checkbox: { type: Boolean, default: true },
		dragging: { type: Boolean, default: false },
		dropTargetId: { type: String },
		freezing: { type: Boolean, default: true },
		paging: { type: Boolean, default: true },

		/* Custom */
		customId: { type: String },
		customItems: { type: Array },
		customPosition: { type: String, default: ID.POSITION },
		customPattern: { type: RegExp },
		canSelectBreadcrumb: { type: Boolean, default: false },

		needsComboButton: { type: Boolean, default: true },
		needsDataState: { type: Boolean, default: true },
		needsDefaultFactory: { type: Boolean, default: true },
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
		"clickComboButton",
	],
	setup(props, { emit }) {
		//==================== Common
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();
		const { toggleModalSuccess } = useModalSuccess();
		const { executeWithSpinner } = useSpinner();
		const { deepCloneItems, sortItems, checkItemsEqual, filterItem } =
			useItem();
		const { assignDataState, fetchList } = useFetchData();
		const { infoConfig } = useInformation();

		//==================== Grid Info
		const { COLUMN_TEMPLATE } = useGrid();
		const { menuId, tableId, gridId } = props;
		const { columns, metaColumns, fetchColumns, mergeTableConfig } =
			useColumnDef();
		const {
			// Field
			fields,
			assignFieldItem,

			// Position
			POSITION,
			hasPosition,

			// KeyField
			keyFieldComparator,
			createKeyItem,
			compareKeyField,
		} = useFields(metaColumns, props.customPosition);

		const templateRef = ref(null);
		const gridName = props.customId ?? gridId ?? tableId;

		// Default Factory
		const { defaultFactory, hasDefaultFactory, assignDefaultFactory } =
			useDefaultFactory(props.needsDefaultFactory, metaColumns);

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
			selectionChanged(event.rowData);
			emit("onRowClick", event);
		}

		/**
		 * 선택한 행의 정보 전송
		 * @param {Object|null} row
		 */
		function selectionChanged(row = {}) {
			if (infoConfig.row !== row) {
				const information = mergeTableConfig({ row });
				emit("onSelectionChanged", information);
			}
		}

		//==================== Grid Filter; condition
		const {
			filterConfig,
			filters,
			hasFilter,
			isFiltering,
			caseSensitive,
			toggleModalFilter,
			highlightFilterHeader,
			highlightFilterCell,
		} = useFiltering(columns, props.condition);

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

		watch(
			() => props.customItems,
			() => {
				refreshGridItems();
			},
		);

		//Initialize columns on component mount
		onMounted(async () => {
			await fetchColumns(tableId, menuId, gridId);
			selectionChanged();

			// 선행 조건 없을 경우 그리드 데이터 바인딩
			initGridItems();
		});

		//==================== Grid Authority
		const { currentMenuItemAuthConfig } = useMenu();

		const isModifiable = computed(
			() => currentMenuItemAuthConfig.value[ACTION.MODIFY] === FLAG.Y,
		);

		// filtering할 경우, sequence가 정확하지 않으므로 drag & drop 제한
		const isDraggable = computed(
			() =>
				(props.dragging && isModifiable.value && !isFiltering.value) ||
				isCrossGridDrop.value,
		);

		//==================== Grid ComboButton
		// TODO enum 설정
		const comboButtonItems = computed(() => {
			const { CREATE, MODIFY, DELETE, APPLY } = ACTION;
			return Object.keys(currentMenuItemAuthConfig.value).filter(
				key => ![CREATE, MODIFY, DELETE, APPLY].includes(key),
			);
		});

		const hasComboButton = computed(
			() => props.needsComboButton && comboButtonItems.value.length > 0,
		);

		/**
		 * @param {Object} event
		 * @param {Object} event.item
		 * @param {String} event.item.id
		 */
		function selectComboButton({ item: { id } }) {
			const items = cloneCheckItems();
			// 버튼 id로 이벤트를 전송한다.
			emit(id, items);
		}

		//==================== Grid Data
		const gridItems = ref([]);
		const newItems = ref([]);
		const { updateState, modifyList } = useUpdateData();

		watch(
			() => updateState.tableId,
			newValue => {
				if (newValue === tableId) {
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
			emit("init", targetItems);

			// Table Id 검증
			if (!props.tableId) {
				return;
			}

			// 생성/수정 데이터 표기 안 될 땐 delay 조정!
			setTimeout(() => {
				fetchGridItems(targetItems);
				// TargetItems의 가장 처음 값 할당 or 초기화
				selectionChanged(targetItems[0]);
			}, 200);
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
			const params = { ...props.condition, ...filterConfig.value };
			const isConditionValid = Object.values(params).every(
				value => value,
			);

			// Default Factory 지정
			assignDefaultFactory(params);

			// Data State 지정
			if (hasDataState.value && createdOnly.value) {
				assignDataState(params);
			}

			const getBy = isFiltering.value ? COMMON.filterBy : COMMON.getBy;
			executeWithSpinner(async () => {
				if (isConditionValid) {
					const items = await fetchList(() =>
						getBy(props.tableId, params, caseSensitive.value),
					);
					setGridItems(items, targetItems);
				} else {
					setGridItems([]);
				}
			}, 500);
		}

		/**
		 * @param {Object} items
		 * @param {Object} target
		 */
		function setGridItems(items, target = {}) {
			newItems.value = Array.isArray(target) ? target : [target];

			if (hasPosition.value) {
				// 포지션 기준 오름차순 정렬
				items.sort((a, b) => a[POSITION] - b[POSITION]);
			} else {
				// 포지션이 없으면 신규 아이템 우선 정렬함.
				items.sort((a, b) =>
					isItemNew(a) ? -!isItemNew(b) : +isItemNew(b),
				);
			}

			// 그리드 리셋 후 아이템 바인딩
			nextTick(() => (gridItems.value = deepCloneItems(items)));
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
				gridName !== props.dropTargetId,
		);

		/**
		 * 포지션을 index 기준 정의하고, 그리드 데이터 할당
		 * @param {Object|Object[]|null} target
		 * @param {Object[]|null} customItems
		 */
		function changePosition(target, customItems = gridItems.value) {
			if (!hasPosition.value) return;

			executeWithSpinner(async () => {
				const items = customItems.map((item, index) => ({
					...item,
					[POSITION]: index + DEFAULT_POSITION,
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
				const index = gridItems.value.findIndex(gridItem =>
					compareKeyField(gridItem, target),
				);

				if (await validateChangeItems([target])) {
					gridItems.value[index] = target;
					// CustomItems 사용하는 경우 상위 컴포넌트에서 감지하기 위함.
					emit("onChangeFlag", index, target);
				}
			});
		}

		/**
		 * @param {Object[]} items
		 * @returns {Promise<Boolean>}
		 */
		async function validateChangeItems(items) {
			const { length } = await modifyList(
				tableId,
				items.map(assignFieldItem),
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
			const value = `${data[field] ?? ""}`;
			if (!value) {
				return;
			}

			// Badge 변경
			if (validateBadgeToCell(cell, field, value, props.customPattern)) {
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
			emit("create", mergeTableConfig({ items: checkItems }));
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
			emit("modify", mergeTableConfig({ items: checkItems }));
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

			// 키 데이터만 전송
			const items = checkItems.map(item => createKeyItem(item));
			emit("delete", mergeTableConfig({ items }));
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
			columns,
			paths,
			hasPath,
			createdOnly,
			hasDataState,
			hasPosition,
			mergeTableConfig,

			// Click Row
			clickRow,
			selectionChanged,

			// Grid Filter
			hasFilter,
			filters,
			filterConfig,
			isFiltering,
			filterGridItems,
			toggleModalFilter,

			// Grid Authority
			isModifiable,
			isDraggable,

			// Grid ComboButton
			comboButtonItems,
			hasComboButton,
			selectComboButton,

			// Grid Field
			POSITION,
			fields,
			keyFieldComparator,
			assignFieldItem,
			createKeyItem,
			compareKeyField,
			filterItem,

			// Grid Items
			gridItems,
			newItems,
			initGridItems,
			setGridItems,
			isItemNew,
			cloneCheckItems,
			cloneCurrentItems,
			selectRows,
			sortItems,

			// Grid Change Data
			isCrossGridDrop,
			changePosition,
			changeFlag,

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
			this.changePosition(target);
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
<style scoped>
/* Grid */
:deep(.e-row.new-row) {
	background: #bfedc7;
}
:deep(.e-gridcontent) {
	height: calc(100vh - 276px);
}

/* Grid Header */
.grid-form :deep(.item-title label) {
	white-space: nowrap !important;
}
.grid-form :deep(.item-title span.text-info01) {
	z-index: 1;
	white-space: nowrap;
	overflow: visible;
	transform: translateY(-12px);
}
</style>
