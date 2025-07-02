<template>
	<div id="modal-add-list" class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>{{ $t("modal.add.title") }}</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark">
					<div class="card">
						<HeaderTemplate
							:configs="keyColumns"
							@search="filterItems"
						/>
						<GridTemplate
							ref="templateRef"
							:columns="metaColumns"
							:freezing="true"
							:gridItems="filteredItems"
							:gridName="gridId"
							@onCheckBoxChange="updateCheckItems"
						/>
					</div>
				</div>
				<div class="modal-footer justify-content-between">
					<ButtonFooter type="close" @onClick="$emit('close')" />
					<ButtonFooter
						:isDisabled="!isApplicable"
						class="apply"
						type="apply"
						@onClick="$emit('apply', checkItems)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";
import GridTemplate from "~/system/modeler/components/common/template/GridTemplate";

import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import { ref, computed, onMounted } from "vue";
import { useColumnDef } from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";

export default {
	name: "ModalAddList",
	components: { HeaderTemplate, GridTemplate, ButtonClose, ButtonFooter },
	props: {
		// Config
		tableId: { type: String },
		gridId: { type: String },
		items: { type: Array },
	},
	setup(props) {
		//==================== Config
		const { executeWithSpinner } = useSpinner();
		const { metaColumns, keyColumns, fetchMetaColumns } = useColumnDef();

		//Initialize columns on component mount
		onMounted(() => {
			executeWithSpinner(() => fetchMetaColumns(props.gridId));
		});

		//==================== Filtering
		const filteredItems = ref(props.items);

		/**
		 * items 필터링 후 Apply 초기화
		 * @param {Object} condition
		 */
		function filterItems(condition) {
			filteredItems.value = props.items.filter(item =>
				Object.entries(condition).every(([key, value]) => {
					// 대소문자 구분 X
					const pattern = new RegExp(value, "i");
					return pattern.test(item[key]);
				}),
			);
		}

		//==================== Check Items
		const templateRef = ref(null);
		const checkItems = ref([]);

		/**
		 * 그리드에 체크된 내용을 저장한다.
		 */
		function updateCheckItems() {
			checkItems.value = templateRef.value.getCheckItems();
		}

		//==================== Apply
		const isApplicable = computed(() => checkItems.value.length > 0);

		return {
			// Config
			metaColumns,
			keyColumns,

			// Filtering
			filteredItems,
			filterItems,

			// Grid Check
			templateRef,
			checkItems,
			updateCheckItems,

			// Apply
			isApplicable,
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
#modal-add-list .modal-body :deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 613px) !important;
}
:deep(.e-grid td.e-gridchkbox .e-checkbox-wrapper) {
	left: -19px;
}
:deep(.excel-box) {
	right: 5px !important;
}
</style>
