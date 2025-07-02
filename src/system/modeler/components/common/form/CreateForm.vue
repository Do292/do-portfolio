<template>
	<div class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<div class="item-title ml-1">
						<label>
							<span @click="$emit('close')">
								{{ $t(tableId) }}
							</span>
						</label>
						<BreadcrumbTemplate :items="[$t(ACTION.CREATE)]" />
					</div>
					<div class="left-area ml-1">
						<PanelTemplate :panelConfig="panelConfig">
							<template v-slot:item="item">
								<InputField
									ref="inputRef"
									v-model="newItem[item.field]"
									:fieldConfig="item"
									:isDisabled="checkColumnDisabled(item)"
									:tableId="configTableId"
									:target="newItem"
									floatLabelType="Always"
									@click="initGenerator"
									@keyup.enter="nextGenerator"
								/>
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
							<ButtonBasic type="addData" @onClick="addData">
								Add Data
							</ButtonBasic>
						</div>
					</div>
				</template>
				<template v-slot:right>
					<GridTemplate
						ref="gridRef"
						:checkbox="false"
						:columns="columns"
						:deleting="true"
						:dragging="hasPosition"
						:freezing="true"
						:gridItems="gridItems"
						:gridName="tableId"
						:importing="true"
						:selecting="false"
						@afterDelete="updatePositionAfterDelete"
						@afterDrop="updatePositionAfterDrop"
						@onImport="importData"
						@onQueryCellInfo="customizeCell"
					>
						<template v-slot:header-title>
							<!-- Header Title 제거 -->
							<span></span>
						</template>
						<template v-slot:header-content>
							<div class="btn-group">
								<ButtonText
									type="apply"
									@onClick="openModalConfirm()"
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
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import PanelTemplate from "~/system/modeler/components/common/template/PanelTemplate";
import GridTemplate from "~/system/modeler/components/common/template/GridTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import InputField from "~/system/modeler/components/common/input/InputField";

