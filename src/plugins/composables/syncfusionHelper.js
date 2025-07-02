import { computed, readonly } from "vue";
import { useItem } from "~/plugins/composables/dataHandler";
import { useSystem } from "~/plugins/composables/authority";
import { UPPER_ID, CAMEL_ID } from "~/constants/common_constants.js";

//==================== UI Builder
export function useIdBuilder(separator) {
	/**
	 * @param {String[]} keys
	 * @returns {String}
	 */
	function joinIdWith(keys) {
		return keys.join(separator);
	}

	return {
		joinIdWith,
	};
}

//==================== Template
export function useTemplate(type = "syncfusion") {
	const SEPARATOR = "-";
	const { joinIdWith } = useIdBuilder(SEPARATOR);

	class Base {
		#key = ""; // Private
		static #index = 0;

		constructor(key) {
			this.#key = key;
			this.content = `#${getIdBy(key)}`;

			// 인덱스 증가
			this.index = Base.#index++;
		}

		/**
		 * @returns {String}
		 */
		getKey() {
			return this.#key;
		}

		/**
		 * 태그 id로 사용하기 위한 문자열 반환
		 * @returns {String}
		 */
		getId() {
			return getIdBy(this.#key);
		}

		/**
		 * @returns {Number}
		 */
		static getBaseIndex() {
			return Base.#index;
		}
	}

	/**
	 * key와 type을 조합해 id 반환
	 * @param {String} key
	 * @returns {String}
	 */
	function getIdBy(key) {
		return joinIdWith([key, type]);
	}

	return { Base, getIdBy, joinIdWith };
}

//==================== Grid
import { FLAG } from "~/plugins/wfb-constants.js";

export function useGrid() {
	//==================== Column Template
	const { Base } = useTemplate();

	const COLUMN_TEMPLATE = readonly({
		SWITCH: "column-switch",
		CHECKBOX: "column-checkbox",
		HOVER: "column-hover",
		NUMERIC: "column-numeric",
		COMBO: "column-combobox",
		TEXTBOX: "column-textbox",
	});

	const HEADER_TEMPLATE = readonly({
		CHECKBOX: "header-checkbox",
	});

	class ColumnTemplate extends Base {
		constructor(key) {
			super(key);
		}

		/**
		 * @param {Object} data ejs-grid 템플릿 바인딩 객체
		 * @param {Object} data.column 칼럼 정보
		 * @param {Object} data.column.field 칼럼 키
		 * @returns {String}
		 */
		getValueBy(data) {
			return data[data.column.field];
		}
	}

	class HeaderTemplate extends Base {
		constructor(key) {
			super(key);
		}

		/**
		 * @param {Object} data ejs-grid 템플릿 바인딩 객체
		 * @param {Object} data.field 칼럼 키
		 * @returns {String}
		 */
		getValueBy(data) {
			return data.field;
		}
	}

	const columnTemplates = computed(() =>
		Object.values(COLUMN_TEMPLATE).map(key => new ColumnTemplate(key)),
	);

	const headerTemplates = computed(() =>
		Object.values(HEADER_TEMPLATE).map(key => new HeaderTemplate(key)),
	);

	/**
	 * @param {String} field
	 * @returns {String|null}
	 */
	function validateColumnTemplate(field) {
		if (/(flag$)|(useYN)/i.test(field)) {
			return COLUMN_TEMPLATE.SWITCH;
		}

		return null;
	}
	//==================== Grid Column
	const COLUMN_TYPE = readonly({
		LocalDateTime: "DateTime",
		LocalDate: "Date",
		Long: "Number",
		String: "String",
	});
	const COLUMN_FORMAT = readonly({
		Date: "yyyy-MM-dd",
		DateTime: "yyyy-MM-dd HH:mm:ss",
	});
	const COLUMN_ALIGN = readonly({
		LEFT: "left",
		CENTER: "center",
		RIGHT: "right",
	});

	// System 정의
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

	class GridColumn {
		constructor(columnDef) {
			// Column 정보 할당
			Object.keys(columnDef).forEach(key => {
				this[key] = columnDef[key];
			});

			// Config
			this.field = systemInfo.commonFlag
				? columnDef[ID.COLUMN_ID]
				: columnDef[ID.COLUMN_ID].toUpperCase();

			this.headerText = columnDef[ID.LABEL] ?? columnDef[ID.COLUMN_ID];
			this.visible = columnDef[ID.VISIBILITY_FLAG] !== FLAG.N;

			// Style
			this.width = columnDef[ID.WIDTH] ?? 50;
			this.type = COLUMN_TYPE[columnDef[ID.DATA_TYPE]];
			this.format = COLUMN_FORMAT[this.type];

			// Align
			const defaultAlign = columnDef[ID.TEXT_ALIGN] ?? COLUMN_ALIGN.LEFT;
			this.textAlign = /sequence$/i.test(this.field)
				? COLUMN_ALIGN.CENTER
				: defaultAlign;

			// Template 1
			const columnTemplate = validateColumnTemplate(this.field);
			if (columnTemplate) {
				this.template = columnTemplate;
				this.textAlign = COLUMN_ALIGN.CENTER;
			}

			// Template 2
			if (this.cellType) {
				const cTemplate =
					COLUMN_TEMPLATE[this.cellType.toUpperCase()] ?? null;
				if (cTemplate) {
					this.template = cTemplate;
					// this.textAlign = COLUMN_ALIGN.CENTER;
				}
			}
		}
	}

	//==================== Grid Form
	class GridBase {
		#key = "";

		constructor(key, condition, items) {
			this.#key = key;
			this.tableId = key;
			this.condition = condition;
			this.customItems = items;
		}

		/**
		 * @returns {string}
		 */
		getKey() {
			return this.#key;
		}
	}

	return {
		// Template
		COLUMN_TEMPLATE,
		HEADER_TEMPLATE,
		columnTemplates,
		headerTemplates,
		validateColumnTemplate,

		// Grid Column
		GridColumn,

		// Grid Form
		GridBase,
	};
}

//==================== Customization
import { AIMCON } from "~/plugins/wfb-constants.js";

export function useCustomization() {
	const GRID_SELECTOR = readonly({
		TABLE: ".e-gridcontent table",
		HEADER: ".e-headercell",
		MOVABLE_HEADER: ".e-movableheader",
		MOVABLE_CONTENT: ".e-movablecontent",
		MOVABLE_ROW: ".e-movablecontent .e-row",
		CHECKBOX_WRAPPER: ".e-checkbox-wrapper",
		ICON_FRAME: ".e-icons.e-frame",
	});

	const GRID_TAG = readonly({
		COLUMN: "col",
	});

	/**
	 * @param {HTMLElement} target
	 * @param {String} selector
	 * @param {String} tag
	 * @returns {HTMLElement[]}
	 */
	function findElementsByTagInSelector(target, selector, tag) {
		const $elements = target
			.querySelector(selector)
			.getElementsByTagName(tag);

		return [...$elements];
	}

	/**
	 * @param {(String|Node)[]} contents
	 * @returns {DocumentFragment}
	 */
	function createContainer(...contents) {
		const $container = document.createDocumentFragment();

		contents.forEach(content => {
			const $child = validateNode(content);
			if ($child) {
				$container.appendChild($child);
			}
		});
		return $container;
	}

	/**
	 * @param {String} text
	 * @param {String|null} className
	 * @returns {HTMLSpanElement}
	 */
	function createBadge(text, className) {
		const $text = document.createTextNode(text);
		const $span = document.createElement("span");

		$span.appendChild($text);
		// ClassName 있는 경우만 추가
		if (className) {
			$span.classList.add(className);
		}
		return $span;
	}

	/**
	 * @param {Node|String} content
	 * @returns {Node|null}
	 */
	function validateNode(content) {
		if (content instanceof Node) {
			return content;
		} else if (typeof content === "string") {
			return document.createTextNode(content);
		} else {
			return null;
		}
	}

	/**
	 * 단일 노드 셀을 target으로 교체한다.
	 * @param {HTMLTableCellElement} cell
	 * @param {HTMLElement} target
	 * @param {String|null} className
	 */
	function replaceCell(cell, target, className) {
		cell.replaceChild(target, cell.firstChild);
		cell.classList.add(className?.toLowerCase());
	}

	/**
	 * 요소의 맨 앞에 아이콘을 추가한다.
	 * @param {HTMLElement} element
	 * @param {String} type
	 */
	function prependIcon(element, type) {
		const $icon = document.createElement("i");
		$icon.classList.add(`aimcons_${AIMCON[type]}`, type);

		element.insertBefore($icon, element.firstChild);
	}

	/**
	 * @param {HTMLElement[]} elements
	 * @param {String} className
	 * @param {Boolean|null} force
	 */
	function toggleClass(elements, className, force) {
		[...elements].forEach(el => el.classList.toggle(className, force));
	}

	/**
	 * @param {HTMLTableCellElement} cell
	 * @param {String} key
	 * @param {String} value
	 * @param {RegExp|null} customPattern
	 * @returns {Boolean}
	 */
	function validateBadgeToCell(cell, key, value, customPattern) {
		if (!String(value ?? "").trim()) {
			return false;
		}

		const applyBadgePattern = (pattern, className) => {
			const match = key.match(pattern);
			if (match) {
				const $badge = createBadge(value, className);
				replaceCell(cell, $badge, match[0]);
				return true;
			}
			return false;
		};

		// default badge
		const badgePattern = /(type|state|sequence|seq)$/i;
		if (applyBadgePattern(badgePattern, String(value).replace(/ /g, ""))) {
			return true;
		}

		// custom badge
		if (customPattern && applyBadgePattern(customPattern)) {
			return true;
		}

		return false;
	}

	return {
		GRID_SELECTOR,
		GRID_TAG,

		findElementsByTagInSelector,
		createContainer,
		createBadge,
		replaceCell,
		prependIcon,
		toggleClass,
		validateBadgeToCell,
	};
}

//==================== Icon
export function useIcon() {
	const ICON_CSS = readonly({
		ADD_TABLE: "e-circle-add",
		DELETE: "e-trash",
		LOCK: "e-lock",
		PAN: "e-pan",
		REDO: "e-redo",
		SELECT: "e-mouse-pointer",
		UNDO: "e-undo",
		RESET: "e-reset",
		ZOOM_IN: "e-zoom-in",
		ZOOM_OUT: "e-zoom-out",
	});

	const ICON_TYPE = readonly(
		Object.fromEntries(Object.keys(ICON_CSS).map(key => [key, key])),
	);

	/**
	 * @param {String} type ICON_TYPE
	 * @returns {String|null}
	 */
	function getIconStyle(type) {
		const iconCss = ICON_CSS[type];
		return iconCss ? `e-icons ${iconCss}` : null;
	}

	return {
		ICON_CSS,
		ICON_TYPE,
		getIconStyle,
	};
}

//==================== Tree
export const ROOT = "Root";
export const NODE_FIELD = readonly({
	ID: "NODEID",
	CHILDREN: "CHILD_NODE",
});

// 서버 dto
export const DTO_FIELD = readonly({
	ID: "childNodeColumn",
	PARENT_ID: "parentNodeColumn",
	TABLE_ID: "tableId",
});

export function useTree() {
	//==================== Config
	/**
	 * @param {Object} config
	 * @param {Object|null} condition
	 * @returns {Object} DTO
	 */
	function formatTreeDTO(config, condition = {}) {
		const entries = Object.entries(DTO_FIELD);
		return entries.reduce(
			(acc, [key, value]) => {
				acc[value] = config[key];
				return acc;
			},
			{ condition },
		);
	}

	//==================== Tree Node
	const { ID, CHILDREN } = NODE_FIELD;
	const { groupByItems } = useItem();

	/**
	 * @param {String} nodeId
	 * @param {Object[]} child
	 * @param {Object|null} config
	 * @returns {Object}
	 */
	function formatTreeNodeByChildren(nodeId, children = [], config = {}) {
		return { [ID]: nodeId, [CHILDREN]: children, ...config };
	}

	/**
	 * @param {String} nodeId
	 * @param {Object|null} config
	 * @returns {Object}
	 */
	function formatTreeNodeByParent(nodeId, config) {
		return Object.assign(
			{ [ID]: nodeId, hasChildren: true, expanded: true },
			config ?? {},
		);
	}

	/**
	 * 데이터 상위에 루트 노드를 정의한다
	 * @param {Object[]|null} items
	 * @param {String|null} rootId
	 * @returns {Object[]}
	 */
	function defineTreeNodesWithRoot(items = [], rootId = ROOT) {
		const config = { expanded: true, selected: true };
		return [formatTreeNodeByChildren(rootId, items, config)];
	}

	/**
	 * @param {String} key
	 * @param {Object[]} items
	 * @returns {Object[]}
	 */
	function groupIntoTreeNodes(key, items = []) {
		const groupItem = groupByItems(key, items);
		return Object.entries(groupItem).map(([id, children]) =>
			formatTreeNodeByChildren(id, children),
		);
	}

	return {
		// DTO
		formatTreeDTO,

		// Node
		formatTreeNodeByChildren,
		formatTreeNodeByParent,
		defineTreeNodesWithRoot,
		groupIntoTreeNodes,
	};
}
