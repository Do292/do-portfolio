import { provide, ref, readonly, computed } from "vue";
import {
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useModalConfig } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useCustomization,
	useGrid,
} from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";

import { ID, DATA_TYPE } from "~/system/modeler/constants/modeler_constants.js";
import { getColumnDef, getGridColumnDef } from "~/system/modeler/api/table";
import * as COMMON from "~/system/modeler/api/modeler-common.js";

const FLAG = readonly({ Y: "Y", N: "N" });

export function useColumnDef() {
	//==================== Grid Column
	const { fetchList } = useFetchData();
	const { deepCloneItems } = useItem();
	const { GridColumn } = useGrid();
	const gridColumns = ref([]); //GridColumnDef

	/**
	 * GridColumnDef로 칼럼을 초기화한다.
	 * @param {String|null} tableId
	 * @param {String|null} menuId
	 * @param {String|null} gridId
	 */
	async function fetchColumns(tableId, menuId, gridId = tableId) {
		if (tableId) {
			await fetchMetaColumns(tableId);
		}

		// menuId 검증, 없을 경우 api 호출하지 않음.
		const data = menuId
			? await fetchList(() => getGridColumnDef(menuId, gridId))
			: [];
		gridColumns.value = data.length
			? buildSortedColumns(data)
			: deepCloneItems(metaColumns.value);
	}

	/**
	 * 칼럼 데이터를 변환 후 정렬한다.
	 * @param {Object[]} columnDefs
	 * @returns {Object[]} columns
	 */
	function buildSortedColumns(columnDefs) {
		return columnDefs
			.map(columnDef => new GridColumn(columnDef))
			.sort((a, b) => a[ID.POSITION] - b[ID.POSITION]);
	}

	//==================== Meta
	class MetaGridColumn extends GridColumn {
		constructor(columnDef) {
			super(columnDef);

			this.field = columnDef[ID.META_DETAIL_ID].toUpperCase();
			this.headerText = columnDef[ID.LABEL] ?? this.field;
		}
	}

	const metaColumns = ref([]); //MetaDataDetail

	// Key Column
	const { checkColumnPrimary } = useFieldColumn();
	const keyColumns = computed(() =>
		metaColumns.value.filter(checkColumnPrimary),
	);

	/**
	 * ColumnDef로 칼럼을 초기화
	 * @param {String} tableId
	 */
	async function fetchMetaColumns(tableId) {
		const data = await fetchList(() => getColumnDef(tableId));
		metaColumns.value = buildMetaColumns(data);
	}

	/**
	 * 칼럼 데이터를 변환 후 정렬한다.
	 * @param {Object[]} columnDefs
	 * @returns {Object[]} columns
	 */
	function buildMetaColumns(columnDefs) {
		// Meta Data는 Position 사용
		columnDefs.sort((a, b) => a[ID.POSITION] - b[ID.POSITION]);
		return columnDefs
			.filter(columnDef => columnDef[ID.ENABLE_FLAG] !== FLAG.N)
			.map(columnDef => new MetaGridColumn(columnDef));
	}

	//==================== Config
	const FROZEN_CONFIG = readonly({
		allowReordering: false,
		freeze: "Left",
	});
	const columns = computed(() =>
		gridColumns.value.length ? gridColumns.value : metaColumns.value,
	);

	/**
	 * @param {String} field
	 * @returns {Object}
	 */
	function createFrozenColumn(field) {
		return createColumn({ field, ...FROZEN_CONFIG });
	}

	/**
	 * @param {Object} config
	 * @returns {Object}
	 */
	function createColumn(config) {
		const headerText = config.field;

		return Object.assign({ headerText }, config);
	}

	/**
	 * 기본 정보와 병합 (information.js config 형식)
	 * @param {Object|null} config
	 * @returns {Object}
	 */
	function mergeTableConfig(config = {}) {
		const columns = metaColumns.value;
		// MetaDataID를 tableId로 사용
		const { [ID.META_ID]: tableId } = columns[0] ?? {};

		return { tableId, columns, ...config };
	}

	return {
		// Column
		gridColumns,
		fetchColumns,

		// Meta
		metaColumns,
		keyColumns,
		fetchMetaColumns,

		// Config
		columns,
		FROZEN_CONFIG,
		createFrozenColumn,
		createColumn,
		mergeTableConfig,
	};
}

