import { provide, ref, readonly, computed } from "vue";
import { useFetchData, useItem } from "~/plugins/composables/dataHandler";
import { useModalConfig } from "~/plugins/composables/modalHandler";
import {
	useCustomization,
	useGrid,
} from "~/plugins/composables/syncfusionHelper";

import { useSystem } from "~/plugins/composables/authority.js";
import { UPPER_ID, CAMEL_ID, DATA_TYPE } from "~/constants/common_constants.js";
import { FLAG, INPUT_TYPE, ACTION } from "~/plugins/wfb-constants.js";
import {
	getTableDef,
	getGridTableDef,
	getColumnDef,
	getGridColumnDef,
	getMetaData,
} from "~/api/system-common";
import {
	getMetaDataDetail,
	getByCustomQuery,
	getSearchConditionDetail,
} from "~/api/system-common.js";
import * as MODELER_COMMON from "~/system/modeler/api/modeler-common.js";

export function useColumnDef() {
	//==================== System
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

	//==================== Column
	const { GridColumn } = useGrid();
	const gridColumns = ref([]); //GridColumnDef

	/**
	 * ColumnDef로 칼럼을 초기화한다.
	 * @param {String|null} menuId
	 * @param {String|null} gridId
	 */
	async function fetchColumns(tableId) {
		const { data } = await getColumnDef(tableId);
		gridColumns.value = buildSortedColumns(data.data);
	}

	/**
	 * GridColumnDef로 칼럼을 초기화한다.
	 * @param {String|null} menuId
	 * @param {String|null} gridId
	 */
	async function fetchGridColumns(menuId, gridId) {
		// menuId 검증, 없을 경우 api 호출하지 않음.
		if (menuId) {
			const { data } = await getGridColumnDef(menuId, gridId);
			gridColumns.value = buildSortedColumns(data.data);
		}
	}

	/**
	 * 칼럼 데이터를 변환 후 정렬한다.
	 * @param {Object[]} columnDefs
	 * @returns {Object[]} columns
	 */
	function buildSortedColumns(columnDefs) {
		return columnDefs
			.map(columnDef => new GridColumn(columnDef))
			.sort((a, b) => a[ID.SEQUENCE] - b[ID.SEQUENCE]);
	}

	/**
	 * @param {Object} config
	 * @returns {Object}
	 */
	function createColumn(config) {
		const headerText = config.field;

		return Object.assign({ headerText }, config);
	}

	//==================== Meta
	const metaColumns = ref([]); //Meta Data Detail

	class MetaGridColumn extends GridColumn {
		constructor(columnDef) {
			super(columnDef);

			this.field = columnDef[ID.META_DETAIL_ID];
			this.headerText = columnDef[ID.LABEL] ?? this.field;
		}
	}

	/**
	 * GridColumnDef로 칼럼을 초기화한다.
	 * @param {String|null} metaDataId
	 */
	async function fetchMetaColumns(metaDataId) {
		// metaDataId 검증, 없을 경우 api 호출하지 않음.
		if (metaDataId) {
			const { data } = await getMetaDataDetail(metaDataId);
			metaColumns.value = buildMetaColumns(data.data);
		}
	}

	/**
	 * metaData 정보 확인 후 컬럼 설정
	 * @param {String|"null"} menuId
	 * @param {String|null} metaDataId
	 * @param {String} type
	 */
	async function fetchModalColumns(menuId, metaDataId, type = "") {
		// metaDataId 검증, 없을 경우 api 호출하지 않음.
		if (metaDataId) {
			const { data } = await getMetaData(metaDataId);
			if (type == ACTION.CREATE && data.data.createColumnFlag == "N") {
				const { data } = await getGridColumnDef(
					menuId,
					metaDataId + ".Create",
				);
				metaColumns.value = buildSortedColumns(data.data);
			} else if (
				type == ACTION.MODIFY &&
				data.data.modifyColumnFlag == "N"
			) {
				const { data } = await getGridColumnDef(
					menuId,
					metaDataId + ".Modify",
				);
				metaColumns.value = buildSortedColumns(data.data);
			} else {
				const { data } = await getMetaDataDetail(metaDataId);
				metaColumns.value = buildMetaColumns(data.data);
			}
		}
	}

	/**
	 * 칼럼 데이터를 변환 후 정렬한다.
	 * @param {Object[]} columnDefs
	 * @returns {Object[]} columns
	 */
	function buildMetaColumns(columnDefs) {
		columnDefs.sort((a, b) => a[ID.SEQUENCE] - b[ID.SEQUENCE]);

		return columnDefs
			.filter(columnDef => columnDef[ID.ENABLED_FLAG] !== FLAG.N)
			.map(columnDef => new MetaGridColumn(columnDef));
	}

	/**
	 * 기본 정보와 병합 (Modal에서 사용할 config)
	 * @param {Object|null} config
	 * @returns {Object}
	 */
	function mergeMetaConfig(config = {}) {
		const columns = metaColumns.value;
		const { [ID.META_ID]: metaDataId } = columns[0] ?? {};

		return {
			metaDataId: metaDataId,
			gridId: metaDataId,
			columns,
			...config,
		};
	}

	/**
	 * 기본 정보와 병합 (Information에서 사용할 config)
	 * @param {Object|null} config
	 * @returns {Object}
	 */
	function mergeGridConfig(config = {}) {
		const columns = gridColumns.value;
		const { [ID.MENU_ID]: menuId, [ID.GRID_ID]: gridId } = columns[0] ?? {};
		return {
			menuId: menuId,
			gridId: gridId,
			columns,
			...config,
		};
	}

	//==================== Config
	const FROZEN_CONFIG = readonly({
		allowReordering: false,
		freeze: "Left",
	});
	const columns = computed(() => gridColumns.value);

	/**
	 * @param {String} field
	 * @returns {Object}
	 */
	function createFrozenColumn(field) {
		return createColumn({ field, ...FROZEN_CONFIG });
	}

	/**
	 * 기본 정보와 병합 (information.js config 형식)
	 * @param {Object|null} config
	 * @returns {Object}
	 */
	function mergeTableConfig(config = {}) {
		const columns = gridColumns.value;
		const { GRID_ID, TABLE_ID } = ID;
		const { [GRID_ID]: gridId, [TABLE_ID]: tableId } = columns[0] ?? {};
		return { gridId, tableId, columns, ...config };
	}

	return {
		// Column
		ID,
		gridColumns,
		fetchColumns,
		fetchGridColumns,
		createColumn,
		mergeGridConfig,

		// Meta
		metaColumns,
		fetchMetaColumns,
		mergeMetaConfig,

		fetchModalColumns,

		// Config
		columns,
		FROZEN_CONFIG,
		createFrozenColumn,
		mergeTableConfig,
	};
}

