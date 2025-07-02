<template>
	<div class="modal-mask modal-search">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h6 class="modal-title">
						<span>{{ $t("modal.search.title") }}</span>
					</h6>
					<ButtonBasic type="close" @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark p-2">
					<div class="card mb-0">
						<FormGrid
							ref="gridRef"
							:checkbox="isMultiple"
							:customApi="customApi"
							:gridId="gridId"
							:gridTitle="gridTitle"
							:isUseCreate="false"
							:isUseDelete="false"
							:isUseModify="false"
							:isUsePath="false"
							:menuId="gridMenuId"
							:metaDataId="searchField"
							:searchCondition="condition"
							class="mb-3"
							@onRowDoubleClick="applyData"
							@onSelectionChanged="selectData"
						>
						</FormGrid>
						<!-- :customItems="items" -->
					</div>
				</div>
				<div class="modal-footer">
					<ButtonBasic
						:isDisabled="!isApplicable"
						class="apply"
						type="apply"
						@onClick="applyDataByButton"
					>
						<label>Apply</label>
						<!-- TODO: 추후 다국어처리 -->
					</ButtonBasic>
					<ButtonBasic
						class="btn btn-md btn-footer"
						type="close"
						@onClick="$emit('close')"
					>
						<label>Close</label>
						<!-- TODO: 추후 다국어처리 -->
					</ButtonBasic>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { useModalAlert } from "~/plugins/composables/modalHandler";
import { useTableDef } from "~/plugins/composables/tableHandler";
import { useMenu } from "~/plugins/composables/authority";

import * as SYSTEM_COMMON from "~/api/system-common.js";

export default {
	name: "ModalSearch",
	props: {
		menuId: { type: String },
		searchField: { type: String },
		inputQuery: { type: String },
		isMultiple: { type: Boolean, default: false },
		api: { type: Function },
		condition: {
			type: Object,
			default() {
				return {};
			},
		},
	},
	data() {
		return {
			selectedItem: {},
		};
	},
	computed: {
		isApplicable() {
			return this.selectedItem
				? !!this.selectedItem[this.searchField]
				: false;
		},
	},
	setup(props, { emit }) {
		const { t } = useI18n();
		const { openModalWarning } = useModalAlert();

		//==================== Grid
		const gridRef = ref(null);
		const { fetchGridTableDef, gridTableDef } = useTableDef();

		const gridTitle = computed(() => {
			return gridTableDef.value.label;
		});

		const gridId = computed(() => {
			return `ModalSearch.${props.searchField}`;
		});

		// Menu
		const { currentMenuId } = useMenu();
		const gridMenuId = props.menuId || currentMenuId.value;

		// api
		const getByInputQuery = () =>
			SYSTEM_COMMON.getByInputQuery(props.inputQuery, {});
		const customApi =
			props.api ?? props.inputQuery ? getByInputQuery : null;

		onMounted(async () => {
			await fetchGridTableDef(gridMenuId, gridId.value);
		});

		function applyDataByButton() {
			const items = gridRef.value.cloneCheckItems();
			if (!props.isMultiple && items.length !== 1) {
				openModalWarning(t("warning.selectOneData"));
				return;
			}
			applyData(items);
		}

		function applyData(items) {
			const isSingle = !props.isMultiple && Array.isArray(items);
			const data = isSingle ? items[0] : items;
			emit("apply", data);
			emit("close");
		}

		return {
			gridRef,
			gridTitle,
			gridId,
			gridMenuId,
			customApi,
			applyDataByButton,
			applyData,
		};
	},
	methods: {
		selectData({ row }) {
			this.selectedItem = row;
		},
	},
};
</script>
<style scoped></style>