export function useFields(columnsRef, customPosition) {
	//==================== Fields
	const { checkColumnPrimary, checkColumnNumber } = useFieldColumn();
	const { createItem } = useItem();
	const fields = computed(() => extractFields(columnsRef.value));

	/**
	 * 유효한 columns의 field 값만 반환한다.
	 * @param {Object[]} columns
	 * @param {Function|null} validateColumn 컬럼 객체 유효한지 검사하는 함수로 boolean을 반환한다.
	 * @returns {String[]}
	 */
	function extractFields(columns, validateColumn = () => true) {
		return columns.filter(validateColumn).map(({ field }) => field);
	}

	/**
	 * @param {String} key
	 * @param {Object[]|null} columns
	 * @returns {Object}
	 */
	function findColumnByField(key, columns = columnsRef.value) {
		return columns.find(({ field }) => field === key);
	}

	/**
	 * config에 따라 item 프로퍼티 재정의하여 새로운 객체 반환
	 * @param  {Object} config 우선으로 설정할 값
	 * @param  {Object|null} baseItem columns의 field를 key로 가지고 있는 객체
	 * @param {Boolean|null} strict 타입을 엄격하게 고려할 건지
	 * @returns {Object}
	 */
	function assignFieldItem(config, baseItem = {}, strict) {
		const getValue = key => {
			const value = config[key] ?? baseItem[key] ?? null;
			// 변환이 필요 없거나 null이면 value 반환
			if (!strict || value === null) return value;

			// column 타입 검증해서 값 치환
			const column = findColumnByField(key);
			return checkColumnNumber(column) ? +value : `${value}`;
		};
		return createItem(fields.value, getValue);
	}

	//==================== Position
	const POSITION = customPosition ?? ID.POSITION;

	const hasPosition = computed(() => fields.value.includes(POSITION));

	//==================== Key Field
	const keyFields = computed(() =>
		extractFields(columnsRef.value, checkColumnPrimary),
	);

	// key field 기준으로 비교하기 위한 클로저 생성
	const keyFieldComparator = source => {
		return target => compareKeyField(target, source);
	};

	/**
	 * @param {Object} config
	 * @returns {Object}
	 */
	function createKeyItem(config) {
		return createItem(keyFields.value, key => config[key]);
	}

	/**
	 * 두 아이템의 key field 값을 비교; drag&drop 시, position 제외해야 target 정상 처리됨.
	 * @todo position 칼럼 확실히 통일되면 전역 상수로 정의
	 * @param {Object} a
	 * @param {Object} b
	 * @returns {Boolean}
	 */
	function compareKeyField(a, b) {
		return keyFields.value.every(
			key => key === POSITION || a[key] === b[key],
		);
	}

	return {
		// Fields
		fields,
		extractFields,
		findColumnByField,
		assignFieldItem,

		// Position
		POSITION,
		hasPosition,

		// Key Field
		keyFields,
		keyFieldComparator,
		createKeyItem,
		compareKeyField,
	};
}

const INPUT_TYPE = readonly({
	ALWAYS: "Always",
	CHANGE: "Change",
	NEVER: "Never",
});