export function useFields(columnsRef, sequence) {
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

	//==================== Sequence
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

	const SEQUENCE = sequence ?? ID.SEQUENCE;
	const hasSequence = computed(() => fields.value.includes(SEQUENCE));

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
	 * 두 아이템의 key field 값을 비교; drag&drop 시, sequence 제외해야 target 정상 처리됨.
	 * @todo sequence 칼럼 확실히 통일되면 전역 상수로 정의
	 * @param {Object} a
	 * @param {Object} b
	 * @param {String[]} excludeKeyList
	 * @returns {Boolean}
	 */
	function compareKeyField(a, b, excludeKeyList = []) {
		const keyList = keyFields.value.filter(
			key => !excludeKeyList.includes(key),
		);

		return (
			keyList.length > 0 &&
			keyList.every(key => key === SEQUENCE || a[key] === b[key])
		);
	}

	/**
	 * 두 아이템의 모든 값을 비교 (Sequencef랑 특정 Key 제외)
	 * @param {Object} a
	 * @param {Object} b
	 * @returns {Boolean}
	 */
	function compareKeyValue(a, b, excludeKeyList) {
		const fieldList = columnsRef.value
			.filter(
				({ field }) =>
					!excludeKeyList.includes(field) && field != SEQUENCE,
			)
			.map(({ field }) => field);
		// TODO JJ Null과 emptyString 같다고 인지하고 비교해야함.
		return fieldList.every(key => a[key] === b[key]);
	}

	return {
		// Fields
		fields,
		extractFields,
		findColumnByField,
		assignFieldItem,

		// Sequence
		SEQUENCE,
		hasSequence,

		// Key Field
		keyFields,
		keyFieldComparator,
		createKeyItem,
		compareKeyField,

		compareKeyValue,
	};
}

