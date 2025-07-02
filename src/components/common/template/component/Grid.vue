<template>
	<div class="grid-form">
		<div class="row">
			<slot name="header">
				<div class="col-6 item-title">
					<!-- Custom Title -->
					<slot name="header-title">
						<label data-test="grid-title">
							{{ $t(gridName) }}
						</label>
					</slot>
				</div>
				<div class="col-6 text-right mt-2">
					<div class="item-box right-space">
						<!-- Custom Button -->
						<slot name="header-content"></slot>
					</div>
					<div class="excel-box">
						<input
							id="gridImportFile"
							ref="importRef"
							accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.macroEnabled.12"
							class="form-control"
							type="file"
							@change="importExcel"
						/>
						<div class="btn-group">
							<button
								v-if="importing"
								class="btn btn-md btn-default excel"
								@click="importExcel"
							>
								<label
									class="mb-0"
									for="gridImportFile"
									title="Import Excel"
								>
									<i class="aim aimcons_excel"></i>
									<i class="aim aimcons_input_1"></i>
								</label>
							</button>
							<button
								v-if="exporting"
								class="btn btn-md btn-default excel"
								title="Export Excel"
								@click="exportExcel"
							>
								<i class="aim aimcons_excel"></i>
								<i class="aim aimcons_output"></i>
							</button>
						</div>
					</div>
				</div>
			</slot>
		</div>
		<wfl-gridbasic
			:id="gridId"
			ref="gridRef"
			:allowExcelExport="exporting"
			:allowFiltering="filtering"
			:allowPaging="paging"
			:allowReordering="reordering"
			:allowResizing="resizing"
			:allowRowDragAndDrop="dragging"
			:allowSelection="selecting"
			:allowSorting="sorting"
			:allowTextWrap="!autoFit"
			:class="{ 'cross-draggable': isCrossGridDrop }"
			:clipMode="clipMode"
			:dataSource="gridItems"
			:editSettings="editSetting"
			:excelQueryCellInfo="excelQueryCellInfo"
			:filterSettings="filterSetting"
			:pageSettings="pageSetting"
			:rowDropSettings="dropSetting"
			:selectedRowIndex="selectedRowIndex"
			:selectionSettings="selectionSetting"
			@actionComplete="$emit('onActionComplete', $event)"
			@checkBoxChange="$emit('onCheckBoxChange', $event)"
			@commandClick="handleCommand"
			@dataBound="afterBindData"
			@headerCellInfo="$emit('onHeaderCellInfo', $event)"
			@queryCellInfo="$emit('onQueryCellInfo', $event)"
			@recordClick="clickRow"
			@recordDoubleClick="$emit('onRecordDoubleClick', $event)"
			@rowDataBound="$emit('onRowDataBound', $event)"
			@rowDragStartHelper="beforeDragRow"
			@rowDrop="dropRow"
		>
			<wfl-columns>
				<wfl-column
					v-if="deleting"
					v-bind="FROZEN_CONFIG"
					:commands="commands"
					textAlign="center"
					width="35"
				/>
				<wfl-column
					v-if="checkbox"
					v-bind="FROZEN_CONFIG"
					type="checkbox"
					width="50"
				/>
				<!-- freezing 에러 보정; 기본 칼럼 없으면 바인딩 제대로 안 됨. -->
				<wfl-column
					v-else-if="freezing"
					v-bind="FROZEN_CONFIG"
					:visible="false"
				/>
				<wfl-column
					v-for="column in gridColumns"
					:key="column.field"
					v-bind="column"
				/>
			</wfl-columns>

			<!-- Column/Header Template: 상위 컴포넌트에서 재정의 가능 -->
			<template
				v-for="template in gridTemplates"
				:key="template.getKey()"
				v-slot:[template.getKey()]="{ data }"
			>
				<slot :name="template.getKey()" v-bind="data">
					{{ template.getValueBy(data) }}
				</slot>
			</template>
		</wfl-gridbasic>
	</div>
