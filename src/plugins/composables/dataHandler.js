import { inject, reactive } from "vue";
import {
	useModalAlert,
	useModalResult,
	useModalSuccess,
} from "~/plugins/composables/modalHandler";

import { useSystem } from "~/plugins/composables/authority";
import { API_RESPONSE, USER } from "~/plugins/wfb-constants.js";
import { UPPER_ID, CAMEL_ID } from "~/constants/common_constants.js";
const { RESULT, DATA, FAIL, DETAIL_STATUS, DETAIL_MESSAGE } = API_RESPONSE;

//==================== Fetch Data
export function useFetchData() {
	const { ID } = useColumnDef();

	const { openModalError } = useModalAlert();

	/**
	 * @param {Object|null} params
	 * @return {Object}
	 */
	function assignDataState(params = {}) {
		return Object.assign(params, { [ID.DATA_STATE]: DATA_STATE.CREATED });
	}

	/**
	 * @todo 에러 처리 보강
	 * @param {Promise<Object>} callApi
	 * @returns {Promise<Object[]>}
	 */
	async function fetchList(callApi) {
		try {
			const { data } = await callApi();
			if (data[RESULT] === FAIL) {
				// 경고 모달 활성화
				handleErrorAndOpenModal(data);
				return [];
			}
			return data[DATA];
		} catch ({ data }) {
			handleErrorAndOpenModal(data);
			return [];
		}
	}

	/**
	 * @todo 에러 처리 보강
	 * @param {Promise<Object>} callApi
	 * @returns {Promise<Object>|null}
	 */
	async function fetchOne(callApi) {
		try {
			const { data } = await callApi();
			if (data[RESULT] === FAIL) {
				// 경고 모달 활성화
				handleErrorAndOpenModal(data);
				return;
			}
			return data[DATA]?.[0];
		} catch ({ data }) {
			handleErrorAndOpenModal(data);
			return;
		}
	}

	/**
	 * 응답데이터로부터 에러메시지를 확인해 모달로 안내한다.
	 * @param {Object} data
	 */
	function handleErrorAndOpenModal(data) {
		const message = data[DATA][0][DETAIL_MESSAGE];
		openModalError(message);
	}

	return { assignDataState, fetchList, fetchOne, handleErrorAndOpenModal };
}

//==================== Update Data
import { useUserInfo } from "~/plugins/composables/authority";
import { DATA_STATE } from "~/system/modeler/constants/modeler_constants.js";
import * as COMMON from "~/api/common.js";
import * as MODELER_COMMON from "~/system/modeler/api/modeler-common.js";
import { ACTION } from "~/plugins/wfb-constants.js";

const updateState = reactive({
	metaDataId: "",
	items: [],
	action: "",
});