export function useFieldColumn() {
	//==================== Key Field
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

	//==================== Ke
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
	 * @param {Object|null} target
	 * @returns {Object} dependency
	 */
	function createDependency(dependentExpression, target = {}) {
		if (!dependentExpression) {
			return {};
		}
		const dependents = parseExpression(dependentExpression);
		return createItem(dependents, key => target[key] ?? ""); // .toUpperCase()
	}

	/**
	 * 공백 문자 제거, 쉼표(,)나 파이프 문자(|)를 기준으로 분리
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
		// TODO 안씀
		if (expression) {
			return await fetchList(() =>
				MODELER_COMMON.getByQuery(expression, dependency),
			);
		} else {
			return [];
		}
	}

	return {
		// Common
		ID,
		checkColumnRequired,
		checkColumnModifiable,
		checkColumnPrimary,
		checkColumnFilterable,
		checkColumnFactory,
		checkColumnNumber,
		checkColumnVisible,

		// Combo
		createDependency,
		parseExpression,
		getExpressionResultByQuery,
	};
}

export function useFiltering(columnsRef, condition = {}) {
	//==================== System
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

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
		extractFields(
			filters.value,
			filter => filterConfig.value[filter[ID.FIELD]],
		),
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

export function useTableDef() {
	const gridTableDef = ref([]); //GridTableDef
	const metaDef = ref([]); //GridTableDef

	async function fetchTableDef(tableId) {
		const { data } = await getTableDef(tableId);
		gridTableDef.value = data.data;
	}

	async function fetchGridTableDef(menuId, gridId) {
		const { data } = await getGridTableDef(menuId, gridId);
		gridTableDef.value = data.data;
	}

	async function fetchMetaDef(metaDatId) {
		const { data } = await getMetaData(metaDatId);
		metaDef.value = data.data;
	}

	return {
		gridTableDef,
		fetchTableDef,
		fetchGridTableDef,
		metaDef,
		fetchMetaDef,
	};
}

export function useSearchCondition() {
	//==================== System
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;
	const DETAIL_ID = ID.SEARCH_CONDITION_DETAIL_ID;

	const { checkColumnVisible } = useFieldColumn();

	const searchConditionDetail = ref([]);

	async function fetchSearchConditionDetail(conditionId) {
		const { data } = await getSearchConditionDetail(conditionId);
		searchConditionDetail.value = data.data.sort(
			(a, b) => a[ID.SEQUENCE] - b[ID.SEQUENCE],
		);
	}

	/** inputMethod */
	function isInputMethodSearch({ inputMethod }) {
		return inputMethod === "Search";
	}
	function isInputMethodCombo({ inputMethod }) {
		const chooseType = inputMethod?.at(-1);
		return ["C", "D"].includes(chooseType);
	}
	function isInputMethodCheckDate({ inputMethod }) {
		return inputMethod.includes("Date");
	}
	function isInputMethodDate({ inputMethod }) {
		return inputMethod === "Date";
	}
	function isInputMethodNumber({ inputMethod, dataType }) {
		return (
			inputMethod === "Direct" &&
			(dataType === "Long" || dataType === "Double")
		);
	}
	function isInputMethodText({ inputMethod }) {
		return inputMethod === "Direct" || this.$isEmpty(inputMethod);
	}
	/** operationType */
	function isOperationTypeBetween({ operationType }) {
		return operationType === "Between"; // Between, Equal, In, Like
	}
	/** flag - check */
	function isFieldMandatory({ mandatoryFlag }) {
		return mandatoryFlag === "Y";
	}

	function isFieldValid(field) {
		return field != null || field != undefined;
	}

	/** dataType - time check */
	function getDateTimeType({ dataType }) {
		return dataType.toLowerCase() ?? "time";
	}

	/** set div key */
	function getDetailValue(data) {
		return data[DETAIL_ID];
	}

	/** set dependency */
	function getDependency({ dependentId }) {
		return dependentId ? { [dependentId]: "" } : {};
	}

	const dependentMap = computed(() => {
		const depMap = {};
		for (const {
			[DETAIL_ID]: field,
			dependents,
		} of dependentFieldList.value) {
			dependents.forEach(depen => {
				const value = depMap[depen];
				if (value) {
					value.push(field);
				} else {
					depMap[depen] = [field];
				}
			});
		}
		return depMap;
	});

	const dependentFieldList = computed(() =>
		searchConditionDetail.value
			.filter(({ dependentId }) => isFieldValid(dependentId))
			.map(({ dependentId, ...field }) => {
				const dependents = dependentId.replaceAll(" ", "").split(",");
				return { ...field, dependentId, dependents };
			}),
	);

	const mandatoryFields = computed(() =>
		searchConditionDetail.value.filter(isFieldMandatory),
	);

	/** check mandatory fields value */
	function checkMandatoryToCustomQuery(that, condition) {
		// condition = {"timeFrom" : "2024-08-09", "timeTo" : "2024-08-15"} 형식
		let checkFields = [];
		mandatoryFields.value.forEach(f => {
			const { [DETAIL_ID]: id, operationType } = f;
			if (operationType == "Between") {
				checkFields.push(`${id}From`);
				checkFields.push(`${id}To`);
			} else {
				checkFields.push(id);
			}
		});

		return checkFields?.every(field => {
			return !that.$isEmpty(condition[field]);
		});
	}

	function checkMandatoryToSearch(that, condition) {
		// condition = [{searchConditionDetailId : "time", operationType: "Between", values: ["2024-08-09", "2024-08-15"]} 형식
		const check = mandatoryFields.value?.every(f => {
			const field = condition.find(c => c[DETAIL_ID] == f[DETAIL_ID]);
			if (!field) {
				return false;
			} else {
				const { operationType, values } = field;
				if (operationType == "Between") {
					return (
						values.length == 2 &&
						!that.$isEmpty(values[0]) &&
						!that.$isEmpty(values[1])
					);
				} else {
					return values.length > 0 && !that.$isEmpty(values[0]);
				}
			}
		});
		return check;
	}

	/** format data by search type */
	function formatToCustomQuery(condition) {
		const formatData = {};
		// 조건 키들
		Object.keys(condition).forEach(key => {
			if (key.includes("^")) {
				const replaceKey = key.replace(/\^/g, "");
				formatData[replaceKey] = condition[key];
			} else {
				formatData[key] = condition[key];
			}
		});

		// searchConditionDetail.value에 있지만 condition에 없는 키들은 빈 문자열로 설정
		const existKeys = Object.keys(formatData);
		searchConditionDetail.value.filter(checkColumnVisible).forEach(data => {
			const { [DETAIL_ID]: id, operationType } = data;
			if (operationType == "Between") {
				const fromKey = `${id}From`;
				const toKey = `${id}To`;

				if (!existKeys.includes(fromKey)) formatData[fromKey] = "";
				if (!existKeys.includes(toKey)) formatData[toKey] = "";
			} else {
				if (!existKeys.includes(id)) formatData[id] = "";
			}
		});
		return formatData;
	}

	function formatToSearch(that, condition) {
		const transformedData = Object.entries(condition).reduce(
			(acc, [key, value]) => {
				const [baseKey] = key.split("^");

				if (that.$isEmpty(value)) return acc;

				if (!acc[baseKey]) {
					acc[baseKey] = {
						key: baseKey,
						values: [],
					};
				}

				acc[baseKey].values.push(value);
				return acc;
			},
			{},
		);

		const formatData = searchConditionDetail.value
			.filter(data => transformedData[data[DETAIL_ID]])
			.map(data => {
				return {
					...transformedData[data[DETAIL_ID]],
					...data,
				};
			});

		return formatData;
	}

	function getDefaultEqualCondition(data) {
		const condition = {
			dataType: "String",
			key: `key.${Object.keys(data)[0]}`, // TODO: 임시처리
			operationType: "Equal",
			values: [Object.values(data)[0]],
		};
		return [condition];
	}

	return {
		searchConditionDetail,
		fetchSearchConditionDetail,

		// Method
		checkColumnVisible,
		isInputMethodSearch,
		isInputMethodCombo,
		isInputMethodCheckDate,
		isInputMethodDate,
		isInputMethodNumber,
		isInputMethodText,
		isOperationTypeBetween,
		isFieldMandatory,
		isFieldValid,
		getDateTimeType,

		// UI Key
		getDetailValue,

		// Dependent
		getDependency,
		dependentMap,
		dependentFieldList,

		// Check Mandatory
		mandatoryFields,
		checkMandatoryToCustomQuery,
		checkMandatoryToSearch,

		formatToCustomQuery, // customQuery 용 데이터 포맷
		formatToSearch, // Grid Search 용 데이터 포맷

		getDefaultEqualCondition,
	};
}

