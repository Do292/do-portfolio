<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>{{ $t(ACTION.CREATE) }}</span>
					</h6>
					<ButtonBasic @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark">
					<Accordion
						:isShowDescription="false"
						:panelConfig="panelConfig"
					>
						<template v-slot:item="item">
							<div class="d-table-cell">
								{{ item.headerText }}
							</div>
							<FormInput
								v-model="newItem[item.field]"
								:class="{ 'multi-line': hasMultiLine(item) }"
								:fieldConfig="item"
								:hasLabel="false"
								:isDisabled="checkColumnDisabled(item)"
								:target="newItem"
								class="d-table-cell"
								floatLabelType="Never"
							/>
						</template>
					</Accordion>
				</div>
				<div class="justify-content modal-footer">
					<ButtonFooter
						class="apply"
						type="apply"
						@onClick="openModalConfirm()"
					/>
					<ButtonFooter type="close" @onClick="$emit('close')" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import {
	useModalAlert,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";
import { useItem, useUpdateData } from "~/plugins/composables/dataHandler";
import {
	useColumnDef,
	useFields,
	useFieldColumn,
} from "~/plugins/composables/tableHandler";

import { COLUMN_TYPE, DATA_TYPE } from "~/constants/common_constants.js";
import { ACTION } from "~/plugins/wfb-constants.js";

export default {
	name: "ModalCreate",
	props: {
		// CreateConfig
		metaDataId: { type: String },
		api: { type: Function },
		items: { type: Array },
		readOnlyConfig: {
			type: Object,
			default() {
				return {};
			},
		},
	},
	emits: ["apply", "close", "create"],
	setup(props, { emit }) {
		//==================== Common
		const { createItem } = useItem();
		const { checkColumnRequired, checkColumnPrimary } = useFieldColumn();
		const { openModalWarning } = useModalAlert();
		const { openModalConfirmBy } = useModalConfirm();
		const { createList } = useUpdateData();

		//==================== Field
		const { ID, metaColumns, fetchMetaColumns } = useColumnDef();
		const { fields, findColumnByField, assignFieldItem } =
			useFields(metaColumns);

		// Field Item
		const orgItem = ref({});
		const newItem = ref({});

		// Panel; ColumnType으로 필드 분리하되, pk는 별도
		const panelConfig = computed(() =>
			metaColumns.value.reduce(
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

		/**
		 * @param {Object} column
		 * @returns {Boolean}
		 */
		function hasMultiLine(column) {
			return column[ID.DATA_TYPE] === DATA_TYPE.LOB;
		}

		onMounted(async () => {
			await fetchMetaColumns(props.metaDataId);

			const defaultItem = createItem(fields.value, key => {
				const column = findColumnByField(key);
				return column[ID.DEFAULT_VALUE];
			});

			const checkItem = props.items[0] ?? {};

			//readOnly > default > checkItem
			orgItem.value = assignFieldItem(props.readOnlyConfig, defaultItem);
			newItem.value = assignFieldItem(orgItem.value, checkItem);
		});

		/**
		 * Confirm 모달 활성화
		 */
		function openModalConfirm() {
			const isItemValid = validateEmptyFields(newItem.value);
			if (!isItemValid) return;

			openModalConfirmBy(
				ACTION.CREATE,
				props.metaDataId,
				[newItem.value],
				createData,
			);
		}

		/**
		 * 필수 값에 대한 데이터 검증
		 * @param {Object} newItem
		 * @return {Boolean}
		 */
		function validateEmptyFields(newItem) {
			const emptyColumns = metaColumns.value.filter(
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
		 * 데이터 생성 후 모달 닫기
		 */
		async function createData(comment) {
			const { length } = await createList(
				props.api,
				props.metaDataId,
				[newItem.value],
				comment,
			);

			// 성공 데이터가 있는 경우에만 모달 닫기
			if (length > 0) {
				emit("close");
			}
		}

		return {
			// Config
			ACTION,
			openModalConfirm,

			// Field
			panelConfig,
			checkColumnDisabled,
			hasMultiLine,

			// Field Item
			newItem,
		};
	},
};
</script>
<style scoped>
/* Modal */
.modal-dialog-centered {
	min-width: 50vw !important;
}
.modal-body {
	overflow: auto;
}

/* Multi Line */
.multi-line :deep(.e-input-group.e-multi-line-input) {
	height: 100px !important;
}

/* InputBox Width */
:deep(.input-field-box.d-table-cell) {
	width: 100% !important;
}
:deep(.input-field-box .e-input-group, .e-input-group.e-control-wrapper) {
	width: 100% !important;
	height: 35px !important;
}
:deep(.e-input-group.e-datetime-wrapper) {
	width: 100% !important;
}
</style>