export function useUpdateData() {
	//==================== CRUD
	const { filterItem } = useItem();
	const { handleErrorAndOpenModal } = useFetchData();
	const { openModalResult } = useModalResult();
	const { toggleModalSuccess } = useModalSuccess();
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

	/**
	 * @param {String|null} metaDataId
	 * @param {Object[]|null} items
	 */
	function initState(metaDataId, items, action) {
		updateState.metaDataId = metaDataId;
		updateState.items = items;
		updateState.action = action;
	}

	/**
	 * @todo 에러 처리 보강
	 * @param {Promise<Object>} callApi
	 * @returns {Promise<Boolean>}
	 */
	async function updateOne(callApi) {
		try {
			const { data } = await callApi();
			if (data[RESULT] === FAIL) {
				// 경고 모달 활성화
				handleErrorAndOpenModal(data);
				return false;
			}
			toggleModalSuccess();
			return true;
		} catch ({ data }) {
			handleErrorAndOpenModal(data);
			return false;
		}
	}

	async function callCustomAPI(callApi, gridItem) {
		try {
			const { data } = await callApi(gridItem);
			if (data[RESULT] === FAIL) {
				// 경고 모달 활성화
				handleErrorAndOpenModal(data);
				return false;
			}
			toggleModalSuccess();
			return true;
		} catch ({ data }) {
			handleErrorAndOpenModal(data);
			return false;
		}
	}

	/**
	 * @param {Function|null} callApi
	 * @param {String} metaDataId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function createList(callApi, metaDataId, dataList, comment) {
		// DataState 설정
		dataList.forEach(item => (item[ID.DATA_STATE] = DATA_STATE.CREATED));

		// callApi 미지정시, 공통으로 사용 가능한 createApi 매핑
		const createApi = callApi ?? (dto => COMMON.create(metaDataId, dto));
		const createItems = await handleAction(metaDataId, () =>
			createApi(formatDataDTO(dataList, comment)),
		);

		if (createItems.length) {
			initState(metaDataId, createItems, ACTION.CREATE);
		}
		return createItems;
	}

	/**
	 * @param {Function|null} callApi
	 * @param {String} metaDataId
	 * @param {Object[]} dataList
	 * @param {Boolean|null} forceUpdate
	 * @returns {Promise<Object[]>}
	 */
	async function modifyList(
		callApi,
		metaDataId,
		dataList,
		comment,
		forceUpdate = true,
	) {
		// callApi 미지정시, 공통으로 사용 가능한 modifyApi 매핑
		const modifyApi = callApi ?? (dto => COMMON.modify(metaDataId, dto));
		const modifyItems = await handleAction(metaDataId, () =>
			modifyApi(formatDataDTO(dataList, comment)),
		);

		// drag&drop에서 state 변경될 경우, 모든 데이터를 new row로 인지할 수 있음.
		if (modifyItems.length && forceUpdate) {
			initState(metaDataId, modifyItems, ACTION.MODIFY);
		}
		return modifyItems;
	}

	/**
	 * @param {Function|null} callApi
	 * @param {String} metaDataId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function deleteList(callApi, metaDataId, dataList, comment) {
		// callApi 미지정시, 공통으로 사용 가능한 deleteApi 매핑
		const deleteApi = callApi ?? (dto => COMMON.remove(metaDataId, dto));
		const deleteItems = await handleAction(metaDataId, () =>
			deleteApi(formatDataDTO(dataList, comment)),
		);

		if (deleteItems.length) {
			initState(metaDataId, [], ACTION.DELETE);
		}
		return deleteItems;
	}

	/**
	 * @param {String} metaDataId
	 * @param {Object[]} createList
	 * @param {Object[]} deleteList
	 * @returns {Promise<Boolean>}
	 */
	async function applyList(callApi, metaDataId, createList, deleteList) {
		const applyItems = await handleAction(
			metaDataId,
			() =>
				// COMMON.apply(metaDataId, formatDTO({ createList, deleteList })),
				callApi({ createList, deleteList }), // TODO 추후 재정의 필요
		);

		if (applyItems.length) {
			initState(metaDataId, applyItems, ACTION.APPLY);
			return true;
		}
		return false;
	}

	/**
	 *
	 * @param {String} metaDataId
	 * @param {Function} callback
	 * @returns {Promise<Object[]>}
	 */
	async function handleAction(metaDataId, callback) {
		initState();
		try {
			const { data } = await callback();
			return handleResultAndOpenModal(metaDataId, data);
		} catch ({ data }) {
			handleErrorAndOpenModal(data);
			return [];
		}
	}

	//==================== Checked State
	/**
	 * 에러 발생 시, 서버 혹은 클라이언트 로직 검증 필요!
	 * @param {String} metaDataId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function checkInList(metaDataId, dataList) {
		return await handleCheckState(metaDataId, dataList, () =>
			MODELER_COMMON.checkIn(metaDataId, formatDTO({ dataList })),
		);
	}

	/**
	 * @param {String} metaDataId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function checkOutList(metaDataId, dataList) {
		return await handleCheckState(metaDataId, dataList, () =>
			MODELER_COMMON.checkOut(metaDataId, formatDTO({ dataList })),
		);
	}

	/**
	 *
	 * @param {String} metaDataId
	 * @param {Object[]} dataList
	 * @param {Function} callback
	 * @returns {Promise<Object[]>}
	 */
	async function handleCheckState(metaDataId, dataList, callback) {
		if (!validateCheckOutState(dataList)) {
			return dataList;
		}

		try {
			const { data } = await callback();
			if (data[RESULT] === FAIL) {
				openModalResult(metaDataId, data[DATA]);
			}
			const items = data[DATA].filter(
				({ DETAIL_STATUS }) => DETAIL_STATUS !== FAIL,
			);
			return items;
		} catch ({ data }) {
			handleErrorAndOpenModal(data);
			return [];
		}
	}

	/**
	 * @param {Object[]} dataList
	 * @returns {Boolean}
	 */
	function validateCheckOutState(dataList) {
		// 모든 데이터는 동일한 프로퍼티를 갖는다고 가정
		return Object.keys(dataList[0]).includes(ID.CHECK_OUT_STATE);
	}

	//==================== Config
	/**
	 * @param {Object} config
	 * @param {String|null} comment
	 * @returns {Object}
	 */
	function formatDTO(config, comment = "") {
		const { userInfo } = useUserInfo();
		const userId = userInfo.value[USER.ID];
		return Object.assign({ userId, comment }, config);
	}

	/**
	 * @param {Object} config
	 * @param {String|null} comment
	 * @returns {Object}
	 */
	function formatDataDTO(dataList, comment = "") {
		dataList.forEach(item => {
			item[ID.EVENT_COMMENT] = comment;
		});
		return dataList;
	}

	/**
	 * @param {Object} data
	 * @returns {Object[]}
	 */
	function getUpdatedItems(data) {
		const items =
			data[DATA]?.filter(data => data[DETAIL_STATUS] !== FAIL) ?? [];

		if (items.length > 0) {
			const keys = Object.keys(items[0]).filter(
				key => ![DETAIL_STATUS, DETAIL_MESSAGE].includes(key),
			);
			return items.map(item => filterItem(item, keys));
		}
		return [];
	}

	/**
	 * 응답 결과에 따라 모달을 활성화한다.
	 * @param {String} metaDataId
	 * @param {Object} data
	 * @returns {Object[]}
	 */
	function handleResultAndOpenModal(metaDataId, data) {
		if (data[RESULT] === FAIL) {
			openModalResult(metaDataId, data[DATA]);
		} else {
			toggleModalSuccess();
		}
		return getUpdatedItems(data);
	}

	return {
		// State
		updateState,
		updateOne,
		initState,

		// Action
		ACTION,
		createList,
		modifyList,
		deleteList,
		applyList,
		handleAction,
		callCustomAPI,

		// CheckState
		checkInList,
		checkOutList,

		// Config
		formatDTO,
	};
}

