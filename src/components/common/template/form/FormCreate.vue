<template>
	<div class="card">
		<div class="card-body suite-form">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<div class="item-title ml-1">
						<label>
							<span @click="$emit('close')">
								{{ $t(metaDataId) }}
							</span>
						</label>
						<Breadcrumb :items="[$t(ACTION.CREATE)]" />
					</div>
					<div class="left-area ml-1">
						<Accordion :panelConfig="panelConfig">
							<template v-slot:item="item">
								<FormInput
									v-model="newItem[item.field]"
									:dependentTableId="dependentTableId"
									:fieldConfig="item"
									:isDisabled="checkColumnDisabled(item)"
									:target="newItem"
									@click="initGenerator"
									@keyup.enter="nextGenerator"
								/>
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
							<ButtonBasic type="addData" @onClick="addData">
								Add Data
							</ButtonBasic>
						</div>
					</div>
				</template>
				<template v-slot:right>
					<Grid
						ref="gridRef"
						:checkbox="false"
						:columns="columns"
						:deleting="true"
						:dragging="hasSequence"
						:freezing="true"
						:gridId="metaDataId"
						:gridItems="gridItems"
						:gridName="metaDataId"
						:importing="true"
						:selecting="false"
						@afterDelete="updateSequenceAfterDelete"
						@afterDrop="updateSequenceAfterDrop"
						@onImport="importData"
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
					</Grid>
				</template>
			</Splitter>
		</div>
	</div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
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
import {
	useKeyEvent,
	useInputFocusGenerator,
} from "~/plugins/composables/eventHandler";

// Modeler
import { useDefaultFactory } from "~/system/modeler/plugins/composables/modeler-authority";

import { COLUMN_TYPE } from "~/constants/common_constants.js";
import { ACTION } from "~/plugins/wfb-constants.js";

