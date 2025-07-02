<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>{{ $t("modal.search.title") }}</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark">
					<div class="card">
						<HeaderTemplate
							:configs="headerConfigs"
							@search="filterItems"
						/>
						<!-- selectedIndex 변경 시 그리드 초기화 -->
						<GridTemplate
							:checkbox="isMultiple"
							:columns="columns"
							:exporting="false"
							:filtering="false"
							:freezing="false"
							:gridItems="filteredItems"
							:gridName="title"
							selectionType="Single"
							@onCheckBoxChange="updateSelectedItems"
							@onRecordClick="selectItem"
							@onRecordDoubleClick="applyItem"
						/>
					</div>
				</div>
				<div class="modal-footer justify-content-between">
					<ButtonFooter type="close" @onClick="$emit('close')" />
					<ButtonFooter
						:isDisabled="!isApplicable"
						class="apply"
						type="apply"
						@onClick="applySearchItems(selectedItems)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import GridTemplate from "~/system/modeler/components/common/template/GridTemplate";
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";

import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import { ref, computed } from "vue";
import { useModalSearch } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useHeader } from "~/system/modeler/plugins/composables/modeler-uiControl";

export default {
	name: "ModalSearch",
	components: { GridTemplate, HeaderTemplate, ButtonClose, ButtonFooter },
	setup() {
		//==================== Config
		const { field, title, items, isMultiple, applySearchItems } =
			useModalSearch();
		const fields = items.value.length
			? Object.keys(items.value[0]).sort(key => -(key === field.value)) // Field 우선 정렬
			: [field.value];
		const columns = fields.map(field => ({ field }));

		// Header Config
		const { formatConfigsByField } = useHeader();
		const headerConfigs = formatConfigsByField(fields);

		//==================== Filtering
		const filteredItems = ref(items.value);

		/**
		 * items 필터링 후 selection 초기화
		 * @param {Object} condition
		 */
		function filterItems(condition) {
			filteredItems.value = items.value.filter(item =>
				Object.entries(condition).every(([key, value]) => {
					// 대소문자 구분 X
					const pattern = new RegExp(value, "i");
					return pattern.test(item[key]);
				}),
			);
		}

		//==================== Selection
		const selectedItems = ref([]);

		// 선택 데이터가 있어야 apply 가능
		const isApplicable = computed(() => selectedItems.value.length > 0);

		/**
		 * 하나 선택할 경우만 apply 처리
		 */
		function applyItem() {
			if (!isMultiple.value) {
				applySearchItems(selectedItems.value);
			}
		}

		/**
		 * @param {Object} event
		 * @param {Object} event.rowData
		 */
		function selectItem({ rowData }) {
			if (!isMultiple.value) {
				selectedItems.value = [rowData];
			}
		}

		/**
		 * @param {Object} event
		 * @param {Number[]} event.selectedRowIndexes
		 */
		function updateSelectedItems({ selectedRowIndexes }) {
			selectedItems.value = filteredItems.value.filter((_, index) =>
				selectedRowIndexes.includes(index),
			);
		}

		return {
			// Config
			title,
			fields,
			isMultiple,
			columns,
			headerConfigs,
			applySearchItems,

			// Filtering
			filteredItems,
			filterItems,

			// Selection
			selectedItems,
			isApplicable,
			applyItem,
			selectItem,
			updateSelectedItems,
		};
	},
};
</script>
<style scoped>
/* Layout */
.modal-dialog {
	width: 50vw !important;
	max-width: 800px !important;
	min-width: 500px !important;
}
.modal-content {
	height: calc(100vh - 312px);
	min-height: 300px;
}
.modal-body {
	padding: 0.5rem !important;
}
.modal-body .card {
	padding: 6px;
	margin-bottom: 0;
}

/* Grid */
:deep(.e-grid) {
	margin-right: 0px;
}
:deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 613px) !important;
}
:deep(.excel-box) {
	right: 5px !important;
}
</style>
