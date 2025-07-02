import { readonly, ref, reactive, toRefs, watch, computed } from "vue";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useMenu } from "~/system/modeler/plugins/composables/modeler-authority";
import { useUpdateData } from "~/system/modeler/plugins/composables/modeler-dataHandler";

//==================== Modal Config
//can be shared across components
const modalStack = reactive([]); // menuId, modalId, toggleModal
const modalCounter = ref(0);

export function useModalConfig() {
	const modalId = ++modalCounter.value;
	const isShowModal = ref(false);
	const modalState = reactive({
		tableId: "",
		items: [],
	});
	const { executeWithSpinner } = useSpinner();
	const { currentMenuId } = useMenu();

	const currentModalStack = computed(() =>
		modalStack.filter(({ menuId }) => menuId === currentMenuId.value),
	);

	/**
	 * config 설정 후 모달 활성화
	 * @param {Object} config tableId, items
	 */
	function openModalAndSetState(config) {
		modalState.tableId = config.tableId ?? "";
		modalState.items = config.items ?? [];

		executeWithSpinner(openModal, 300);
	}

	/**
	 * 모달 활성화 후 stcak에 추가한다.
	 */
	function openModal() {
		if (!isShowModal.value) {
			isShowModal.value = true;

			modalStack.push({
				modalId,
				toggleModal,
				menuId: currentMenuId.value,
			});
		}
	}

	/**
	 * 모달 비활성화 후 stack에서 제거한다.
	 */
	function closeModal() {
		if (isShowModal.value) {
			const index = modalStack.findIndex(
				modal => modal.modalId === modalId,
			);

			if (index > -1) {
				modalStack.splice(index, 1);
			}
			isShowModal.value = false;
		}
	}

	/**
	 * 모든 모달 닫기
	 */
	function closeModalAll() {
		currentModalStack.value.forEach(({ toggleModal }) =>
			toggleModal(false),
		);
	}

	/**
	 * 모달 활성화 전환; force 우선
	 * @param {Boolean|null} force
	 */
	function toggleModal(force) {
		const shouldShowModal = force ?? !isShowModal.value;
		shouldShowModal ? openModal() : closeModal();
	}

	return {
		// Global
		modalStack,
		currentModalStack,

		// Config
		isShowModal,
		modalState,

		// Function
		openModalAndSetState,
		openModal,
		closeModal,
		closeModalAll,
		toggleModal,
	};
}

//==================== Modal Create
export function useModalCreate() {
	const {
		isShowModal: isShowModalCreate,
		modalState: createConfig,
		openModalAndSetState: openModalCreate,
		closeModal: closeModalCreate,
	} = useModalConfig();

	/**
	 * readOnly 설정 및 모달 활성화
	 * @param {Object} config
	 * @param {Object|null} readOnlySetting
	 */
	function openModalCreateAndSetReadOnly(config, readOnlySetting) {
		createConfig.readOnlyConfig = readOnlySetting ?? {};
		openModalCreate(config);
	}

	return {
		isShowModalCreate,
		createConfig,

		openModalCreate,
		openModalCreateAndSetReadOnly,
		closeModalCreate,
	};
}

//==================== Modal Modify
export function useModalModify() {
	const {
		isShowModal: isShowModalModify,
		modalState: modifyConfig,
		openModalAndSetState,
		closeModal,
	} = useModalConfig();
	const { checkInList, checkOutList } = useUpdateData();

	/**
	 * @param {Object} config
	 * @param {String} tableId
	 * @param {Object[]} items
	 */
	async function openModalModify({ tableId, items }) {
		const checkedOutItems = await checkOutList(tableId, items);
		// Check Out이 모두 실패한 경우, 모달은 열리지 않음.
		if (checkedOutItems.length > 0) {
			openModalAndSetState({ tableId, items: checkedOutItems });
		}
	}

	/**
	 * 모달 닫기 전, Check In
	 * @param {Object[]|null} newItems
	 */
	async function closeModalModify(newItems) {
		const { tableId, items } = modifyConfig;
		await checkInList(tableId, newItems ?? items);
		closeModal();
	}

	return {
		isShowModalModify,
		modifyConfig,

		openModalModify,
		closeModalModify,
	};
}

//==================== Modal Delete
const deleteState = reactive({ tableId: "", items: [] });

