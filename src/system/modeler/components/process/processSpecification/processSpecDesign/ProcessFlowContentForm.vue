<template>
	<TreeGridTemplate
		:checkbox="false"
		:childId="FIELD.CHILDREN"
		:gridColumns="columns"
		:gridItems="nodeList"
		:gridName="TABLE.PROCESS_FLOW_CONTENT"
		:selecting="false"
		:treeColumnIndex="treeColumnIndex"
		@onQueryCellInfo="customizeCell"
	>
		<template v-slot:header-title>
			<label>
				{{ $t(TABLE.PROCESS_FLOW_CONTENT) }}
			</label>
			<slot name="grid-path">
				<BreadcrumbTemplate :isSelectable="false" :items="path" />
			</slot>
		</template>
		<template v-slot:header-content>
			<div class="btn-group">
				<ButtonBasic
					type="refresh"
					@onClick="fetchFlowContentAndOperation"
				/>
			</div>
		</template>
	</TreeGridTemplate>
</template>

<script>
import TreeGridTemplate from "~/system/modeler/components/common/template/TreeGridTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";

import { ref, readonly, computed, onMounted } from "vue";
import { useColumnDef } from "~/system/modeler/plugins/composables/modeler-tableHandler";
import {
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useCustomization } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useDefaultFactory } from "~/system/modeler/plugins/composables/modeler-authority";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import {
	ID,
	MENU,
	TABLE,
} from "~/system/modeler/constants/modeler_constants.js";
import {
	PROCESS_SPEC_CONTENT,
	PROCESS_FLOW_CONTENT,
} from "~/system/modeler/constants/table_constants.js";

export default {
	name: "ProcessFlowContentForm",
	components: {
		TreeGridTemplate,
		BreadcrumbTemplate,
		ButtonBasic,
	},
	props: {
		spec: {
			type: Object,
			default() {
				return {};
			},
		},
		specContentList: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	setup(props) {
		//==================== Config
		const { FLOW_ID, OPERATION_ID } = PROCESS_FLOW_CONTENT;
		const FIELD = readonly({
			ID: "PROCESSSEQUENCE",
			TYPE: "TYPE",
			CHILDREN: "CHILDREN",
		});
		const TYPE = readonly({
			FLOW: "Flow",
			OPERATION: "Operation",
		});

		// Path
		const path = computed(() => Object.values(props.spec));

		//==================== Grid
		const { executeWithSpinner } = useSpinner();

		// Column
		const { columns, fetchColumns } = useColumnDef();
		const treeColumnIndex = computed(() =>
			columns.value.findIndex(column => column[ID.FIELD] === FIELD.ID),
		);
		fetchColumns(
			TABLE.PROCESS_FLOW_CONTENT,
			MENU.PROCESS_SPEC_DESIGN,
			TABLE.PROCESS_FLOW_CONTENT,
		);

		// Node
		const nodeList = computed(() =>
			props.specContentList.map(defineFlowNode),
		);

		/**
		 * @param {Object} config
		 * @returns {Object}
		 */
		function defineFlowNode(config) {
			const key = config[FLOW_ID];
			const children = flowContentList.value
				.filter(operation => operation[FLOW_ID] === key)
				.map(defineOperationNode);

			return Object.assign(
				{
					[FIELD.ID]: config[FLOW_ID],
					[FIELD.TYPE]: TYPE.FLOW,
					[FIELD.CHILDREN]: children,
					[ID.POSITION]: config[PROCESS_SPEC_CONTENT.POSITION],
				},
				config,
			);
		}

		/**
		 * @param {Object} config
		 * @returns {Object}
		 */
		function defineOperationNode(config) {
			const operation = operations.value.find(
				operation => operation[OPERATION_ID] === config[OPERATION_ID],
			);

			return Object.assign(
				{
					[FIELD.ID]: config[OPERATION_ID],
					[FIELD.TYPE]: TYPE.OPERATION,
					[ID.POSITION]: config[PROCESS_FLOW_CONTENT.POSITION],
					[ID.DESCRIPTION]: operation[ID.DESCRIPTION],
				},
				config,
			);
		}

		//==================== Flow Content
		const { assignDataState, fetchList } = useFetchData();
		const { assignDefaultFactory } = useDefaultFactory(true, columns);
		const { sortItemsByPosition } = useItem();

		const flowContentList = ref([]);
		const operations = ref([]);

		/**
		 * Flow Content와 Operation 데이터 가져오기
		 */
		async function fetchFlowContentAndOperation() {
			const param = assignDataState();
			assignDefaultFactory(param);

			await executeWithSpinner(async () => {
				operations.value = await fetchList(() =>
					COMMON.getBy(TABLE.PROCESS_OPERATION, param),
				);
				flowContentList.value = await fetchList(() =>
					COMMON.getBy(TABLE.PROCESS_FLOW_CONTENT, param),
				);
			});

			// Flow 정렬
			sortItemsByPosition(
				flowContentList.value,
				PROCESS_FLOW_CONTENT.POSITION,
			);
		}

		onMounted(fetchFlowContentAndOperation);

		//==================== Custom
		const { createBadge, validateBadgeToCell } = useCustomization();

		/**
		 * @param {Object} event 이벤트 데이터
		 * @param {Object} event.data row 데이터
		 * @param {HTMLTableCellElement} event.cell
		 * @param {String|null} event.column.field
		 */
		function customizeCell({ data, cell, column: { field } }) {
			const value = `${data[field] ?? ""}`;
			if (!value) {
				return;
			}

			if (field !== FIELD.ID) {
				validateBadgeToCell(cell, field, value);
				return;
			}

			const $cell = cell.querySelector(".e-treecell");
			if ($cell) {
				const $badge = createBadge(
					String(data[ID.POSITION]),
					data.TYPE,
				);
				$cell.insertBefore($badge, $cell.firstChild);
				cell.style.width = "220px";
			}
		}

		return {
			// Config
			TABLE,
			FIELD,

			// Path
			path,

			// Grid Column
			columns,
			treeColumnIndex,

			// Grid Item
			nodeList,
			fetchFlowContentAndOperation,

			// Custom
			customizeCell,
		};
	},
};
</script>

<style scoped>
/* Badge */
:deep(.type span.Flow) {
	background: #e3f2fd;
	color: #1e88e5;
}
:deep(.type span.Operation) {
	background: #edf8ea;
	color: #18bf18;
}
:deep(.e-treecell span) {
	/* Layout */
	display: inline-block;
	position: relative;
	left: -8px;
	top: -1px;

	/* Style */
	border-radius: 50%;
	width: 16px;
	height: 16px;
	background: #393e56;
	color: white;
	font-weight: 500;

	/* Text */
	line-height: 17px;
	font-size: 11px;
	text-align: center;
}
</style>
