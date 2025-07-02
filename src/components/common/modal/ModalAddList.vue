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
						<Grid
							ref="templateRef"
							:columns="metaColumns"
							:freezing="true"
							:gridItems="items"
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
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import { ref, computed, onMounted } from "vue";
import { useColumnDef } from "~/plugins/composables/tableHandler";
import { useSpinner } from "~/plugins/composables/uiControl";

export default {
	name: "ModalAddList",
	components: { ButtonClose, ButtonFooter },
	props: {
		// Config
		metaDataId: { type: String },
		gridId: { type: String },
		items: { type: Array },
	},
	setup(props) {
		//==================== Config
		const { executeWithSpinner } = useSpinner();
		const { metaColumns, keyColumns, fetchMetaColumns } = useColumnDef();

		//Initialize columns on component mount
		onMounted(() => {
			executeWithSpinner(() => fetchMetaColumns(props.metaDataId));
		});

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
/* Grid */
/* :deep(.e-grid) {
	margin-right: 0px;
} */
#modal-add-list .modal-body :deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 613px) !important;
}
/* :deep(.e-grid td.e-gridchkbox .e-checkbox-wrapper) {
	left: -19px;
} */

/* :deep(.excel-box) {
	right: 5px !important;
} */
</style>