//==================== Execute Data
import { useSpinner } from "~/plugins/composables/uiControl";

export function useExecuteData() {
	const { executeWithSpinner } = useSpinner();
	const { toggleModalSuccess } = useModalSuccess();
	const { RESULT, FAIL, MESSAGE } = API_RESPONSE;

	// Alert 모달 버튼 이벤트로 닫기 위해 inject로 가져옴.
	const { openModalWarning } = inject("alert");

	/**
	 * 데이터를 비동기로 가져와 검증한다.
	 * @param {Function} callback
	 * @returns {Promise}
	 */
	function executeList(callback) {
		return executeWithSpinner(async () => {
			const { data } = await callback();

			// 실패한 경우 경고 모달
			if (data[RESULT] === FAIL) {
				openModalWarning(data[MESSAGE]);
				return false;
			}

			// 성공한 경우
			toggleModalSuccess();
			return true;
		});
	}

	return { executeList };
}

//==================== Item
import { NODE_FIELD } from "~/plugins/wfb-constants.js";
import { useColumnDef } from "./tableHandler";

export function useItem() {
	//==================== Function
	const { CHILDREN } = NODE_FIELD;

	/**
	 * @param {Object[]|Object|null} items
	 * @returns {Object[]|Object}
	 */
	function deepCloneItems(items = []) {
		return items.map(item => ({ ...item }));
	}

	/**
	 * item 프로퍼티 중 keys만 필터링한다.
	 * @param {Object|null} item
	 * @param {Object[]} keys
	 * @returns {Object|null}
	 */
	function filterItem(item, keys) {
		return item ? createItem(keys, key => item[key]) : null;
	}

	/**
	 * key 배열을 프로퍼티로 갖는 item을 생성한다.
	 * @param {Object[]} keys
	 * @param {Function} getValue
	 * @returns {Object}
	 */
	function createItem(keys, getValue = () => "") {
		/** @todo 대문자 변환 필요한지 고려; 현재 field명이 대문자라 보정 */
		const entries = keys.map(key => [key, getValue(key)]);
		return Object.fromEntries(entries);
	}

	/**
	 * 특정 아이템을 재귀적으로 탐색한다.
	 * @param {Object[]|null} items
	 * @param {String} key
	 * @param {String} value
	 * @returns {Object|null} targetItem
	 */
	function findItem(items = [], key, value) {
		// value 검증
		if (!value) return null;

		for (const item of items) {
			// 본인 검증
			if (item[key] === value) return item;

			// 자식 검증
			const child = findItem(item[CHILDREN], key, value);
			if (child) return child;
		}
		return null;
	}

	/**
	 * 동일한 객체인지 확인
	 * @param {Object|null} a
	 * @param {Object|null} b
	 * @returns {Boolean}
	 */
	function checkItemsEqual(a, b) {
		// 하나라도 객체가 아니면 false
		if (!a || !b) return false;

		const keySet = new Set([...Object.keys(a), ...Object.keys(b)]);
		return [...keySet].every(
			key => (!a[key] && !b[key]) || a[key] === b[key],
		);
	}

	/**
	 * items를 검증여부에 따라 정렬; 인자를 직접 변경하므로 주의 필요
	 * @param {Object[]} items
	 * @param {Function} validateItem
	 * @param {Boolean|null} prioritized 우선 정렬 여부
	 * @returns {Object[]}
	 */
	function sortItems(items, validateItem, prioritized = true) {
		const order = prioritized ? -1 : 1;

		return items.sort(
			(a, b) => order * (validateItem(a) - validateItem(b)),
		);
	}

	/**
	 * 데이터 Sequence 기준 정렬
	 * @param {Object[]} items
	 * @param {String} sequence
	 * @returns {Object[]}
	 */
	function sortItemsBySequence(items, sequence) {
		return items.sort((a, b) => a[sequence] - b[sequence]);
	}

	/**
	 * @param {String} key
	 * @param {Object[]} items
	 * @param {String|null} defaultKey
	 * @returns {Object}
	 */
	function groupByItems(key, items = [], defaultKey) {
		return items.reduce((acc, cur) => {
			const groupKey = cur[key] ?? defaultKey;
			if (!acc[groupKey]) {
				acc[groupKey] = [];
			}
			acc[groupKey].push(cur);
			return acc;
		}, {});
	}

	/**
	 * 넘겨받은 items에서 key (object)에 포함된 item을 상위로 옮김
	 * @param {Object[]} items
	 * @returns {Object[]}
	 */
	function mergeItems(items = []) {
		items.map(item => {
			if (item.key) {
				let keyList = Object.keys(item.key);
				keyList.forEach(key => {
					item[key] = item.key[key];
				});
			}
		});

		return items;
	}

	/**
	 * 넘겨받은 items의 key를 GridColumn의 field(CamelCase)로 변환
	 * @param {Object[]} items
	 * @returns {Object[]}
	 */
	function convertField(items, column) {
		const data = [];
		const fieldMap = [];
		for (let col of column.value) {
			fieldMap[col.field.toUpperCase()] = col.field;
		}

		let dataFieldList = Object.keys(items[0]);
		for (let item of items) {
			let obj = {};
			for (let field of dataFieldList) {
				if (fieldMap[field]) {
					obj[fieldMap[field]] = item[field.toUpperCase()];
				} else {
					obj[field] = item[field.toUpperCase()];
				}
			}
			data.push(obj);
		}
		return data;
	}

	return {
		deepCloneItems,
		filterItem,
		createItem,
		findItem,
		checkItemsEqual,
		sortItems,
		sortItemsBySequence,
		groupByItems,
		mergeItems,
		convertField,
	};
}