export default {
	name: "FormCreate",
	components: {},
	props: {
		// CreateConfig
		menuId: { type: String },
		metaDataId: { type: String },
		api: { type: Function },
		items: { type: Array },
		readOnlyConfig: {
			type: Object,
			default() {
				return {};
			},
		},

		// Custom
		customSequence: { type: String },
		shouldDelegate: { type: Boolean, default: false },
		needsDefaultFactory: { type: Boolean, default: true },
		compareKeyValueFlag: { type: Boolean, default: false },
		excludeKeyList: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	emits: ["apply", "close", "create"],
	setup(props, { emit }) {
		//==================== Config
		const { executeWithSpinner } = useSpinner();
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();
		const { openModalConfirmBy } = useModalConfirm();
		const { createList } = useUpdateData();

		const paneConfigs = [
			{ key: "left", size: 25, min: "250px" },
			{ key: "right", size: 75, min: 50 },
		];

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
				props.metaDataId,
				gridItems.value,
				createData,
			);
		}

		//==================== Grid
		const gridItems = ref([]);
		const gridRef = ref(null);
		// Meta Column 사용
		const {
			ID,
			metaColumns: columns,
			fetchModalColumns: fetchColumns,
		} = useColumnDef();

		// columnDef, gridColumnDef에서 dependency 지정
		const dependentTableId = ref(props.readOnlyConfig[ID.TABLE_ID]);

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

			// Sequence
			SEQUENCE,
			hasSequence,

			// Key Field
			keyFieldComparator,
			compareKeyField,

			compareKeyValue,
		} = useFields(columns, props.customSequence);

		const { deepCloneItems, createItem, sortItems } = useItem();
		const { checkColumnRequired, checkColumnPrimary, checkColumnVisible } =
			useFieldColumn();

		// Field Item
		const orgItem = ref({});
		const newItem = ref({});

		// Panel; ColumnType으로 필드 분리하되, pk는 별도
		const panelConfig = computed(() =>
			columns.value.reduce(
				(acc, cur) => {
					const key = checkColumnPrimary(cur)
						? COLUMN_TYPE.KEY
						: cur[ID.COLUMN_TYPE] ?? COLUMN_TYPE.STANDARD;

					if (!acc[key]) {
						acc[key] = [];
					}
					if (checkColumnVisible(cur)) {
						acc[key].push(cur);
					}
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
			await fetchColumns(props.menuId, props.metaDataId, ACTION.CREATE);

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

		/**
		 * @param {Object} column 필드 칼럼
		 * @returns {Boolean} 비활성화 여부
		 */
		function checkColumnDisabled(column) {
			if (column[ID.INPUT_TYPE] === "Never") {
				return true;
			}
			return column[ID.FIELD] in props.readOnlyConfig;
		}

		//==================== Sequence
		/**
		 * 선택한 아이템을 그리드에서 삭제한다.
		 * @param {Object} item
		 */
		function updateSequenceAfterDelete(deletedItem) {
			if (!hasSequence.value) return;

			const deletedPosition = deletedItem[SEQUENCE];
			gridItems.value
				.filter(item => item[SEQUENCE] > deletedPosition)
				.forEach(item => item[SEQUENCE]--);

			// for SPC TODO JJ 다른방식 생각 필요
			if (props.metaDataId == "ChartCondition") {
				const deleteSeq = deletedItem["chartConditionSeq"];
				gridItems.value
					.filter(item => item["chartConditionSeq"] > deleteSeq)
					.forEach(item => item["chartConditionSeq"]--);
			}

			setSequenceValue(-1);
		}

		/**
		 * @param {Object} dropItem
		 * @param {Number|null} forceIndex null이면 특정 인덱스가 없음을 의미
		 */
		function updateSequenceAfterDrop(dropItem, forceIndex, dropIndex) {
			const items = gridItems.value;

			// 아이템 정렬
			if (Number.isInteger(forceIndex)) {
				// target을 첫 번째 위치로 배치할지
				const prioritized = forceIndex === 0;
				sortItems(items, keyFieldComparator(dropItem), prioritized);
			}

			updateSequenceAndSetGridItems(items);
			loadAndfocusRowByIndex(forceIndex ?? dropIndex);
		}

		/**
		 * 포지션 수정 후 grid 데이터 바인딩
		 * @param {Object[]} items
		 */
		function updateSequenceAndSetGridItems(items) {
			let sequence = orgItem.value[SEQUENCE] - gridItems.value.length;
			items.forEach(item => (item[SEQUENCE] = sequence++));

			gridItems.value = deepCloneItems(items);
		}

		/**
		 * position 기준 값 증감
		 * @param {Number|null} increment default 1
		 */
		function setSequenceValue(increment = 1) {
			const position = +orgItem.value[SEQUENCE] + increment;
			newItem.value[SEQUENCE] = position;
			orgItem.value[SEQUENCE] = position;

			// for SPC TODO JJ 다른방식 생각 필요
			if (props.metaDataId == "ChartCondition") {
				newItem.value["chartConditionSeq"] = position;
				orgItem.value["chartConditionSeq"] = position;
			}
		}

		//==================== Event
		const { activateApplyEvent, activateUpdateEvent, activateResetEvent } =
			useKeyEvent();
		const { initGenerator, nextGenerator } = useInputFocusGenerator();

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
				props.api,
				props.metaDataId,
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

				if (hasSequence.value) {
					setSequenceValue();
				}
			}
		}

		/**
		 * @param {Object[]} dataItems 엑셀 데이터(객체의 프로퍼티가 header)
		 * @todo api 검증
		 */
		async function importData(dataItems) {
			const items = [];
			for (const dataItem of dataItems) {
				const item = assignFieldItem(orgItem.value, dataItem);

				if (!validateEmptyFields(item)) return;
				if (!validateDuplicates(item, items)) return;

				items.push(item);
			}

			if (hasSequence.value) {
				//포지션 초기화
				const increment = items.length - gridItems.value.length;
				updateSequenceAndSetGridItems(items);
				setSequenceValue(increment);
			} else {
				gridItems.value = items;
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
				if (compareKeyField(item, newItem, props.excludeKeyList)) {
					openModalWarning("modal.create.existData");
					return false;
				}

				if (
					props.compareKeyValueFlag &&
					compareKeyValue(item, newItem, props.excludeKeyList)
				) {
					openModalWarning("modal.create.existData");
					return false;
				}
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
			dependentTableId,
			paneConfigs,

			// Field
			panelConfig,
			fields,
			checkColumnRequired,
			checkColumnPrimary,
			checkColumnDisabled,
			compareKeyField,
			compareKeyValue,

			// Field Item
			orgItem,
			newItem,
			assignFieldItem,

			// Grid
			ID,
			gridRef,
			gridItems,
			columns,
			deepCloneItems,
			loadAndfocusRowByIndex,

			// Position
			hasSequence,
			updateSequenceAfterDelete,
			updateSequenceAfterDrop,
			updateSequenceAndSetGridItems,
			setSequenceValue,

			// Event
			createData,
			resetData,
			addData,
			importData,
			validateEmptyFields,
			validateDuplicates,

			// Generator
			initGenerator,
			nextGenerator,
		};
	},
	methods: {
		//==================== Field Data
	},
};
</script>
<style scoped>
/* Grid Button */
/* :deep(#right-pane .item-box .btn-default) {
	color: #767676 !important;
} */

/* Field */
/* :deep(#left-pane .info-container) {
	height: calc(100vh - 322px) !important;
}
.d-table-cell.field {
	min-width: 100px;
} */
</style>
