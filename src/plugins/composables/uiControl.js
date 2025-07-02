import { ref, reactive, computed } from "vue";
import { useSystem } from "~/plugins/composables/authority";
import { UPPER_ID, CAMEL_ID } from "~/constants/common_constants.js";

//==================== Spinner
// 최상위 컴포넌트에서 사용할 것
const isLoading = ref(false);
const spinnerCounter = ref(0);

export function useSpinner() {
	/**
	 * 비동기 함수 실행 동안 스피너 활성화
	 * @param {Function} callback
	 * @param {Number} delay
	 * @returns {Promise}
	 */
	async function executeWithSpinner(callback, delay = 200) {
		const spinnerId = ++spinnerCounter.value;

		try {
			isLoading.value = true;
			const result = await callback();

			// 결과 반환
			return result;
		} catch (error) {
			// TODO; modal 매핑할 것
			console.log("executeWithSpinner: " + error);
			throw error;
		} finally {
			setTimeout(() => {
				// 가장 마지막 활성화된 스피너 기준으로 로딩 해제함.
				if (spinnerId === spinnerCounter.value) {
					isLoading.value = false;
				}
			}, delay);
		}
	}

	return { isLoading, executeWithSpinner };
}

//==================== Information
//can be shared across components
const isFixedPin = ref(false);
const isShowInformation = ref(false);

export function useInformation() {
	const { systemInfo } = useSystem();
	const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

	if (systemInfo.id == "spc") isShowInformation.value = true;

	const infoConfig = reactive({
		gridId: "",
		columns: [],
		row: {},
	});

	/**
	 * @param {Object} information
	 * @param {String} information.gridId
	 * @param {Object} information.row
	 * @param {Object[]|null} information.columns
	 */
	function setInformation({ gridId = "", columns = [], row = {} }) {
		infoConfig.gridId = gridId;
		// 패스워드 칼럼 제외
		infoConfig.columns = columns.filter(
			column => column[ID.FIELD] !== ID.PASSWORD,
		);
		infoConfig.row = row;
	}

	/**
	 * Pin 고정 여부 고려하여 information toggle
	 */
	function toggleInformation() {
		if (!isFixedPin.value) {
			isShowInformation.value = !isShowInformation.value;
		}
	}

	/**
	 * 고정 핀 토글
	 */
	function togglePin() {
		isFixedPin.value = !isFixedPin.value;
	}

	return {
		// Info
		infoConfig,
		isShowInformation,
		setInformation,
		toggleInformation,

		// Pin
		isFixedPin,
		togglePin,
	};
}

//==================== Button
import { AIMCON, FLAG } from "~/plugins/wfb-constants.js";
import { useMenu } from "~/plugins/composables/authority";

/**
 * @param {String} type Action Type
 * @param {Boolean|null} needsAuthority 권한 여부; AuthorityMenuItem에서 정의
 */
export function useButton(type, needsAuthority) {
	//==================== Ref
	const buttonRef = ref(null);
	const { focus } = useFocusing(buttonRef);

	//==================== Auth
	const { currentMenuItemAuthConfig } = useMenu();
	const isDisabled = computed(() =>
		needsAuthority
			? currentMenuItemAuthConfig.value[type] !== FLAG.Y
			: false,
	);
	const isVisible = computed(
		() => !needsAuthority || !!currentMenuItemAuthConfig.value[type],
	);

	//==================== Style
	const iconClass = `aim aimcons_${AIMCON[type]}`;
	const title = `button.${type}`;

	return {
		// Ref
		buttonRef,
		focus,

		// Auth
		isVisible,
		isDisabled,

		// Style
		iconClass,
		title,
	};
}

//==================== Input
export function useInput() {
	const inputRef = ref(null);
	const { focus, blur } = useFocusing(inputRef);

	return { inputRef, focus, blur };
}

export function useFocusing(targetRef) {
	/**
	 * target 포커싱
	 */
	function focus() {
		targetRef.value.focus();
	}

	/**
	 * target 블러
	 */
	function blur() {
		targetRef.value.blur();
	}

	return { focus, blur };
}

//==================== Image
export function useImage() {
	/**
	 * @param {String} base64
	 * @returns {String}
	 */
	function formatImageUrl(base64) {
		return base64
			? "data:image/png;base64," + base64
			: "/assets/images/menu/User.svg";
	}

	/**
	 * 요소의 맨 앞에 아이콘을 추가한다.
	 * @param {HTMLElement} element
	 * @param {String} base64
	 */
	function prependImage(element, base64) {
		const $img = document.createElement("img");
		$img.src = formatImageUrl(base64);
		$img.style.height = "60%";

		element.insertBefore($img, element.firstChild);
	}

	return { formatImageUrl, prependImage };
}

//==================== Filter(SearchCondition)
const isFixedFilterPin = ref(false);
const isShowFilter = ref(false);

export function useFilter() {
	const filterConfig = reactive({
		menuId: "",
		conditionId: "",
		isUseCustomQuery: false,
	});

	/**
	 * @param {Object} filter
	 * @param {String} filter.menuId
	 * @param {Object} filter.conditionId
	 * @param {Boolean} filter.isUseCustomQuery
	 */
	function setFilter({
		menuId = "",
		conditionId = "",
		isUseCustomQuery = false,
	}) {
		filterConfig.menuId = menuId;
		filterConfig.conditionId = conditionId;
		filterConfig.isUseCustomQuery = isUseCustomQuery;
	}

	/**
	 * filter toggle
	 */
	function toggleFilter() {
		if (!isFixedFilterPin.value) {
			isShowFilter.value = !isShowFilter.value;
		}
	}

	/**
	 * 고정 핀 토글
	 */
	function toggleFilterPin() {
		isFixedFilterPin.value = !isFixedFilterPin.value;
	}

	return {
		// Filter
		filterConfig,
		isShowFilter,
		setFilter,
		toggleFilter,

		// Filter Pin
		isFixedFilterPin,
		toggleFilterPin,
	};
}
