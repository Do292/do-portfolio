<template>
	<div class="tree-grid-form">
		<div class="row">
			<slot name="header">
				<div class="col-6 item-title">
					<!-- Custom Title -->
					<slot name="header-title">
						<label data-test="grid-title">
							{{ $t(gridName) }}
						</label>
					</slot>
				</div>
				<div class="col-6 text-right mt-2">
					<div class="item-box right-space">
						<!-- Custom Button -->
						<slot name="header-content"></slot>
					</div>
					<div class="excel-box">
						<div class="btn-group">
							<button
								v-if="exporting"
								class="btn btn-md btn-default excel"
								title="Export Excel"
								@click="exportExcel"
							>
								<i class="aim aimcons_excel"></i>
								<i class="aim aimcons_output"></i>
							</button>
						</div>
					</div>
				</div>
			</slot>
		</div>
		<wfl-treegrid
			ref="gridRef"
			:allowExcelExport="exporting"
			:allowFiltering="filtering"
			:allowPaging="paging"
			:allowResizing="resizing"
			:allowSelection="selecting"
			:childMapping="childId"
			:dataSource="gridItems"
			:enableHover="true"
			:filterSettings="filterSetting"
			:hasChildMapping="parentId"
			:idMapping="itemId"
			:pageSettings="pageSetting"
			:parentIdMapping="parentId"
			:selectionSettings="selectionSetting"
			:treeColumnIndex="treeColumnIndex"
			@dataBound="afterBindData"
			@queryCellInfo="$emit('onQueryCellInfo', $event)"
		>
			<wfl-treegrid-columns>
				<wfl-treegrid-column
					v-if="checkbox"
					type="checkbox"
					width="50"
				></wfl-treegrid-column>
				<wfl-treegrid-column
					v-for="column in gridColumns"
					:key="column.field"
					v-bind="column"
				></wfl-treegrid-column>
			</wfl-treegrid-columns>
		</wfl-treegrid>
	</div>
</template>

<script>
import { ref } from "vue";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useFields } from "~/system/modeler/plugins/composables/modeler-tableHandler";

export default {
	name: "TreeGridTemplate",
	props: {
		// Grid Info
		gridName: {
			type: String,
			required: true,
		},
		gridColumns: {
			type: Array,
			default() {
				return [];
			},
		},
		fields: {
			type: Array,
			default() {
				return [];
			},
		},
		gridItems: {
			type: Array,
			default() {
				return [];
			},
		},

		// Tree Info
		parentId: { type: String },
		itemId: { type: String },
		childId: { type: String },
		treeColumnIndex: { type: Number, default: 0 },

		// Grid Option
		checkbox: { type: Boolean, default: true },
		filtering: { type: Boolean, default: true },
		paging: { type: Boolean, default: true },
		resizing: { type: Boolean, default: true },
		selecting: { type: Boolean, default: true },

		// Excel
		excelQueryCellInfo: { type: Function },
		exporting: { type: Boolean, default: true },
	},
	setup(props) {
		//==================== Common
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();
		const { deepCloneItems } = useItem();

		//==================== Grid
		const { extractFields } = useFields();
		const gridRef = ref(null);

		/**
		 * 컬럼의 너비 자동으로 조절(freeze 과정에서 autoFit 풀림 방지)
		 */
		function afterBindData() {
			const fields = extractFields(props.gridColumns);
			gridRef.value.autoFitColumns(fields);
		}

		//==================== Excel

		/**
		 * excel export; cell custom은 excelQueryCellInfo에 정의
		 */
		function exportExcel() {
			const fileName = `${props.gridName}.xlsx`;

			const excelProperties = {
				fileName,
				isCollapsedStatePersist: true,
			};
			gridRef.value.excelExport(excelProperties);
		}

		return {
			// Common
			openModalInfo,
			openModalWarning,
			openModalError,
			deepCloneItems,

			// Grid
			gridRef,
			afterBindData,

			// Excel
			exportExcel,
		};
	},
	data() {
		return {
			filterSetting: { type: "Excel" },
			pageSetting: {
				pageSize: 50,
				pageSizes: [50, 100, 500, 1000],
				pageCount: 5,
			},
			selectionSetting: {
				type: this.selectionType,
				mode: "Row",
				checkboxOnly: this.checkbox,
			},
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(.e-grid .e-spinner-pane.e-spin-show) {
	display: none !important;
}
:deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 275px);
}
:deep(.e-rowdragheader),
:deep(.e-movableheader),
:deep(.e-headercontent),
:deep(.e-headercell) {
	background: #f7f9fc;
}

/* Grid Icon */
:deep(.e-icons.e-none) {
	width: 16px !important;
}

/* Resizing 관리 */
:deep(.e-grid .e-rhelper) {
	display: none;
}
:deep(.e-reorderdownarrow),
:deep(.e-reorderuparrow) {
	display: none;
}

/* Excel Button*/
.excel-box {
	display: inline-block;
}
.excel-box .btn-group button {
	color: #4d4d4d;
}

/* Badge Type */
:deep(.type span) {
	border-radius: 4px;
	background: #ececec;
	color: #747373;
	padding: 3px 7px;
	font-size: 12px;
	font-weight: 500;
}

/* Badge Seqeunce */
:deep(.seq span),
:deep(.sequence span) {
	border-radius: 50%;
	background: #393e56;
	color: #fff;
	display: inline-block;
	width: 18px;
	height: 18px;
	line-height: 19px;
	font-weight: 500;
	font-size: 11px;
}
</style>