export function useFieldColumn() {
	//==================== Common
	/**
	 * @param {Object} column 필드 칼럼
	 * @returns {Boolean} 필수 입력 필드인지
	 */
	function checkColumnRequired(column) {
		return (
			checkColumnPrimary(column) || column[ID.MANDATORY_FLAG] === FLAG.Y
		);
	}

	/**
	 * @param {Object} column
	 * @returns {Boolean}
	 */
	function checkColumnModifiable(column) {
		// PK 수정 불가능
		if (checkColumnPrimary(column)) return false;

		return [INPUT_TYPE.ALWAYS, INPUT_TYPE.CHANGE].includes(
			column[ID.INPUT_TYPE],
		);
	}

	/**
	 * @param {Object} column
	 * @returns {Boolean}
	 */
	function checkColumnPrimary(column) {
		return column[ID.PRIMARY_FLAG] === FLAG.Y;
	}

	/**
	 * @param {Object} column
	 * @returns {Boolean}
	 */
	function checkColumnFilterable(column) {
		return column[ID.FILTER_FLAG] === FLAG.Y;
	}

	/**
	 * @param {Object} column
	 * @returns {Boolean}
	 */
	function checkColumnVisible(column) {
		return column[ID.VISIBILITY_FLAG] !== FLAG.N;
	}

	/**
	 * @param {Object} column
	 * @returns {Boolean}
	 */
	function checkColumnFactory(column) {
		return column[ID.FIELD] === ID.FACTORY_ID;
	}

	/**
	 * @param {Object} column
	 * @returns {Boolean}
	 */
	function checkColumnNumber(column) {
		return [DATA_TYPE.LONG, DATA_TYPE.DOUBLE].includes(
			column[ID.DATA_TYPE],
		);
	}

	//==================== Combo
	const { fetchList } = useFetchData();
	const { createItem } = useItem();

	/**
	 * @param {String} dependentExpression
	 * @param {Object} target
	 * @returns {Object} dependency
	 */
	function createDependency(dependentExpression, target) {
		const dependents = parseExpression(dependentExpression);
		return createItem(dependents, key => target[key.toUpperCase()] ?? "");
	}

	/**
	 * Query에서 dependency 값들을 찾아내 문자열로 반환
	 * @param {String} query
	 * @returns {String}
	 */
	function defineDependency(query) {
		const pattern = /:(\w+)/gi;
		const dependencySet = new Set(query.match(pattern));

		return [...dependencySet]
			.map(dependency => dependency.substring(1))
			.join();
	}

	/**
	 * @param {String} expression
	 * @returns {Object[]}
	 */
	function parseExpression(expression) {
		const items = expression?.replace(/ /g, "")?.split(/[,|]/) ?? [];
		return items.map(item => item?.trim());
	}

	/**
	 * InputField, InputSearch 사용해서 data 형식 보존
	 * @param {String} expression
	 * @param {Object} dependency
	 * @returns {Promise<Object[]>} expression result
	 */
	async function getExpressionResultByQuery(expression, dependency) {
		if (expression) {
			return await fetchList(() =>
				COMMON.getByQuery(expression, dependency),
			);
		} else {
			return [];
		}
	}

	return {
		// Common
		checkColumnRequired,
		checkColumnModifiable,
		checkColumnPrimary,
		checkColumnFilterable,
		checkColumnVisible,
		checkColumnFactory,
		checkColumnNumber,

		// Combo
		createDependency,
		defineDependency,
		parseExpression,
		getExpressionResultByQuery,
	};
}

export function useFiltering(columnsRef, condition = {}) {
	//==================== Config
	const { isShowModal: isShowModalFilter, toggleModal: toggleModalFilter } =
		useModalConfig();
	const { fields, extractFields } = useFields(columnsRef);
	const { checkColumnFilterable, checkColumnFactory } = useFieldColumn();
	const filterConfig = ref({});

	const filters = computed(() =>
		columnsRef.value.filter(
			column =>
				checkColumnFilterable(column) &&
				!(column[ID.FIELD] in condition) &&
				!checkColumnFactory(column),
		),
	);
	const filteredFields = computed(() =>
		extractFields(filters.value, ({ field }) => filterConfig.value[field]),
	);
	const hasFilter = computed(() => filters.value.length);
	const isFiltering = computed(() => filteredFields.value.length > 0);
	const caseSensitive = ref(false);

	// ButtonFilter, ModalFilter에서 사용
	provide("filter", {
		filters,
		filteredFields,
		filterConfig,
		isFiltering,
		caseSensitive,
		isShowModalFilter,
		toggleModalFilter,
	});

	//==================== Grid
	const { createContainer, createBadge, replaceCell } = useCustomization();

	const FILTER_CLASS = "filtered";
	const isFieldFiltered = field => filteredFields.value.includes(field);

	/**
	 * 필터링 여부를 기준으로 field header class 토글한다.
	 * @param {ref<GridTemplate>} templateRef
	 */
	function highlightFilterHeader(templateRef) {
		for (const field of fields.value) {
			const $header = templateRef.value.getHeaderByField(field);
			$header.classList.toggle(FILTER_CLASS, isFieldFiltered(field));
		}
	}

	/**
	 * @param {HTMLTableCellElement} cell
	 * @param {String} field
	 * @param {String} value
	 */
	function highlightFilterCell(cell, field, value) {
		if (!isFieldFiltered(field)) {
			return;
		}

		// 필터 조건 기반으로 정규표현식 선언
		const ignoreCaseFlag = caseSensitive.value ? "" : "i";
		const pattern = new RegExp(filterConfig.value[field], ignoreCaseFlag);

		const index = value.search(pattern);
		const [target] = value.match(pattern);

		// Split textValue
		const prefix = value.substring(0, index);
		const suffix = value.substring(index + target.length);
		const $highlight = createBadge(target, FILTER_CLASS);

		// 기존 cell 교체
		const $container = createContainer(prefix, $highlight, suffix);
		replaceCell(cell, $container);
	}

	return {
		// Config
		filterConfig,
		filters,
		hasFilter,
		isFiltering,
		caseSensitive,
		toggleModalFilter,

		// Grid
		highlightFilterHeader,
		highlightFilterCell,
	};
}