export function useLocalStorage() {
	const { createItem } = useItem();

	/**
	 * @param {String} key
	 * @returns {Object|String}
	 */
	function getLocalStorage(key) {
		const item = localStorage.getItem(key);
		return item && /^("|{).*("|})$/.test(item) ? JSON.parse(item) : item;
	}

	/**
	 * 모든 로컬 스토리지 아이템을 객체 형태로 반환함.
	 * @returns {Object}
	 */
	function getAllLocalStorage() {
		const keys = Object.keys(localStorage);
		return createItem(keys, getLocalStorage);
	}

	/**
	 * value를 JSON 문자열로 직렬화해서 저장
	 * @param {String} key
	 * @param {Object|String} value
	 */
	function setLocalStorage(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	/**
	 * @param {String} key
	 */
	function removeLocalStorage(key) {
		localStorage.removeItem(key);
	}

	/**
	 * value가 있을 경우 set하고 없으면 지운다
	 * @param {String} key
	 * @param {Object|String|null} value
	 * @param {Boolean|null} force
	 */
	function toggleLocalStorage(key, value, force = true) {
		if (value && force) {
			setLocalStorage(key, value);
		} else {
			removeLocalStorage(key);
		}
	}

	/**
	 * 로컬 스토리지 초기화
	 */
	function clearLocalStorage() {
		localStorage.clear();
	}

	return {
		getLocalStorage,
		getAllLocalStorage,
		toggleLocalStorage,
		clearLocalStorage,
	};
}
