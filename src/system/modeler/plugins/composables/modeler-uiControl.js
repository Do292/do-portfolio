import { ref, reactive, computed } from "vue";
import { ID } from "~/system/modeler/constants/modeler_constants.js";

// 최상위 컴포넌트에서 사용할 것; DefaultLayout
const isLoading = ref(false);
const spinnerCounter = ref(0);

export function useSpinner() {
	/**
	 * 비동기 함수 실행 동안 스피너 활성화
	 * @param {Function} callback
	 * @param {Number} delay
	 */
	async function executeWithSpinner(callback, delay = 300) {
		const spinnerId = ++spinnerCounter.value;

		try {
			isLoading.value = true;
			await callback();
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

//can be shared across components
const isShowInformation = ref(false);
const isFixedPin = ref(false);

export function useInformation() {
	const infoConfig = reactive({
		tableId: "",
		columns: [],
		row: {},
	});

	/**
	 * @param {Object} information
	 * @param {String} information.tableId
	 * @param {Object} information.row
	 * @param {Object[]|null} information.columns
	 */
	function setInformation({ tableId = "", columns = [], row = {} }) {
		infoConfig.tableId = tableId;
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

	return {
		// Info
		infoConfig,
		isShowInformation,
		setInformation,
		toggleInformation,

		// Pin
		isFixedPin,
	};
}

//==================== Button
import { AIMCON, FLAG } from "~/plugins/wfb-constants.js";
import { useMenu } from "~/system/modeler/plugins/composables/modeler-authority";

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

//==================== Header
export function useHeader() {
	/**
	 * @param {String[]} fields
	 * @returns {Object[]}
	 */
	function formatConfigsByField(fields) {
		return fields.map(field => ({ [ID.FIELD]: field, [ID.LABEL]: field }));
	}

	return { formatConfigsByField };
}