</template>

<script>
import * as XLSX from "xlsx";

import { ref, toRef, readonly, computed, watch, nextTick } from "vue";
import { useItem } from "~/plugins/composables/dataHandler";
import {
	useColumnDef,
	useFieldColumn,
} from "~/plugins/composables/tableHandler";
import {
	useCustomization,
	useGrid,
} from "~/plugins/composables/syncfusionHelper";
import { FLAG } from "~/plugins/wfb-constants.js";

import { useSystem } from "~/plugins/composables/authority.js";
import { UPPER_ID, CAMEL_ID } from "~/constants/common_constants.js";

export default {
	name: "Grid",
	props: {
		// Grid Info
		gridName: { type: String, required: true },
		gridId: { type: String, required: true },
		columns: {
			type: Array,
			default() {
				return [];
			},
		},
		fields: {
			type: Array,
			default() {
				return [];
			},
		},
		gridItems: {
			type: Array,
			default() {
				return [];
			},
		},

		//Grid Option
		filtering: { type: Boolean, default: true },
		freezing: { type: Boolean, default: false },
		paging: { type: Boolean, default: true },
		reordering: { type: Boolean, default: true },
		resizing: { type: Boolean, default: true },
		sorting: { type: Boolean, default: true },

		//Selection
		selecting: { type: Boolean, default: true },
		selectionType: { type: String },
		selectedRowIndex: { type: Number },

		//Excel
		excelQueryCellInfo: { type: Function },
		exporting: { type: Boolean, default: true },
		importing: { type: Boolean, default: false },

		//Column Option
		autoFit: { type: Boolean, default: true },
		checkbox: { type: Boolean, default: true },
		deleting: { type: Boolean, default: false },
		adding: { type: Boolean, default: false },
		clipMode: { type: String, default: "EllipsisWithTooltip" },

		//Drag Option
		dragging: { type: Boolean, default: false },
		dropTargetId: { type: String },
		isCrossGridDrop: { type: Boolean, default: false },
	},
	emits: [
		"afterChangeFlag",
		"afterBindData",
		"afterDelete",
		"afterDrop",
		"afterCrossDrop",
		"onActionComplete",
		"onCheckBoxChange",
		"onHeaderCellInfo",
		"onImport",
		"onRecordClick",
		"onRecordDoubleClick",
		"onRowDataBound",
		"onRowDragStart",
		"onRowDrop",
		"onQueryCellInfo",
	],
	setup(props, { emit }) {
		const { systemInfo } = useSystem();
		const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;
		//==================== Common
		const { deepCloneItems, sortItems } = useItem();

		//==================== Grid Column
		const columns = toRef(props, "columns");
		const { checkColumnPrimary } = useFieldColumn();

		// frozen column
		const { FROZEN_CONFIG } = useColumnDef();

		const gridColumns = computed(() => {
			const isFreezing = column => column[ID.FIXING_FLAG] === FLAG.Y;
			return columns.value.map(column =>
				isFreezing(column) ? { ...column, ...FROZEN_CONFIG } : column,
			);
		});

		// Column Template
		const { columnTemplates, headerTemplates } = useGrid();
		const gridTemplates = computed(() => [
			...columnTemplates.value,
			...headerTemplates.value,
		]);

		/**
		 * @param {String} field
		 * @returns {HTMLTableColElement}
		 */
		function getHeaderByField(field) {
			return gridRef.value.getColumnHeaderByField(field);
		}

		/**
		 * 컬럼의 너비 자동으로 조절(freeze 과정에서 autoFit 풀림 방지)
		 */
		function afterBindData() {
			if (props.autoFit) {
				gridRef.value.autoFitColumns();
			}
			emit("afterBindData");

			// Width
			correctColumnWidthsForDraggable();
		}

		/**
		 * 그리드 헤더 새로고침
		 */
		function refreshHeader() {
			gridRef.value.refreshHeader();
		}

		//==================== Grid Data
		const gridRef = ref(null);

		/**
		 * 현재 페이지 데이터 반환
		 * @returns {Object[]}
		 */
		function getCurrentItems() {
			return gridRef.value.getCurrentViewRecords();
		}

		/**
		 * 체크 박스가 선택된 rowData 반환
		 * @returns {Object[]}
		 */
		function getCheckItems() {
			return gridRef.value.getSelectedRecords();
		}

		/**
		 * 체크 박스가 선택된 rowData의 index 반환
		 * @returns {Object[]}
		 */
		function getSelectedRowIndexes() {
			return gridRef.value.getSelectedRowIndexes();
		}

		watch(
			() => props.gridItems.length,
			length => {
				if (!length) {
					// 이전 데이터가 그리드에 남아있는 경우가 있어서 보완함.
					setTimeout(() => {
						gridRef.value.refresh();
					}, 10);
				}
			},
		);

		//==================== Grid Row
		const {
			GRID_SELECTOR,
			GRID_TAG,
			findElementsByTagInSelector,
			toggleClass,
		} = useCustomization();

		const focusedIndex = ref(-1);
		const FOCUS_ROW = "focus-row";

		/**
		 * 클릭한 행에 이벤트 적용
		 * @param {Object} event
		 * @param {Number} rowIndex
		 */
		function clickRow({ rowIndex, ...config }) {
			emit("onRecordClick", config);
			focusRowByIndex(rowIndex);
		}

		/**
		 * 인덱스 리스트에 해당하는 row 클릭
		 * @param {Number[]} rowIndexes
		 */
		function selectRows(rowIndexes) {
			gridRef.value.selectRows(rowIndexes);
		}
		/**
		 * 선택된 row,cell clear
		 */
		function clearSelection() {
			gridRef.value.clearSelection();
		}

		/**
		 * 인덱스 기준으로 행에 click css 토글
		 * @param {Number|null} index
		 */
		function focusRowByIndex(index = -1) {
			// index 확인
			if (index < 0) return;

			// 기존 Row css 제거
			if (focusedIndex.value > -1) {
				const $oldRows = getRowsByIndex(focusedIndex.value);
				toggleClass($oldRows, FOCUS_ROW, false);
			}

			// 새로운 행에 css 추가
			const $newRows = getRowsByIndex(index);
			toggleClass($newRows, FOCUS_ROW, true);

			focusedIndex.value = index;
		}

		/**
		 * 지정된 인덱스에 해당하는 행 반환
		 * @param {Number} index
		 * @returns {HTMLTableRowElement[]}
		 */
		function getRowsByIndex(index) {
			const $rows = [];
			const $row = gridRef.value.getRowByIndex(index);
			const $movableRow = gridRef.value.getMovableRowByIndex(index);

			if ($row) $rows.push($row);
			if ($movableRow) $rows.push($movableRow);

			return $rows;
		}

		//==================== Command
		const COMMAND_TYPE = readonly({
			DELETE: "Delete",
			EDIT: "Edit",
			SAVE: "Save",
			CANCEL: "Cancel",
		});

		/** @todo delete 외 type 사용 시, 보완 필요 */
		const commands = [createCommand(COMMAND_TYPE.DELETE)];
		const editSetting = {
			allowAdding: props.adding,
			allowDeleting: props.deleting,
			mode: "Normal",
		};

		/**
		 * @param {String} type Delete/Edit/Save/Cancel
		 * @returns {Object} syncfusion 커맨드 형식
		 */
		function createCommand(type) {
			const iconCss = `e-icons e-${type.toLowerCase()}`;
			const cssClass = "e-flat";
			return { type, buttonOption: { iconCss, cssClass } };
		}

		/**
		 * 커맨드에 따라 그리드 데이터 조작
		 * @param {Object} event
		 * @param {Object} event.commandColumn 선택된 커맨드
		 * @param {Object} event.commandColumn.type Delete|Edit|Save|Cancel
		 * @param {Object} event.rowData 해당 행 정보
		 */
		function handleCommand({ commandColumn: { type }, rowData }) {
			const event = `after${type}`; // afterDelete
			nextTick(() => emit(event, rowData));
		}

		//==================== Drag & Drop
		const DRAG_LINE = "dragging";

		const dropTarget = ref(props.dropTargetId ?? props.gridId);
		const dropSetting = ref({ targetID: props.dropTargetId });

		/**
		 * syncfusion에서 지원하는 drag button이 생성되는 경우, 칼럼의 너비가 한 칸씩 앞당겨 지정되어 이를 보정함.
		 */
		function correctColumnWidthsForDraggable() {
			if (!props.dragging) return;

			const findColumns = selector =>
				findElementsByTagInSelector(
					gridRef.value.$el,
					selector,
					GRID_TAG.COLUMN,
				);

			const $headers = findColumns(GRID_SELECTOR.MOVABLE_HEADER);
			const $contents = findColumns(GRID_SELECTOR.MOVABLE_CONTENT);

			// 첫 번째 헤더 칼럼은 마지막 칼럼의 너비로 지정
			$headers.forEach((column, index) => {
				const target =
					index === 0 ? $contents.at(-1) : $contents[index - 1];
				column.style.width = target.style.width;
			});

			// Content 칼럼 보정
			$contents.forEach((column, index) => {
				column.style.width = $headers[index].style.width;
			});
		}

		//==================== Excel
		const importRef = ref(null);

		/**
		 * excel export; cell custom은 excelQueryCellInfo에 정의
		 */
		function exportExcel() {
			const fileName = `${props.gridName}.xlsx`;
			// pk 우선 정렬
			const columns = sortItems(
				deepCloneItems(gridColumns.value),
				checkColumnPrimary,
			);
			columns.forEach(column => (column.headerText = column.field));

			const excelProperties = {
				fileName,
				columns,
				dataSource: props.gridItems,
				includeHiddenColumn: true,
				enableFilter: true, // 헤더 필터 옵션
			};
			gridRef.value.excelExport(excelProperties);
		}

		/**
		 * 그리드 데이터 바인딩을 위해 import 파일 검증 후 이벤트 전송
		 * @param {Object} event
		 * @param {Object} event.target
		 */
		function importExcel({ target }) {
			const file = importRef.value.files[0];
			if (!file) {
				return;
			}

			const reader = new FileReader();
			reader.onload = ({ target: { result } }) => {
				const data = new Uint8Array(result);
				const { Sheets } = XLSX.read(data, { type: "array" });

				const rowItems = Object.values(Sheets).flatMap(sheet => {
					const [headers, ...rows] = XLSX.utils.sheet_to_json(sheet, {
						header: 1,
					});

					// cell이 모두 비어있는 row 제외
					return rows
						.filter(row => row.some(cell => cell))
						.map(row =>
							headers.reduce((acc, cur, index) => {
								acc[cur] = row[index];
								return acc;
							}, {}),
						);
				});

				emit("onImport", rowItems);
			};
			reader.readAsArrayBuffer(file);
			target.value = ""; // target 초기화 안 하면, 재실행 시 이전 값 참조
		}

		return {
			// Common
			deepCloneItems,
			sortItems,

			// Grid Column
			FROZEN_CONFIG,
			gridTemplates,
			gridColumns,
			checkColumnPrimary,
			getHeaderByField,
			afterBindData,
			refreshHeader,

			// Grid Data
			gridRef,
			getCurrentItems,
			getCheckItems,
			getSelectedRowIndexes,

			// Grid Row
			GRID_SELECTOR,
			clickRow,
			focusRowByIndex,
			getRowsByIndex,
			selectRows,
			clearSelection,

			// Grid Event
			toggleClass,

			// Command
			commands,
			editSetting,
			handleCommand,

			// Drag & Drop
			DRAG_LINE,
			dropTarget,
			dropSetting,
			correctColumnWidthsForDraggable,

			// Excel
			importRef,
			exportExcel,
			importExcel,
		};
	},
	data() {
		return {
			filterSetting: { type: "Excel" },
			pageSetting: {
				pageSize: 50,
				pageSizes: [50, 100, 500, 1000],
				pageCount: 5,
			},
			selectionSetting: {
				type: this.selectionType,
				mode: "Row",
				checkboxOnly: this.checkbox,
			},
		};
	},
	methods: {
		//==================== Drag & Drop
		/**
		 * 드래그 시작 전 검증
		 * @param {Object} event
		 */
		beforeDragRow(event) {
			const { data, cloneElement: $row } = event;
			const { DRAG_LINE, GRID_SELECTOR } = this;

			// 2개 이상 선택 시 경고
			if (!this.isCrossGridDrop && data.length > 1) {
				event.cancel = true;
				console.log("Please select an one data.");
				// this.openModalWarning("warning.selectOneData");
				return;
			}

			const $target = document.getElementById(this.dropTarget);
			const $tables = $target.querySelectorAll(GRID_SELECTOR.TABLE);
			const { left, bottom } = $tables[0].getBoundingClientRect();

			// 그리드 여백으로 마우스 이동시 border, 처리
			const toggleDragLine = ({ x, y }) =>
				this.toggleClass($tables, DRAG_LINE, x > left && y > bottom);

			// table border bottom 제거
			const removeDragLine = () =>
				this.toggleClass($tables, DRAG_LINE, false);

			$target.addEventListener("mouseleave", removeDragLine);
			$row.addEventListener("mousemove", toggleDragLine);

			// 타겟 이벤트 리스너 제거
			$row.addEventListener("mouseup", () => {
				removeDragLine();
				$target.removeEventListener("mouseleave", removeDragLine);
			});
		},

		/**
		 * @param {Object} event
		 * @param {Object} event.target
		 */
		dropRow(event) {
			const { target } = event;

			// DropTarget이 아닌 경우 drop 이벤트 취소
			if (!target.closest("#" + this.dropTarget)) {
				event.cancel = true;
				return;
			}

			if (this.isCrossGridDrop) {
				this.dropRowInCrossGrid(event);
			} else {
				this.dropRowWithinGrid(event);
			}
		},

		/**
		 * @param {Object} event
		 * @param {Number} event.dropIndex
		 * @param {Object[]} event.data
		 * @param {Function} isTargetValid
		 */
		dropRowInCrossGrid(event) {
			const { target, dropIndex, data } = event;

			let forceIndex;
			if (Number.isNaN(dropIndex)) {
				// 상단 드랍; 헤더에 드랍할 경우, dropIndex가 NaN
				forceIndex = 0;
			} else if (!target.closest("TD")) {
				// 하단 드랍; 본인 혹은 부모 요소 중에 TD 태그가 없으면 테이블 외 드랍으로 간주
				forceIndex = null;
			} else {
				forceIndex = dropIndex;
			}

			// drop 후 데이터 추가 및 정렬
			this.$nextTick(() =>
				this.$emit("afterCrossDrop", data, forceIndex),
			);
		},

		/**
		 * @param {Object} event
		 * @param {Number} event.dropIndex
		 * @param {Object[]} event.data
		 * @param {Function} isTargetValid
		 */
		dropRowWithinGrid(event) {
			const { target, dropIndex, data } = event;

			let forceIndex;
			if (Number.isNaN(dropIndex)) {
				// 상단 드랍; 헤더에 드랍할 경우, dropIndex가 NaN
				forceIndex = 0;
			} else if (!target.closest("TD")) {
				// 하단 드랍; 본인 혹은 부모 요소 중에 TD 태그가 없으면 테이블 외 드랍으로 간주
				forceIndex = this.gridItems.length - 1;
			}

			// drop 후 데이터 정렬
			this.$nextTick(() =>
				this.$emit("afterDrop", data[0], forceIndex, dropIndex),
			);
		},
	},
};
</script>
<style scoped></style>
