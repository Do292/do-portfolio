import { reactive, readonly } from "vue";
import {
	useModalAlert,
	useModalResult,
	useModalSuccess,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

import {
	API_RESPONSE,
	USER,
	ID,
	DATA_STATE,
} from "~/system/modeler/constants/modeler_constants.js";
const { RESULT, DATA, FAIL, STATUS, MESSAGE } = API_RESPONSE;

//==================== Fetch Data
export function useFetchData() {
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
		const message = data[DATA][0][MESSAGE];
		openModalError(message);
	}

	return { assignDataState, fetchList, fetchOne, handleErrorAndOpenModal };
}

//==================== Update Data
import { useUserInfo } from "~/system/modeler/plugins/composables/modeler-authority";
import * as COMMON from "~/system/modeler/api/modeler-common.js";

//can be shared across components
const updateState = reactive({
	tableId: "",
	items: [],
	action: "",
});
const ACTION = readonly({
	CREATE: "create",
	MODIFY: "modify",
	DELETE: "delete",
	APPLY: "apply",
	CLONE: "clone",
});

export function useUpdateData() {
	//==================== CRUD
	const { filterItem } = useItem();
	const { handleErrorAndOpenModal } = useFetchData();
	const { openModalResult } = useModalResult();
	const { toggleModalSuccess } = useModalSuccess();

	/**
	 * @param {String|null} tableId
	 * @param {Object[]|null} items
	 */
	function initState(tableId, items, action) {
		updateState.tableId = tableId;
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

	/**
	 * @param {String} tableId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function createList(tableId, dataList, comment) {
		// DataState 설정
		dataList.forEach(item => (item[ID.DATA_STATE] = DATA_STATE.CREATED));

		const createItems = await handleAction(tableId, () =>
			COMMON.create(tableId, formatDTO({ dataList }, comment)),
		);

		if (createItems.length) {
			initState(tableId, createItems, ACTION.CREATE);
		}
		return createItems;
	}

	/**
	 * @param {String} tableId
	 * @param {Object[]} dataList
	 * @param {Boolean|null} forceUpdate
	 * @returns {Promise<Object[]>}
	 */
	async function modifyList(tableId, dataList, comment, forceUpdate = true) {
		const modifyItems = await handleAction(tableId, () =>
			COMMON.modify(tableId, formatDTO({ dataList }, comment)),
		);

		// drag&drop에서 state 변경될 경우, 모든 데이터를 new row로 인지할 수 있음.
		if (modifyItems.length && forceUpdate) {
			initState(tableId, modifyItems, ACTION.MODIFY);
		}
		return modifyItems;
	}

	/**
	 * @param {String} tableId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function deleteList(tableId, dataList, comment) {
		const deleteItems = await handleAction(tableId, () =>
			COMMON.remove(tableId, formatDTO({ dataList }, comment)),
		);

		if (deleteItems.length) {
			initState(tableId, [], ACTION.DELETE);
		}
		return deleteItems;
	}

	/**
	 * @param {String} tableId
	 * @param {Object[]} createList
	 * @param {Object[]} deleteList
	 * @returns {Promise<Boolean>}
	 */
	async function applyList(tableId, createList, deleteList) {
		const applyItems = await handleAction(tableId, () =>
			COMMON.apply(tableId, formatDTO({ createList, deleteList })),
		);

		if (applyItems.length) {
			initState(tableId, applyItems, ACTION.APPLY);
			return true;
		}
		return false;
	}

	/**
	 *
	 * @param {String} tableId
	 * @param {Function} callback
	 * @returns {Promise<Object[]>}
	 */
	async function handleAction(tableId, callback) {
		initState();
		try {
			const { data } = await callback();
			return handleResultAndOpenModal(tableId, data);
		} catch ({ data }) {
			handleErrorAndOpenModal(data);
			return [];
		}
	}

	//==================== Checked State
	/**
	 * 에러 발생 시, 서버 혹은 클라이언트 로직 검증 필요!
	 * @param {String} tableId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function checkInList(tableId, dataList) {
		return await handleCheckState(tableId, dataList, () =>
			COMMON.checkIn(tableId, formatDTO({ dataList })),
		);
	}

	/**
	 * @param {String} tableId
	 * @param {Object[]} dataList
	 * @returns {Promise<Object[]>}
	 */
	async function checkOutList(tableId, dataList) {
		return await handleCheckState(tableId, dataList, () =>
			COMMON.checkOut(tableId, formatDTO({ dataList })),
		);
	}

	/**
	 *
	 * @param {String} tableId
	 * @param {Object[]} dataList
	 * @param {Function} callback
	 * @returns {Promise<Object[]>}
	 */
	async function handleCheckState(tableId, dataList, callback) {
		if (!validateCheckOutState(dataList)) {
			return dataList;
		}

		try {
			const { data } = await callback();
			if (data[RESULT] === FAIL) {
				openModalResult(tableId, data[DATA]);
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
	 * @param {Object} data
	 * @returns {Object[]}
	 */
	function getUpdatedItems(data) {
		const items = data[DATA].filter(data => data[STATUS] !== FAIL);

		if (items.length > 0) {
			const keys = Object.keys(items[0]).filter(
				key => ![STATUS, MESSAGE].includes(key),
			);
			return items.map(item => filterItem(item, keys));
		}
		return [];
	}

	/**
	 * 응답 결과에 따라 모달을 활성화한다.
	 * @param {String} tableId
	 * @param {Object} data
	 * @returns {Object[]}
	 */
	function handleResultAndOpenModal(tableId, data) {
		if (data[RESULT] === FAIL) {
			openModalResult(tableId, data[DATA]);
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

		// CheckState
		checkInList,
		checkOutList,

		// Config
		formatDTO,
	};
}

//==================== Item
import { NODE_FIELD } from "~/system/modeler/constants/tree_constants.js";

export function useItem() {
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
	 * 데이터 Position 기준 정렬
	 * @param {Object[]} items
	 * @param {String|null} position
	 * @returns {Object[]}
	 */
	function sortItemsByPosition(items, position = ID.POSITION) {
		return items.sort((a, b) => a[position] - b[position]);
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

	return {
		deepCloneItems,
		filterItem,
		createItem,
		findItem,
		checkItemsEqual,
		sortItems,
		sortItemsByPosition,
		groupByItems,
	};
}

//==================== LocalStorage
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
	 * value를 JSON 문자열로 직렬화해서 ㅈ저ㅏㅇ
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
