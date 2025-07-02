import { readonly } from "vue";
import { useIdBuilder } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";

import {
	AnnotationConstraints,
	NodeConstraints,
	ConnectorConstraints,
	PortConstraints,
	PortVisibility,
} from "@syncfusion/ej2-vue-diagrams";

export function useDiagram(diagramRef) {
	//==================== Config
	const SEPARATOR = "-";
	const { joinIdWith } = useIdBuilder(SEPARATOR);

	const CONSTRAINT = readonly({
		ANNOTATION_DEFAULT:
			AnnotationConstraints.InheritReadOnly |
			AnnotationConstraints.ReadOnly,
		ANNOTATION_SELECT: AnnotationConstraints.Select,

		// Node
		NODE_DEFAULT:
			NodeConstraints.Default &
			~NodeConstraints.Resize &
			~NodeConstraints.Rotate,
		NODE_LOCK:
			NodeConstraints.Default &
			~NodeConstraints.Resize &
			~NodeConstraints.Rotate &
			~NodeConstraints.Drag,
		NODE_DISABLE:
			NodeConstraints.Default &
			~NodeConstraints.Resize &
			~NodeConstraints.Rotate &
			~NodeConstraints.Select &
			~NodeConstraints.InConnect &
			~NodeConstraints.OutConnect,
		NODE_SHADOW: NodeConstraints.Shadow,

		// Connect
		CONNECTOR_DEFAULT:
			ConnectorConstraints.ConnectToNearByNode |
			(~ConnectorConstraints.BridgeObstacle &
				~ConnectorConstraints.Bridging),
		CONNECTOR_DISABLE:
			ConnectorConstraints.ConnectToNearByNode |
			(~ConnectorConstraints.BridgeObstacle &
				~ConnectorConstraints.Bridging &
				~ConnectorConstraints.Drag &
				~ConnectorConstraints.DragSourceEnd &
				~ConnectorConstraints.DragTargetEnd),
	});

	class ShadowConfig {
		constructor(angle, color, distance, opacity) {
			this.angle = angle ?? 45;
			this.color = color ?? "black";
			this.distance = distance ?? 2;
			this.opacity = opacity ?? 0.1;
		}
	}

	//==================== Style
	class StyleBase {
		constructor(fill, opacity, strokeColor, stokeWidth, strokeDashArray) {
			this.fill = fill ?? "white";
			this.opacity = opacity ?? 1;
			this.strokeColor = strokeColor;
			this.strokeWidth = stokeWidth;
			this.strokeDashArray = strokeDashArray;
		}
	}

	class StylePort extends StyleBase {
		constructor(fill, color, width) {
			super(fill, 1, color ?? fill, width ?? 1);
		}
	}

	class StyleConnector extends StyleBase {
		constructor(color, stokeWidth, strokeDashArray) {
			super(color, 1, color, stokeWidth, strokeDashArray);
		}
	}

	class StyleDecorator extends StyleBase {
		constructor(color) {
			super(color, 1, color);
		}
	}

	class StyleText extends StyleBase {
		constructor(color, fill, fontSize, bold = false) {
			super(fill, 1);

			this.color = color;
			this.fontSize = fontSize ?? 14;
			this.bold = bold;
			this.fontFamily = "Roboto";
		}
	}

	//==================== Annotation
	class AnnotationBase {
		constructor(content, color, fill = "#FFFFFF00", fontSize, bold) {
			this.content = content;
			this.constraints = CONSTRAINT.ANNOTATION_DEFAULT;
			this.style = new StyleText(color, fill, fontSize, bold);
		}
	}

	class AnnotationNode extends AnnotationBase {
		constructor(content, color, fill, fontSize, bold = true) {
			if (content?.length > 16) {
				content = `${content.slice(0, 15)}...`;
			}
			super(content, color, fill, fontSize, bold);
			this.offset = { x: 0 };
			this.margin = { left: 15 };
			this.horizontalAlignment = "Left";
			this.width = 100;
		}
	}

	class AnnotationConnector extends AnnotationBase {
		constructor(connectorId, content, fill, fontSize = 14) {
			super(content, "white", fill, fontSize, false);
			this.width = content.length * 11;
			this.height = fontSize * 1.3;
			this.zIndex = 1;

			// 재정의
			this.id = "annotation";
			this.annotationType = "Template";
			this.template = `<select id="${connectorId}-join" class="join-option"><option value="INNER JOIN">Inner Join</option><option value="LEFT JOIN">Left Join</option><option value="RIGHT JOIN">Right Join</option></select>`;
			this.constraints =
				CONSTRAINT.ANNOTATION_DEFAULT | CONSTRAINT.ANNOTATION_SELECT;
		}
	}

	//==================== Port
	const PORT_TYPE = readonly({
		LEFT: "Left",
		RIGHT: "Right",
		TOP: "Top",
		BOTTOM: "Bottom",
	});

	class PortBase {
		constructor(nodeId, type, x, y, width = 10, height = 10) {
			this.id = joinIdWith([nodeId, type]);
			this.width = width;
			this.height = height;
			this.offset = { x, y };
			this.visibility = PortVisibility.Hover;
			this.constraints = PortConstraints.Default | PortConstraints.Draw;
		}
	}

	class PortTop extends PortBase {
		constructor(nodeId, color) {
			super(nodeId, PORT_TYPE.TOP, 0.5, 0, 160, 10);

			this.verticalAlignment = "Top";
			this.shape = "Custom";
			this.style = new StylePort(color);
			this.pathData =
				"M5,0L145,0A5,5 0 0 1 150,5L150,10A0,0 0 0 1 0,10L0,5A5,5 0 0 1 5,0z";
			this.visibility = PortVisibility.Visible;
		}
	}
	class PortBottom extends PortBase {
		constructor(nodeId, color) {
			super(nodeId, PORT_TYPE.BOTTOM, 0.5, 1, 160, 10);

			this.verticalAlignment = "Bottom";
			this.shape = "Custom";
			this.style = new StylePort(color);
			this.pathData =
				"M0,0L150,0L150,5A5,5 0 0 1 145,10L5,10A5,5 0 0 1 0,5z";
			this.visibility = PortVisibility.Visible;
		}
	}

	class PortLeft extends PortBase {
		constructor(nodeId, size) {
			super(nodeId, PORT_TYPE.LEFT, 0, 0.5, size, size);

			this.style = new StylePort("#00000066", "white");
			this.shape = "Circle";
		}
	}

	class PortRight extends PortBase {
		constructor(nodeId, size) {
			super(nodeId, PORT_TYPE.RIGHT, 1, 0.5, size, size);

			this.style = new StylePort("#00000066", "white");
			this.shape = "Circle";
		}
	}

	function getNodeByPortId(id) {
		const nodeId = id.split(SEPARATOR).slice(0, -1).join(SEPARATOR);
		return diagramRef.value.getNodeObject(nodeId);
	}

	function activateNodesByHorizontalPorts(nodes, active = true, constraints) {
		for (const node of nodes) {
			const ports = [new PortLeft(node.id), new PortRight(node.id)];

			if (active) {
				diagramRef.value.addPorts(node, ports);
			} else {
				diagramRef.value.removePorts(node, ports);
			}

			node.constraints =
				(active ? CONSTRAINT.NODE_DEFAULT : CONSTRAINT.NODE_DISABLE) |
				constraints;
		}
	}

	//==================== Node
	const NODE_RECT = readonly({
		type: "Basic",
		shape: "Rectangle",
	});

	class NodeBase {
		constructor(id, height, width, offsetX = 0, offsetY = 0) {
			this.id = id;
			this.height = height;
			this.width = width;
			this.offsetX = offsetX;
			this.offsetY = offsetY;
			this.constraints = CONSTRAINT.NODE_DEFAULT;
			this.shape = NODE_RECT;

			// 초기화
			this.ports = [];
			this.annotations = [new AnnotationNode()];
		}

		/**
		 * 새로운 노드면 다이어그램에 추가합니다.
		 */
		add() {
			diagramRef.value.add(this);
		}
	}

	class NodeGroup extends NodeBase {
		constructor(id, nodes, color) {
			super(id);

			this.children = nodes.map(({ id }) => id);
			this.padding = { top: 10, bottom: 10 };
			this.style = new StyleBase(null, 1, null, 0);
			this.ports = [new PortTop(id, color), new PortBottom(id, color)];
		}
	}

	/**
	 * 다이어그램에 그룹 노드데이터를 추가한다.
	 * @param {String} id
	 * @param {Object[]} nodes
	 * @param {String|null} color
	 */
	function addGroupWithNodes(id, nodes, color = "") {
		// 자식 노드를 먼저 추가해야 함.
		nodes.forEach(node => node.add());

		// 그룹 노드 정의
		const group = new NodeGroup(id, nodes, color);
		group.add();
	}

	function getGroupNodes() {
		const { nodes } = diagramRef.value.ej2Instances;
		return nodes.filter(node => node.children);
	}

	function getNodesByIds(nodeIds) {
		const { nodes } = diagramRef.value.ej2Instances;
		return nodes.filter(({ id }) => nodeIds.includes(id));
	}

	function assignStyleToNodeByIds(nodeIds, style) {
		const { nodes } = diagramRef.value.ej2Instances;
		nodes
			.filter(({ id }) => nodeIds.includes(id))
			.forEach(node => (node.style = style));
	}

	//==================== Diagram Function
	/**
	 * 활성화된 다이어그램 레이어의 rect를 반환합니다.
	 * @returns {DOMRect}
	 */
	function getLayerRect() {
		const { diagramLayer } = diagramRef.value.ej2Instances;
		return diagramLayer.getBoundingClientRect();
	}

	/**
	 * @param {Object} target
	 * @param {Object|null} config
	 * @param {StyleBase} style
	 */
	function assignConfigWithStyle(target, config, style) {
		Object.assign(target, config);
		target.style = style;
	}

	function changeDiagramTool(tool) {
		diagramRef.value.clearSelection();
		diagramRef.value.ej2Instances.tool = tool;
	}

	return {
		// Config,
		SEPARATOR,
		CONSTRAINT,
		ShadowConfig,
		joinIdWith,

		// Style
		StyleBase,
		StyleConnector,
		StyleDecorator,

		// Annotation
		AnnotationBase,
		AnnotationNode,
		AnnotationConnector,

		// Port
		PortLeft,
		PortRight,
		getNodeByPortId,
		activateNodesByHorizontalPorts,

		// Node
		NODE_RECT,
		NodeBase,
		NodeGroup,
		addGroupWithNodes,
		getGroupNodes,
		getNodesByIds,
		assignStyleToNodeByIds,

		// Connector

		// Diagram Function
		getLayerRect,
		assignConfigWithStyle,
		changeDiagramTool,
	};
}