export function useCustomQuery() {
	//==================== System
	const { systemInfo } = useSystem();
	const { QUERY_ID, QUERY_VERSION } = systemInfo.commonFlag
		? CAMEL_ID
		: UPPER_ID;

	//==================== Config
	const { gridTableDef, fetchGridTableDef } = useTableDef();
	const { filterItem, convertField } = useItem();
	const queryConfig = ref({ [QUERY_ID]: "", [QUERY_VERSION]: "" });

	/**
	 * @param {String} menuId
	 * @param {String} gridId
	 */
	async function initQueryConfig(menuId, gridId) {
		await fetchGridTableDef(menuId, gridId);
		return (queryConfig.value = filterItem(gridTableDef.value, [
			QUERY_ID,
			QUERY_VERSION,
		]));
	}

	/**
	 * @param {Object} parameters
	 * @param {ref<Object[]>} columnsRef
	 * @returns {Promise<Object[]>}
	 */
	async function formatQueryResult(parameters, columnsRef) {
		const searchCondition = { ...queryConfig.value, parameters };
		const { data } = await getByCustomQuery({ searchCondition });

		// fields를 key로 갖는 객체 생성
		return data.data.length ? convertField(data.data, columnsRef) : [];
	}

	return { initQueryConfig, formatQueryResult };
}

export function useSetDefaults() {
	function setDefaults(panelConfig) {
		// defaultValue가 비어 있지 않은 항목을 담을 객체 생성
		const filteredConfig = Object.entries(panelConfig).reduce(
			(acc, [category, items]) => {
				const filteredItems = items.filter(
					item => item.defaultValue !== "",
				);
				if (filteredItems.length > 0) {
					acc[category] = filteredItems;
				}
				return acc;
			},
			{},
		);

		return filteredConfig;
	}

	return { setDefaults };
}
