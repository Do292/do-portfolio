<template>
	<div class="toolbar-box">
		<div class="e-diagram-toolbar">
			<ToolbarTemplate
				ref="toolbarRef"
				:itemGroups="toolbarGroups"
				@clicked="handleToolbar"
			/>
		</div>
		<div class="diagram-box">
			<ejs-diagram
				ref="diagramRef"
				:getConnectorDefaults="initConnector"
				:positionChange="changePosition"
				:snapSettings="snapSettings"
				@collectionChange="changeCollection"
				@selectionChange="changeSelection"
			></ejs-diagram>
		</div>
	</div>
</template>

<script>
import { DiagramComponent, DiagramTools } from "@syncfusion/ej2-vue-diagrams";
import ToolbarTemplate from "~/system/modeler/components/common/template/ToolbarTemplate";

import {
	readonly,
	ref,
	watch,
	onMounted,
	nextTick,
	reactive,
	computed,
} from "vue";
import { useIcon } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useDiagram } from "~/system/modeler/plugins/composables/modeler-diagramHelper";
import { useModalSearch } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useColumnDef } from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import { TABLE, ID } from "~/system/modeler/constants/modeler_constants.js";
import * as COMMON from "~/system/modeler/api/modeler-common";

export default {
	name: "QueryBuilderToolbar",
	components: {
		"ejs-diagram": DiagramComponent,
		ToolbarTemplate,
	},
	props: {
		tables: { type: Array },
	},
	emits: ["addTable"],
	setup(props, { emit }) {
		//==================== Common
		const { openModalWarning } = useModalAlert();

		//==================== Toolbar Config
		const toolbarRef = ref(null);
		const { ICON_TYPE } = useIcon();
		const { ADD_TABLE, DELETE, LOCK, PAN, SELECT, ZOOM_IN, ZOOM_OUT } =
			ICON_TYPE;

		const toolbarGroups = [
			[ADD_TABLE],
			[DELETE, LOCK, SELECT, PAN],
			[ZOOM_IN, ZOOM_OUT],
		];

		/**
		 * key를 인자로 받아 툴바 아이템을 활성화한다
		 * @param {Boolean} active
		 * @param {String[]} keys
		 */
		function activateToolbarItemsBy(active, keys) {
			const { toolbarItems } = toolbarRef.value;
			toolbarItems
				.filter(item => keys.includes(item.getKey()))
				.forEach(item => item.activate(active));
		}

		/**
		 * 클릭한 아이템의 key 값을 기준으로 로직 수행
		 * @param {Object} config
		 * @param {ItemDirective} config.item
		 * @param {String} config.item.key
		 */
		function handleToolbar({ item: { key } }) {
			switch (key) {
				case ADD_TABLE:
					searchTable();
					break;
				case DELETE:
					diagramRef.value.remove();
					break;
				case LOCK:
					lockSelectedTableNodes();
					break;
				case SELECT:
					changeDiagramTool(DiagramTools.Default);
					break;
				case PAN:
					changeDiagramTool(DiagramTools.ZoomPan);
					break;
			}
		}

		// 비활성화 설정
		onMounted(() => activateToolbarItemsBy(false, [DELETE, LOCK]));

		//==================== Diagram Config
		const diagramRef = ref(null);
		const {
			// Config
			SEPARATOR,
			CONSTRAINT,
			ShadowConfig,
			joinIdWith,

			// Style
			StyleBase,
			StyleConnector,
			StyleDecorator,

			// Annotation
			AnnotationNode,
			AnnotationConnector,

			// Port
			getNodeByPortId,
			activateNodesByHorizontalPorts,

			// Node
			NodeBase,
			addGroupWithNodes,
			getGroupNodes,
			getNodesByIds,

			// Function
			getLayerRect,
			assignConfigWithStyle,
			changeDiagramTool,
		} = useDiagram(diagramRef);

		const NODE_TYPE = readonly({
			HEADER: "header",
			COLUMN: "column",
		});

		const COLOR = readonly({
			TEXT: "#5C5C5C",
			POINT: "#356C9A",
			BORDER: "#E0E0E0",
			PORT: "#B9BDCA",
			COLUMN: "#FBFBFB ",
		});

		// 테이블 헤더 노드
		class NodeHeader extends NodeBase {
			constructor(tableId, offsetX) {
				const id = joinIdWith([tableId, NODE_TYPE.HEADER]);
				super(id, 50, 160, offsetX, 120);

				this.annotations = [
					new AnnotationNode(tableId, COLOR.TEXT, null, 16),
				];
				this.style = new StyleBase(null, null, COLOR.BORDER, 0.5);
				this.addInfo = { type: NODE_TYPE.HEADER };

				// 재정의
				this.constraints = CONSTRAINT.NODE_DISABLE;
			}
		}

		// 테이블 칼럼 노드
		class NodeColumn extends NodeBase {
			constructor(column, index, offsetX) {
				const id = joinIdWith([
					column[ID.META_ID],
					column[ID.META_DETAIL_ID],
				]);
				super(id, 30, 160, offsetX);

				this.annotations = [
					new AnnotationNode(
						column[ID.META_DETAIL_ID],
						COLOR.TEXT,
						COLOR.COLUMN,
						null,
						false,
					),
				];
				this.style = new StyleBase(COLOR.COLUMN, 1, COLOR.BORDER, 0.5);
				this.shadow = new ShadowConfig();
				this.addInfo = { type: NODE_TYPE.COLUMN };

				// 재정의
				this.constraints = CONSTRAINT.NODE_DISABLE;
				this.offsetY = 128 + (index + 1) * this.height;
			}
		}

		//==================== Table Node
		const { targetItems, openModalSearch, initSearchItems } =
			useModalSearch(diagramRef);
		const { fetchList } = useFetchData();
		const { filterItem } = useItem();

		function getTableIdBy(id) {
			return id.split(SEPARATOR)[0];
		}

		/**
		 * ModalSearch config 설정을 해준다.
		 */
		async function searchTable() {
			const data = await fetchList(() => COMMON.getBy(TABLE.META_DATA));
			// 이미 선택된 테이블 배제
			const items = data
				.filter(item => !props.tables.includes(item[ID.META_ID]))
				.map(item => filterItem(item, [ID.SYSTEM_ID, ID.META_ID]));

			openModalSearch({ field: ID.META_ID, items });
		}

		/**
		 * 테이블과 칼럼 노드를 추가한다.
		 * @param {String} tableId
		 */
		async function addTableNode(tableId) {
			if (props.tables.includes(tableId)) {
				openModalWarning("이미 선택한 테이블입니다.");
				return;
			}

			const { metaColumns, fetchMetaColumns } = useColumnDef();
			await fetchMetaColumns(tableId);

			// 칼럼 노드
			const { right } = getLayerRect();
			const offsetX = right - 350;
			const nodes = metaColumns.value.reduce(
				(acc, cur, index) => {
					acc.push(new NodeColumn(cur, index, offsetX));
					return acc;
				},
				[new NodeHeader(tableId, offsetX)],
			);

			addGroupWithNodes(tableId, nodes, COLOR.POINT);
			emit("addTable", tableId, metaColumns.value);
		}

		/**
		 * 선택된 테이블 노드를 잠금/해제
		 */
		function lockSelectedTableNodes() {
			const { nodes } = diagramRef.value.ej2Instances.selectedItems;
			const shouldLock = nodes.some(
				node => node.constraints !== CONSTRAINT.NODE_LOCK,
			);

			// 노드의 costraints 설정 변경
			for (const node of nodes) {
				node.constraints = shouldLock
					? CONSTRAINT.NODE_LOCK
					: CONSTRAINT.NODE_DEFAULT;
			}
		}

		function activateColumnNodes(nodeIds, active) {
			const nodes = getNodesByIds(nodeIds);
			const annotationColor = active ? COLOR.POINT : COLOR.HEADER;

			for (const node of nodes) {
				node.annotations[0].style.color = annotationColor;
			}
		}

		// ModalSearch에서 선택한 테이블 추가
		watch(
			() => targetItems.value,
			items => {
				if (items) {
					items.forEach(item => addTableNode(item[ID.META_ID]));
					initSearchItems();
				}
			},
		);

		// 삭제한 테이블 diagram에서도 삭제
		watch(
			() => props.tables.length,
			() => {
				const removedTables = getGroupNodes().filter(
					node => !props.tables.includes(node.id),
				);
				removedTables.forEach(node => diagramRef.value.remove(node));
			},
		);

		//==================== Diagram Connector
		const connectorMap = reactive(new Map());
		const connectors = computed(() => [...connectorMap.values()]);

		function getConnectedIdSet() {
			const idSet = new Set(
				connectors.value.flatMap(({ targetID, sourceID }) =>
					[targetID, sourceID].filter(id => id),
				),
			);
			return idSet;
		}

		function getConnectedTableIdSet() {
			const connectedIds = [...getConnectedIdSet()];
			const tableIdSet = new Set(
				connectedIds.map(id => getTableIdBy(id)),
			);
			return tableIdSet;
		}

		function checkConnectorFromTable(connector) {
			const node = getNodeByPortId(connector.sourcePortID);
			return node.children?.length > 0;
		}

		/**
		 * @param {Boolean} active
		 */
		function activateConnectedTableColumns(active) {
			const { nodes } = diagramRef.value.ej2Instances;
			for (const tableId of getConnectedTableIdSet()) {
				// 헤더 노드 배제
				const columnNodes = nodes.filter(
					({ parentId, addInfo }) =>
						parentId === tableId &&
						addInfo?.type === NODE_TYPE.COLUMN,
				);
				// 칼럼 노드 활성화
				activateNodesByHorizontalPorts(columnNodes, active);
			}
		}

		function activateTableNodes(active) {
			const nodes = getGroupNodes();
			activateNodesByHorizontalPorts(nodes, active);
		}

		function validateConnector(connector) {
			const { id, targetID, sourceID } = connector;
			const isFromTable = checkConnectorFromTable(connector);

			// 새로운 connector는 map에 추가하고 칼럼 노드들을 비활성화함.
			if (!connectorMap.has(id)) {
				if (isFromTable) {
					// Table
					activateConnectedTableColumns(false);
				} else {
					// 칼럼
					activateTableNodes(false);
				}
				connectorMap.set(id, connector);
				return true;
			}

			// 칼럼 노드 다시 활성화
			activateTableNodes(true);
			activateConnectedTableColumns(true);

			// 타겟이 없거나 같은 노드에 붙은 경우 실패로 처리하며 map에서 삭제
			const isConnectedAlready = connectors.value.some(
				connector =>
					connector.targetID === targetID &&
					connector.sourceID === sourceID,
			);
			const isConnectable = targetID && sourceID && targetID !== sourceID;
			if (!isConnectable || !isConnectedAlready) {
				connectorMap.delete(id);
				return false;
			}

			if (isFromTable) {
				connector.annotations = [
					new AnnotationConnector(id, "InnerJoin", COLOR.POINT, 16),
				];
			} else {
				activateColumnNodes([targetID, sourceID], true);
			}

			return true;
		}

		/**
		 * Connector를 초기화한다.
		 * @param {Object} connector
		 */
		function initConnector(connector) {
			if (!validateConnector(connector)) {
				// 연결 실패 시, 즉시 삭제
				nextTick(() => {
					diagramRef.value.remove(connector);
				});
				return;
			}

			// Connector
			const color = connector.targetID ? COLOR.POINT : COLOR.PORT;
			initConnectorConfig(connector, color);

			// Decorator
			const { sourceDecorator, targetDecorator } = connector;
			initDecoratorConfig(sourceDecorator, color);
			initDecoratorConfig(targetDecorator, color);
		}

		/**
		 * @param {Object} connector
		 * @param {String} color
		 */
		function initConnectorConfig(connector, color) {
			const config = {
				cornerRadius: 3,
				constraints: connector.targetID
					? CONSTRAINT.CONNECTOR_DISABLE
					: CONSTRAINT.CONNECTOR_DEFAULT,
			};
			const style = checkConnectorFromTable(connector)
				? new StyleConnector(color, 2)
				: new StyleConnector(color, 1.5, "4 5");
			assignConfigWithStyle(connector, config, style);
		}

		/**
		 * @param {Object} connector
		 * @param {String} color
		 */
		function initDecoratorConfig(decorator, color) {
			const config = {
				shape: "Circle",
				pivot: { x: 0.5 },
				height: 7,
				width: 7,
			};
			const style = new StyleDecorator(color);
			assignConfigWithStyle(decorator, config, style);
		}

		//==================== Diagram Event
		const checkColumn = element =>
			"children" in element && !element.children;

		/**
		 * @param {Object} e
		 */
		function changeCollection(e) {
			switch (e.type) {
				case "Removal":
					handleRemoval(e);
			}
		}

		/**
		 * @param {Object} e
		 * @param {String} e.cause
		 * @param {Object} e.element
		 */
		function handleRemoval({ cause, element: { id, propName } }) {
			// 상위 Group에 의해 삭제된 경우 배제
			if (cause !== 2) return;

			if (propName === "nodes") {
				emit("removeTable", id);
			} else if (propName === "connectos") {
				connectorMap.delete(id);
			}
		}

		/**
		 * 선택 값 변경에 따른 로직 수행
		 * @param {Object} event
		 */
		function changeSelection({ state, newValue }) {
			if (state === "Changing") {
				// 선택 데이터가 있는지에 따라 delete, lock을 활성화한다.
				const active = newValue.length && !newValue.some(checkColumn);
				activateToolbarItemsBy(active, [DELETE, LOCK]);
			}
		}

		function changePosition(event) {
			const { source } = event;
			if (checkColumn(source) || source.nodes?.some(checkColumn)) {
				event.cancel = true;
			}
		}

		//==================== Table Join
		class JoinConfig {
			constructor({ id, sourceID, targetID }) {
				this.sourceID = sourceID;
				this.targetID = targetID;
				this.joinType = document.getElementById(`${id}-join`).value;
				this.conditions = [];
			}

			validateColumn({ sourceID, targetID }) {
				const conditions = [
					new ConditionConfig(sourceID),
					new ConditionConfig(targetID),
				];

				const { column: sourceColumn } =
					conditions.find(({ table }) => table === this.sourceID) ??
					{};
				const { column: targetColumn } =
					conditions.find(({ table }) => table === this.targetID) ??
					{};

				if (sourceColumn && targetColumn) {
					this.conditions.push({ sourceColumn, targetColumn });
				}
			}

			getJoinClause() {
				let clause = `\n${this.joinType}\n\t${this.targetID}`;

				if (this.conditions.length) {
					const conditionStr = this.conditions
						.map(
							({ sourceColumn, targetColumn }) =>
								`${sourceColumn} = ${targetColumn}`,
						)
						.join("\n\tAND ");

					clause += ` ON ${conditionStr}`;
				}
				return clause;
			}
		}

		class ConditionConfig {
			constructor(id) {
				this.table = getTableIdBy(id);
				this.column = id.replace(SEPARATOR, ".");
			}
		}

		function getJoinQuery() {
			const tableIdSet = getConnectedTableIdSet();
			const joinConfigs = connectors.value
				.filter(({ sourceID }) => tableIdSet.has(sourceID))
				.map(connector => new JoinConfig(connector));

			for (const connector of connectors.value) {
				if (!tableIdSet.has(connector.sourceID)) {
					joinConfigs.forEach(config =>
						config.validateColumn(connector),
					);
				}
			}

			// BaseTable 지정
			let query = [...tableIdSet]?.[0] ?? props.tables[0];
			for (const config of joinConfigs) {
				query += config.getJoinClause();
			}
			return query;
		}

		return {
			// Config
			toolbarRef,
			toolbarGroups,
			handleToolbar,

			// Diagram Config
			diagramRef,
			snapSettings: {
				gridType: "Dots",
				horizontalGridlines: {
					lineColor: "#DAD9E6",
				},
				verticalGridlines: {
					lineColor: "#DAD9E6",
				},
			},

			// Connector
			connectorMap,
			initConnector,

			// Diagram Event
			changeCollection,
			changeSelection,
			changePosition,

			// Join Query
			getJoinQuery,
		};
	},
};
</script>