export function useModalDelete() {
	const { executeWithSpinner } = useSpinner();
	const { openModalConfirmBy } = useModalConfirm();
	const { ACTION, deleteList } = useUpdateData();

	/**
	 * @param {Object} config
	 * @param {String} config.tableId
	 * @param {Object[]} config.items
	 */
	function openModalDelete({ tableId, items }) {
		deleteState.tableId = tableId;
		deleteState.items = items;
		openModalConfirmBy(ACTION.DELETE, tableId, items, deleteData);
	}

	/**
	 * 데이터 삭제
	 */
	function deleteData(comment) {
		executeWithSpinner(() =>
			deleteList(deleteState.tableId, deleteState.items, comment),
		);
	}

	return {
		openModalDelete,
		deleteData,
	};
}

//==================== Modal Alert
//can be shared across components
const alertState = reactive({
	type: "",
	title: null,
	message: "",
	param: {},
});
const isShowModalAlert = ref(false);

export function useModalAlert() {
	const TYPE = readonly({
		INFO: "Info",
		WARNING: "Warning",
		ERROR: "Error",
	});

	const { isShowModal, openModal, closeModal } = useModalConfig();

	/**
	 * @param {String} type
	 * @param {String} title
	 * @param {String} message
	 * @param {Object|null} param 메시지 다국어 parameter
	 */
	function setAlertState(type, title, message, param) {
		alertState.type = type;
		alertState.title = title;
		alertState.message = message;
		alertState.param = param;
	}

	/**
	 * 모달 활성화
	 * @todo 타이틀 사용 방안
	 * @param {String} type Info|Warning|Error
	 * @param {String} message
	 * @param {Object|null} param
	 */
	function openModalAlert(type, message, param) {
		setAlertState(type, "", message, param);

		// Modal Stack 관리
		openModal();
		isShowModalAlert.value = true;
	}

	/**
	 * @param {String} message
	 * @param {Object|null} param
	 */
	function openModalInfo(message, param) {
		openModalAlert(TYPE.INFO, message, param);
	}

	/**
	 * @param {String} message
	 * @param {Object|null} param
	 */
	function openModalWarning(message, param) {
		openModalAlert(TYPE.WARNING, message, param);
	}

	/**
	 * @param {String} message
	 * @param {Object|null} param
	 */
	function openModalError(message, param) {
		openModalAlert(TYPE.ERROR, message, param);
	}

	/**
	 * 모달을 닫고 정보 초기화
	 */
	function closeModalAlert() {
		setAlertState();

		// Modal Stack 관리
		closeModal();
		isShowModalAlert.value = false;
	}

	// 모달 상태 동기화
	watch(
		() => isShowModal.value,
		flag => {
			if (isShowModalAlert.value !== flag) {
				isShowModalAlert.value = flag;
			}
		},
	);

	return {
		...toRefs(alertState),
		isShowModalAlert,

		openModalInfo,
		openModalWarning,
		openModalError,
		closeModalAlert,
	};
}

//==================== Modal Confirm
//can be shared across components
const confirmState = reactive({
	tableId: "",
	type: "",
	items: [],
	count: 0,
	confirmData: () => {},
});
const isShowModalConfirm = ref(false);

export function useModalConfirm() {
	const { ACTION } = useUpdateData();

	const { isShowModal, openModal, closeModal } = useModalConfig();
	const { openModalWarning } = useModalAlert();

	/**
	 * @param {String} type
	 * @param {Object} items
	 * @param {Function} confirmData
	 */
	function initConfirmState(type, items, confirmData) {
		confirmState.type = ACTION[type.toUpperCase()];
		confirmState.count = items.length;
		confirmState.confirmData = confirmData;
	}

	/**
	 * @param {String} type
	 * @param {Stirng} tableId
	 * @param {Object[]} items
	 * @param {Function} confirmData
	 */
	function openModalConfirmBy(type, tableId, items, confirmData) {
		initConfirmState(type, items, confirmData);

		if (confirmState.count) {
			openModalConfirm(tableId, items);
		} else {
			openModalWarning("modal.create.noData");
		}
	}

	/**
	 * @param {String} tableId
	 * @param {Object[]} items
	 */
	function openModalConfirm(tableId, items) {
		confirmState.tableId = tableId;
		confirmState.items = items;

		// Modal Stack 관리
		openModal();
		isShowModalConfirm.value = true;
	}

	/**
	 * 모달 닫기 전 confirm state 초기화
	 */
	function closeModalConfirm() {
		confirmState.tableId = "";
		confirmState.items = [];

		// Modal Stack 관리
		closeModal();
		isShowModalConfirm.value = false;
	}

	// 모달 상태 동기화
	watch(
		() => isShowModal.value,
		flag => {
			if (isShowModalConfirm.value !== flag) {
				isShowModalConfirm.value = flag;
			}
		},
	);

	return {
		...toRefs(confirmState),
		isShowModalConfirm,
		initConfirmState,
		openModalConfirmBy,
		closeModalConfirm,
	};
}