import { ref, computed, watchPostEffect, onMounted } from "vue";
import {
	useModalAlert,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useItem,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useColumnDef,
	useFields,
	useFieldColumn,
} from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { useDefaultFactory } from "~/system/modeler/plugins/composables/modeler-authority";
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
	name: "CreateForm",
	components: {
		// Template
		BreadcrumbTemplate,
		PanelTemplate,
		GridTemplate,

		// Basic Component
		ButtonBasic,
		ButtonText,
		InputField,
	},
	props: {
		// CreateConfig
		tableId: { type: String },
		items: { type: Array },
		readOnlyConfig: {
			type: Object,
			default() {
				return {};
			},
		},

		// Custom
		customPosition: { type: String },
		shouldDelegate: { type: Boolean, default: false },
		needsDefaultFactory: { type: Boolean, default: true },
	},
	emits: ["apply", "close", "create"],
	setup(props, { emit }) {
		//==================== Config
		const { executeWithSpinner } = useSpinner();
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();
		const { openModalConfirmBy } = useModalConfirm();
		const { createList } = useUpdateData();

		const configTableId = ref(
			props.readOnlyConfig[ID.META_ID] ||
				props.readOnlyConfig[ID.TABLE_ID],
		);

		/**
		 * Confirm 모달 활성화
		 */
		function openModalConfirm() {
			if (props.shouldDelegate) {
				emit("create", deepCloneItems(gridItems.value));
				return;
			}

			openModalConfirmBy(
				ACTION.CREATE,
				props.tableId,
				gridItems.value,
				createData,
			);
		}

		//==================== Grid
		const gridItems = ref([]);
		const gridRef = ref(null);
		const { columns, fetchMetaColumns } = useColumnDef();

		/**
		 * @param {Number} index
		 */
		function loadAndfocusRowByIndex(index) {
			const LOAD_TIME = 50;

			executeWithSpinner(() =>
				setTimeout(() => {
					gridRef.value.focusRowByIndex(index);
				}, LOAD_TIME),
			);
		}

		//==================== Field
		const {
			// Field
			fields,
			findColumnByField,
			assignFieldItem,

			// Position
			POSITION,
			hasPosition,

			// Key Field
			keyFieldComparator,
			compareKeyField,
		} = useFields(columns, props.customPosition);

		const { deepCloneItems, createItem, sortItems } = useItem();
		const { checkColumnRequired, checkColumnPrimary, checkColumnVisible } =
			useFieldColumn();

		// Field Item
		const orgItem = ref({});
		const newItem = ref({});

		// Panel; ColumnType으로 필드 분리하되, pk는 별도
		const panelConfig = computed(() =>
			columns.value.filter(checkColumnVisible).reduce(
				(acc, cur) => {
					const key = checkColumnPrimary(cur)
						? COLUMN_TYPE.KEY
						: cur[ID.COLUMN_TYPE] ?? COLUMN_TYPE.STANDARD;

					if (!acc[key]) {
						acc[key] = [];
					}
					acc[key].push(cur);
					return acc;
				},
				{ [COLUMN_TYPE.KEY]: [] },
			),
		);

		// Default Factory
		const { assignDefaultFactory } = useDefaultFactory(
			props.needsDefaultFactory,
			columns,
		);

		onMounted(async () => {
			// 칼럼 바인딩
			await fetchMetaColumns(props.tableId);

			const defaultItem = createItem(fields.value, key => {
				const column = findColumnByField(key);
				return column[ID.DEFAULT_VALUE];
			});
			// DefaultFactory 설정
			assignDefaultFactory(defaultItem);

			const checkItem = props.items[0] ?? {};

			//readOnly > default > checkItem
			orgItem.value = assignFieldItem(props.readOnlyConfig, defaultItem);
			newItem.value = assignFieldItem(orgItem.value, checkItem);
		});

		//==================== Position
		/**
		 * 선택한 아이템을 그리드에서 삭제한다.
		 * @param {Object} item
		 */
		function updatePositionAfterDelete(deletedItem) {
			if (!hasPosition.value) return;

			const deletedPosition = deletedItem[POSITION];
			gridItems.value
				.filter(item => item[POSITION] > deletedPosition)
				.forEach(item => item[POSITION]--);

			setPositionValue(-1);
		}

		/**
		 * @param {Object} dropItem
		 * @param {Number|null} forceIndex null이면 특정 인덱스가 없음을 의미
		 */
		function updatePositionAfterDrop(dropItem, forceIndex, dropIndex) {
			const items = gridItems.value;

			// 아이템 정렬
			if (Number.isInteger(forceIndex)) {
				// target을 첫 번째 위치로 배치할지
				const prioritized = forceIndex === 0;
				sortItems(items, keyFieldComparator(dropItem), prioritized);
			}

			updatePositionAndSetGridItems(items);
			loadAndfocusRowByIndex(forceIndex ?? dropIndex);
		}

		/**
		 * 포지션 수정 후 grid 데이터 바인딩
		 * @param {Object[]} items
		 */
		function updatePositionAndSetGridItems(items) {
			let position = orgItem.value[POSITION] - gridItems.value.length;
			items.forEach(item => (item[POSITION] = position++));

			gridItems.value = deepCloneItems(items);
		}

		/**
		 * position 기준 값 증감
		 * @param {Number|null} increment default 1
		 */
		function setPositionValue(increment = 1) {
			const position = +orgItem.value[POSITION] + increment;
			newItem.value[POSITION] = position;
			orgItem.value[POSITION] = position;
		}

		//==================== Custom
		/**
		 * @param {Object} event
		 * @param {HTMLTableCellElement} event.cell
		 * @param {Object} event.column
		 * @param {String} event.column.field
		 */
		function customizeCell({ cell, column: { field } }) {
			// field가 password면 *로 변경
			if (field === ID.PASSWORD) {
				cell.textContent = "*".repeat(cell.textContent.length);
			}
		}

		//==================== Event
		const { activateApplyEvent, activateUpdateEvent, activateResetEvent } =
			useKeyEvent();

		// F2로 create 수행
		activateApplyEvent(window, () => openModalConfirm(gridItems.value));

		// F3로 addData
		activateUpdateEvent(window, addData);

		// ESC키로 리셋
		activateResetEvent(window, resetData);

		/**
		 * 데이터 생성 후 모달 닫기
		 */
		async function createData(comment) {
			const { length } = await createList(
				props.tableId,
				gridItems.value,
				comment,
			);

			// 성공 데이터가 있는 경우에만 모달 닫기
			if (length > 0) {
				emit("close");
			}
		}

		/**
		 * orgItem 값을 newItem에 할당
		 */
		function resetData() {
			for (const field of fields.value) {
				newItem.value[field] = orgItem.value[field];
			}
		}

		/**
		 * newItem을 검증 후 그리드에 추가한다.
		 */
		async function addData() {
			const isItemValid =
				validateEmptyFields(newItem.value) &&
				validateDuplicates(newItem.value);

			if (isItemValid) {
				const [item] = deepCloneItems([newItem.value]);
				// 재할당하여 데이터 바인딩
				gridItems.value = [...gridItems.value, item];
				loadAndfocusRowByIndex(gridItems.value.length - 1);

				if (hasPosition.value) {
					setPositionValue();
				}
			}
		}

		/**
		 * 필수 값에 대한 데이터 검증
		 * @param {Object} newItem
		 * @return {Boolean}
		 */
		function validateEmptyFields(newItem) {
			const emptyColumns = columns.value.filter(
				({ field }) => !`${newItem[field] ?? ""}`,
			);

			//필수일 경우 검증 실패
			if (emptyColumns.some(checkColumnRequired)) {
				openModalWarning("modal.create.requiredKey");
				return false;
			}

			return true;
		}

		/**
		 * 중복 데이터에 대한 검증
		 * @param {Object} newItem 새로운 아이템
		 * @param {Object[]} items 비교할 아이템 배열
		 * @return {Boolean}
		 */
		function validateDuplicates(newItem, items = gridItems.value) {
			for (const item of items) {
				//pk field만 비교
				if (compareKeyField(item, newItem)) {
					openModalWarning("modal.create.existData");
					return false;
				}
			}
			return true;
		}

		//==================== Input Event
		const { initGenerator, nextGenerator, initAndFocusGenerator } =
			useInputFocusGenerator();
		const inputRef = ref(null);

		// 마지막 Input이 랜더링 확인되면 첫 번째 Input으로 포커싱한다.
		const unwatch = watchPostEffect(() => {
			if (inputRef.value) {
				// 포커싱은 랜더링 후 단 한 번 실행
				focusInputAfterExecute(() => unwatch());
			}
		});

		/**
		 * @param {Function} callback
		 */
		async function focusInputAfterExecute(callback) {
			await executeWithSpinner(callback);
			// 스피너 끝나고 300ms 후에 포커싱되는 게 자연스러움.
			setTimeout(initAndFocusGenerator, 300);
		}

		return {
			// Config
			ACTION,
			openModalConfirm,
			openModalInfo,
			openModalWarning,
			openModalError,
			configTableId,

			// Field
			panelConfig,
			fields,
			checkColumnRequired,
			checkColumnPrimary,
			compareKeyField,

			// Field Item
			orgItem,
			newItem,
			assignFieldItem,

			// Grid
			gridRef,
			gridItems,
			columns,
			deepCloneItems,
			loadAndfocusRowByIndex,

			// Position
			hasPosition,
			updatePositionAfterDelete,
			updatePositionAfterDrop,
			updatePositionAndSetGridItems,
			setPositionValue,

			// Custom
			customizeCell,

			// Event
			createData,
			resetData,
			addData,
			validateEmptyFields,
			validateDuplicates,

			// Input Event
			inputRef,
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
		//==================== Panel
		/**
		 * @param {Object} column 필드 칼럼
		 * @returns {Boolean} 비활성화 여부
		 */
		checkColumnDisabled(column) {
			if (column[ID.INPUT_TYPE] === "Never") {
				return true;
			}
			return column[ID.FIELD] in this.readOnlyConfig;
		},

		//==================== Field Data
		/**
		 * @param {Object[]} dataItems 엑셀 데이터(객체의 프로퍼티가 header)
		 * @todo api 검증
		 */
		async importData(dataItems) {
			const items = [];
			for (const dataItem of dataItems) {
				const item = this.assignFieldItem(this.orgItem, dataItem, true);

				if (!this.validateEmptyFields(item)) return;
				if (!this.validateDuplicates(item, items)) return;

				items.push(item);
			}

			if (this.hasPosition) {
				//포지션 초기화
				const increment = items.length - this.gridItems.length;
				this.updatePositionAndSetGridItems(items);
				this.setPositionValue(increment);
			} else {
				this.gridItems = items;
			}
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
	cursor: pointer;
}

/* Grid Button */
:deep(#right-pane .item-box .btn-default) {
	color: #767676 !important;
}

/* Field */
:deep(#left-pane .info-container) {
	height: calc(100vh - 322px) !important;
	overflow: auto;
}
</style>