<style scoped>
/* Toolbar */
.toolbar-box {
	background: #f7f7f7;
	margin-top: 10px;
	height: calc(100vh - 260px);
	border-radius: 7px;
	border: 1px solid #e0e0e0;
	overflow: hidden;
	padding: 1px;
	position: relative;
}
#toolbar {
	position: absolute;
	top: 10px;
	left: 50%;
	transform: translateX(-50%);
	background: white !important;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	width: fit-content !important;
	padding-right: 10px;
	z-index: 10;
}

/* Diagram */
.diagram-box {
	position: relative;
	width: 100%;
	height: 100%;
	border: 1px solid #e0e0e000;
	border-radius: 5px;
	overflow: hidden;
}
.e-diagram {
	background-color: #f7f7f7;
}
.e-diagram > :deep(div) {
	background: #ffffff00 !important;
	border-radius: 5px;
	height: 100% !important;
}
.e-diagram > :deep(div rect) {
	/* rx: 5;
	ry: 5; */
}

/* Selection */
.e-diagram :deep(.join-option) {
	width: 100%;
	height: 100%;

	border: 2px solid #356c9a;
	background-color: #356c9a;
	color: white;
	padding-left: 1px;
	font-size: 14px;
	border-radius: 3px;
	cursor: pointer;
}
</style>
