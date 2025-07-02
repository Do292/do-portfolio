<template>
	<div class="modal-mask">
		<ModalPreview
			v-if="isShowModalPreview"
			:query="queryPreview"
			@close="toggleModalPreview(false)"
		/>
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>Query Builder</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark">
					<Splitter :paneConfigs="paneConfigs">
						<template v-slot:config>
							<QueryBuilderConfig
								ref="configRef"
								:columns="columns"
								:dependency="dependency"
								:tables="tables"
								@preview="openModalPreview"
								@removeTable="removeTable"
							/>
						</template>
						<template v-slot:diagram>
							<QueryBuilderToolbar
								ref="queryRef"
								:tables="tables"
								@addTable="addTable"
								@removeTable="removeTable"
							/>
						</template>
					</Splitter>
				</div>
				<div class="modal-footer justify-content-between">
					<ButtonFooter type="close" @onClick="$emit('close')" />
					<ButtonFooter
						:isDisabled="!isApplicable"
						class="apply"
						type="apply"
						@onClick="applyQuery()"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ModalPreview from "~/system/modeler/components/common/modal/ModalPreview";

import QueryBuilderConfig from "~/system/modeler/components/test/queryBuilder/QueryBuilderConfig";
import QueryBuilderToolbar from "~/system/modeler/components/test/queryBuilder/QueryBuilderToolbar";

import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import { ref, reactive, computed } from "vue";
import { useModalConfig } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "ModalQueryBuilder",
	components: {
		ModalPreview,
		QueryBuilderConfig,
		QueryBuilderToolbar,
		ButtonClose,
		ButtonFooter,
	},
	props: {
		dependency: { type: String },
	},
	setup(_, { emit }) {
		//==================== Config
		const configRef = ref(null);
		const tables = reactive([]);
		const columns = ref([]);

		function addTable(tableId, tableColumns) {
			tables.push(tableId);
			columns.value.push(...tableColumns);
		}

		function removeTable(tableId) {
			const index = tables.findIndex(table => table === tableId);
			if (index !== -1) {
				tables.splice(index, 1);
				columns.value = columns.value.filter(
					column => column[ID.META_ID] !== tableId,
				);
			}
		}

		//==================== Preview
		// Modal Query Preview
		const {
			isShowModal: isShowModalPreview,
			toggleModal: toggleModalPreview,
		} = useModalConfig();
		const queryPreview = ref("");

		function openModalPreview(column, condition) {
			queryPreview.value = previewQuery(column, condition);
			toggleModalPreview(true);
		}

		//==================== Query
		const queryRef = ref(null);
		const isApplicable = computed(() => configRef.value?.columnRef);

		function previewQuery(column, condition) {
			let query = `SELECT \n\t${column} \nFROM \n\t${queryRef.value.getJoinQuery()}`;
			if (condition) {
				query += `\nWHERE\n\t${condition}`;
			}
			return query;
		}

		function applyQuery() {
			const column = configRef.value.columnRef;
			const condition = configRef.value.queryBuilderRef.getSql();
			emit("apply", previewQuery(column, condition));
		}

		return {
			// Table
			configRef,
			tables,
			columns,
			addTable,
			removeTable,

			// Config
			isApplicable,
			paneConfigs: [
				{ key: "config", size: 25, min: "250px" },
				{ key: "diagram", size: 75, min: "800px" },
			],

			// Preview
			queryPreview,
			isShowModalPreview,
			toggleModalPreview,
			openModalPreview,

			// Query
			queryRef,
			previewQuery,
			applyQuery,
		};
	},
};
</script>
<style scoped>
/* Layout */
.modal-dialog {
	width: 80vw !important;
	max-width: 85vw !important;
	min-width: 500px !important;
}
.modal-content {
	height: calc(100vh - 140px);
	min-height: 300px;
}
.modal-body {
	padding: 0.2rem 1rem !important;
}
.modal-body .card {
	padding: 6px;
	margin-bottom: 0;
}

/* Splitter */
.modal-body :deep(.e-split-bar) {
	margin: 10px !important;
}
.modal-body :deep(.e-splitter.e-splitter-horizontal .e-pane.e-pane-horizontal) {
	min-width: 357px;
}
</style>
