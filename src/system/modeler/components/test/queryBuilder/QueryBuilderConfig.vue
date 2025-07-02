<template>
	<div class="config-box">
		<div class="row">
			<div class="col-6 item-title">
				<label> Configuration </label>
			</div>
			<div class="col-6 text-right mt-2">
				<ButtonText type="preview" @onClick="previewQuery" />
			</div>
		</div>
		<div class="row config-row">
			<div class="col-3">
				<label class="pl-1"> Table </label>
			</div>
			<div class="col-9">
				<div>
					<span
						v-for="table in tables"
						:key="table"
						class="table-badge mr-1"
					>
						{{ table }}
						<ButtonSimple
							type="close"
							@onClick="$emit('removeTable', table)"
						/>
					</span>
				</div>
			</div>
		</div>
		<div class="row config-row">
			<div class="col-3">
				<label class="pl-1"> Column </label>
			</div>
			<div class="col-9">
				<InputSearch
					:customItems="columnInfos"
					:field="ID.META_DETAIL_ID"
					:isDisabled="!hasTable"
					:value="columnRef"
					inputMethod="SearchItems"
					@search="updateColumnBySearch"
					@update="updateColumn"
				/>
			</div>
		</div>
		<div class="row config-row">
			<div class="col-3">
				<label class="pl-1"> Dependency </label>
			</div>
			<div class="col-9">
				<input :value="dependency" class="form-control" readonly />
			</div>
		</div>
		<div class="condition-box mt-2 ml-2">
			<div class="item-box-title">
				<label> Conditions </label>
			</div>
			<QueryBuilderTemplate
				ref="queryBuilderRef"
				:dependencyColumns="dependencyColumns"
				:tableColumns="columns"
				:tables="tables"
			/>
		</div>
	</div>
</template>

<script>
import QueryBuilderTemplate from "~/system/modeler/components/common/template/QueryBuilderTemplate";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import ButtonSimple from "~/system/modeler/components/common/button/ButtonSimple";
import InputSearch from "~/system/modeler/components/common/input/InputSearch";

import { computed, ref, watchEffect } from "vue";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useColumnDef } from "~/system/modeler/plugins/composables/modeler-tableHandler";

import { ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "QueryBuilderConfig",
	components: {
		QueryBuilderTemplate,
		ButtonText,
		ButtonSimple,
		InputSearch,
	},
	props: {
		tables: { type: Array },
		columns: { type: Array },
		dependency: { type: String, default: "TableDef" },
	},
	setup(props, { emit }) {
		//==================== Common
		const { META_ID, META_DETAIL_ID } = ID;
		const hasTable = computed(() => props.tables?.length > 0);

		// Dependency
		const {
			metaColumns: dependencyColumns,
			fetchMetaColumns: fetchDependencyColumns,
		} = useColumnDef();

		watchEffect(() => fetchDependencyColumns(props.dependency));

		//==================== Column
		const { filterItem } = useItem();
		const columnRef = ref("");
		const columnInfos = computed(
			() =>
				props.columns?.map(column =>
					filterItem(column, [META_DETAIL_ID, META_ID]),
				) ?? [],
		);

		function updateColumnBySearch(items) {
			const value = items
				.map(item => `${item[META_ID]}.${item[META_DETAIL_ID]}`)
				.join(", ");
			updateColumn(value);
		}

		function updateColumn(value) {
			columnRef.value = value;
		}

		//==================== Query
		const queryBuilderRef = ref(null);

		function previewQuery() {
			emit("preview", columnRef.value, queryBuilderRef.value.getSql());
		}

		return {
			// Table
			hasTable,

			// Dependency
			dependencyColumns,

			// Column
			ID,
			columnRef,
			columnInfos,
			updateColumnBySearch,
			updateColumn,

			// Query
			queryBuilderRef,
			previewQuery,
		};
	},
};
</script>

<style scoped>
/* Layout */
.config-box {
	height: calc(100vh - 255px);
}
.config-row {
	height: 28px;
}
.config-row label {
	transform: translateY(3.5px);
}
.config-row :deep(.form-control) {
	height: 26px;
}

/* Table */
.table-badge {
	/* background: #e6e6fa; */
	background: rgba(233, 236, 239, 0.6);
	font-size: 0.8rem;
	border: 1px solid #ced4da;
	height: 26px;
	border-radius: 5px;
	padding: 3px 0px 3px 12px;
	white-space: nowrap;
	position: relative;
	display: inline-block;
}
.table-badge button {
	height: 12px !important;
	width: 10px !important;
	transform: translate(-3px, -13px);
}
.table-badge button :deep(i) {
	font-size: 9px;
	color: #0000009f !important;
}
.table-badge button:hover :deep(i) {
	color: #000000 !important;
}

/* Condition */
.condition-box {
	height: calc(100% - 160px);
}
.condition-box .item-box-title {
	transform: translateY(14px);
}
.condition-box :deep(.e-control.e-query-builder) {
	height: calc(100% - 8px) !important;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	overflow-y: auto;
}
</style>