/**
 * @description ModalFilter에서 ModalSearch 활성화할 경우, 레이아웃이 제대로 안 잡혀서 전역으로 관리.
 * @todo ModalFilter의 Search Type 미사용 시, Button에 매핑하는 방식으로 변경할 것
 */
//==================== Modal Search
const searchState = reactive({
	field: "",
	title: "",
	items: [],
	isMultiple: true,
	selectedItems: [],

	// input 검증
	target: null,
});

const isShowModalSearch = ref(false);

export function useModalSearch(targetRef) {
	const targetItems = ref([]);

	const { isShowModal, openModal, closeModal } = useModalConfig();

	/**
	 * @param {Object} config
	 * @param {String} config.field
	 * @param {String} config.title
	 * @param {Object[]} config.items
	 * @param {Boolean} config.isMultiple
	 */
	function openModalSearch({ field, title, items, isMultiple }) {
		searchState.field = field;
		searchState.title = title ?? field;
		searchState.items = items;
		searchState.isMultiple = isMultiple ?? true;
		searchState.target = targetRef.value;

		// Modal Stack 관리
		openModal();
		isShowModalSearch.value = true;
	}

	/**
	 * 모달을 닫고 정보 초기화
	 */
	function closeModalSearch() {
		// Modal Stack 관리
		closeModal();
		isShowModalSearch.value = false;
	}

	/**
	 * SearchItem 초기화
	 */
	function initSearchItems() {
		searchState.selectedItems = [];
	}

	/**
	 * @param {Object} items
	 */
	function applySearchItems(items) {
		searchState.selectedItems = items;
		closeModalSearch();
	}

	watch(
		() => searchState.selectedItems,
		items => {
			if (items?.length && targetRef?.value === searchState.target) {
				targetItems.value = items;
			}
		},
	);

	// 모달 상태 동기화
	watch(
		() => isShowModal.value,
		flag => {
			if (isShowModalSearch.value !== flag) {
				isShowModalSearch.value = flag;
			}
		},
	);

	return {
		...toRefs(searchState),
		isShowModalSearch,
		targetItems,

		openModalSearch,
		closeModalSearch,
		initSearchItems,
		applySearchItems,
	};
}

//==================== Modal Success
//can be shared across components
const isShowModalSuccess = ref(false);

export function useModalSuccess() {
	/**
	 * 성공 모달을 토글한다.
	 */
	function toggleModalSuccess() {
		if (isShowModalSuccess.value) return;

		isShowModalSuccess.value = true;
		setTimeout(() => {
			closeModalSuccess();
		}, 3000);
	}

	/**
	 * 모달 닫기
	 */
	function closeModalSuccess() {
		isShowModalSuccess.value = false;
	}

	return {
		isShowModalSuccess,
		toggleModalSuccess,
		closeModalSuccess,
	};
}

//==================== Modal Result
//can be shared across components
const resultState = reactive({
	tableId: "",
	items: null,
});
const isShowModalResult = ref(false);

export function useModalResult() {
	const { isShowModal, openModal, closeModal } = useModalConfig();

	/**
	 * @param {String} tableId
	 * @param {Object[]} items
	 */
	function openModalResult(tableId, items) {
		resultState.tableId = tableId;
		resultState.items = items;

		// Modal Stack 관리
		openModal();
		isShowModalResult.value = true;
	}

	/**
	 * 모달 닫기 전 state 초기화
	 */
	function closeModalResult() {
		resultState.tableId = "";
		resultState.items = [];

		// Modal Stack 관리
		closeModal();
		isShowModalResult.value = false;
	}

	// 모달 상태 동기화
	watch(
		() => isShowModal.value,
		flag => {
			if (isShowModalResult.value !== flag) {
				isShowModalResult.value = flag;
			}
		},
	);

	return {
		isShowModalResult,
		resultState,
		openModalResult,
		closeModalResult,
	};
}
