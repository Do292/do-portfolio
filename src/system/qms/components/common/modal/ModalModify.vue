<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>{{ $t(ACTION.MODIFY) }}</span>
					</h6>
					<ButtonBasic @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark">
					<Accordion
						:isShowDescription="false"
						:panelConfig="panelConfig"
					>
						<template v-slot:item="item">
							<div class="d-table-cell checkbox">
								<Checkbox
									:field="item.field"
									:header="item.headerText"
									:modelValue="item.checked"
									@update:modelValue="toggleField(item.field)"
								/>
							</div>
							<FormInput
								v-model="newItem[item.field]"
								:class="{ 'multi-line': hasMultiLine(item) }"
								:fieldConfig="item"
								:hasLabel="false"
								:isDisabled="!item.checked"
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
import { ref, reactive, computed, onMounted } from "vue";
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
	name: "ModalModify",
	props: {
		// Config
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
		const { deepCloneItems, createItem, groupByItems, filterItem } =
			useItem();
		const { checkColumnModifiable, checkColumnRequired } = useFieldColumn();
		const { openModalInfo, openModalWarning } = useModalAlert();
		const { openModalConfirmBy } = useModalConfirm();

		const { modifyList } = useUpdateData();

		//==================== Field
		const { ID, metaColumns, fetchMetaColumns } = useColumnDef();
		const { fields, extractFields, findColumnByField } =
			useFields(metaColumns);

		// 수정 가능한 필드
		const modifyColumns = reactive([]);

		// Field Item
		const newItem = ref({});
		const modifiedItem = ref({});
		const orgItems = ref(deepCloneItems(props.items));

		onMounted(async () => {
			await fetchMetaColumns(props.metaDataId);

			metaColumns.value
				.filter(checkColumnModifiable)
				.forEach(column =>
					modifyColumns.push({ ...column, checked: false }),
				);
		});

		const checkedFields = computed(() =>
			extractFields(modifyColumns, field => field.checked),
		);

		// type 별로 field 데이터를 분류한 패널 객체
		const panelConfig = computed(() =>
			groupByItems(ID.COLUMN_TYPE, modifyColumns, COLUMN_TYPE.STANDARD),
		);

		/**
		 * @param {Object} column
		 * @returns {Boolean}
		 */
		function hasMultiLine(column) {
			return column[ID.DATA_TYPE] === DATA_TYPE.LOB;
		}

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
			return createItem(
				fields.value,
				key => modifiedItem.value[key] ?? target[key],
			);
		}

		//==================== Event
		/**
		 * Confirm 모달 활성화
		 */
		function openModalConfirm() {
			const hasModifiedItem = checkedFields.value.length;
			const items = hasModifiedItem ? orgItems.value : [];

			openModalConfirmBy(
				ACTION.MODIFY,
				props.metaDataId,
				items,
				modifyData,
			);
		}

		/**
		 * 데이터 생성 후 모달 닫기
		 */
		async function modifyData(comment) {
			changeData();

			const items = orgItems.value.map(mergeModifyItem);

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
		 * newItem을 검증 후 그리드에 적용한다.
		 */
		function changeData() {
			if (!checkedFields.value.length) {
				openModalWarning("modal.create.noData");
				return;
			}
			if (!validateEmptyFields(newItem.value)) {
				return;
			}

			//아이템 초기화
			modifiedItem.value = filterItem(newItem.value, checkedFields.value);
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
			// config
			ACTION,

			// Field
			panelConfig,
			hasMultiLine,

			// Field Item
			newItem,

			// Field Method
			toggleField,

			openModalConfirm,
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
