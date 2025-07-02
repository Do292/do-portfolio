import {
	ref,
	isRef,
	readonly,
	onMounted,
	onBeforeUnmount,
	watch,
	computed,
} from "vue";
import { useModalConfig } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useMenu } from "~/system/modeler/plugins/composables/modeler-authority";

//==================== Event Listener
const EVENT = readonly({
	KEY_DOWN: "keydown",
	CLICK: "click",
	MOUSE_OUT: "mouseout",
});

/**
 * @param {ref<Element>|Window} target
 * @param {String} type
 * @param {Function} listener
 * @param {Boolean|null} isMenuDependent 메뉴 이동시, 이벤트 초기화가 필요한지
 */
export function useEventListener(target, type, listener, isMenuDependent) {
	const { currentMenuId } = useMenu();
	const targetMenuId = currentMenuId.value;
	const isTargetActive = computed(() => targetMenuId === currentMenuId.value);

	/**
	 * 타겟을 검증하고 이벤트 리스너 추가
	 */
	function attachEventListener() {
		const eventTarget = isRef(target) ? target.value : target;
		eventTarget?.addEventListener(type, listener);
	}

	/**
	 * 이벤트 리스너 제거
	 */
	function detachEventListener() {
		const eventTarget = isRef(target) ? target.value : target;
		eventTarget?.removeEventListener(type, listener);
	}

	// 타겟 검증
	if (target) {
		onMounted(attachEventListener);
		onBeforeUnmount(detachEventListener);
	}

	watch(
		isTargetActive,
		active => {
			// 메뉴 의존적인 이벤트는 경로 변경 시, 토글해준다.
			if (isMenuDependent) {
				active ? attachEventListener() : detachEventListener();
			}
		},
		{ immediate: true }, // 초기 상태 반영
	);

	return { attachEventListener, detachEventListener };
}

//==================== Event Action
export function useAction() {
	/**
	 * https가 아닌 경우, clipboard api를 사용할 수 없어 대체함.
	 * @param {String} text
	 */
	function copyText(text) {
		const $textarea = document.createElement("textarea");
		document.body.appendChild($textarea);

		$textarea.value = text;
		$textarea.select();
		document.execCommand("copy");

		document.body.removeChild($textarea);
	}

	return { copyText };
}

//==================== Key Event
export function useKeyEvent() {
	//==================== Key Handler
	// 조합 키
	const MODIFIER = readonly({
		BUTTON: "shiftKey",
		CONTROL: "ctrlKey",
	});

	// 기본 키
	const KEY = readonly({
		// Modal Action
		APPLY: "F2",
		CLOSE: "F6",
		UPDATE: "F3",
		ENTER: "Enter",
		RESET: "Escape",

		// Button Action(+alt)
		FILTER: "KeyF",
		CREATE: "KeyC",
		MODIFY: "KeyM",
		DELETE: "KeyD",
		EXPORT: "KeyE",
		IMPORT: "KeyI",

		// View Action(+ctrl)
		COPY: "KeyC",
		INFO: "KeyI",
	});

	/**
	 * 지정된 키이벤트가 발생했을 때, 콜백함수를 실행한다.
	 * @param {String} key
	 * @param {Function} callback
	 * @param {String[]} options
	 * @returns {Function}
	 */
	const keyHandler = (key, callback, ...options) => {
		return event => {
			if (options.every(option => event[option]) && event.code === key) {
				event.preventDefault();
				callback(event);
			}
		};
	};

	/**
	 * ctrl 키와 함께 키이벤트가 발생했을 때, 콜백함수를 실행한다.
	 * @param {String} key
	 * @param {Function} callback
	 * @returns {Function}
	 */
	const keyHandlerWithCtrl = (key, callback) =>
		keyHandler(key, callback, MODIFIER.CONTROL);

	//==================== Key Event Listner
	const { copyText } = useAction();
	const { currentModalStack } = useModalConfig();

	/**
	 * @param {ref<Element>|Window} target
	 * @param {Function} callback apply 함수
	 */
	function activateApplyEvent(target, callback) {
		const listener = keyHandler(KEY.APPLY, callback);
		useEventListener(target, EVENT.KEY_DOWN, listener, true);
	}

	/**
	 * @param {ref<Element>|Window} target
	 * @param {Function} getTextValue
	 */
	function activateCopyEvent(target, getTextValue) {
		const copyHandler = event => {
			// 선택한 데이터가 있으면 해당 값을 복사한다.
			const { type } = window.getSelection();
			if (type === "Range") {
				return;
			}

			const text = getTextValue(event);
			if (text) {
				copyText(text);
			}
		};

		const listener = keyHandlerWithCtrl(KEY.COPY, copyHandler);
		useEventListener(target, EVENT.KEY_DOWN, listener, true);
	}

	/**
	 * @param {ref<Element>|Window} target
	 * @param {Function} callback apply 함수
	 */
	function activateUpdateEvent(target, callback) {
		activateAndValidateEvent(target, KEY.UPDATE, callback);
	}

	/**
	 * @param {ref<Element>|Window} target
	 * @param {Function} callback reset 함수
	 */
	function activateResetEvent(target, callback) {
		activateAndValidateEvent(target, KEY.RESET, callback);
	}

	/**
	 * 현재 메뉴에서만 타겟 이벤트를 활성화한다.
	 * @param {ref<Element>|Window} target
	 * @param {String} key
	 * @param {Function} callback
	 */
	function activateAndValidateEvent(target, key, callback) {
		const validateExecutor = event => {
			// 모달 간 혼선 방지
			if (currentModalStack.value.length === 1) {
				callback(event);
			} else {
				/** @todo 에러나면 안 됨! 어디서 모달 이상하게 닫고 있는 거임. */
				console.log("모달 정의 확인", currentModalStack.value);
			}
		};
		const listener = keyHandler(key, validateExecutor);
		useEventListener(target, EVENT.KEY_DOWN, listener, true);
	}

	/**
	 * @param {ref<Element>|Window} target
	 * @param {Object[]} configs {key, action}
	 */
	function activateButtonEvent(target, configs) {
		for (const { key, action } of configs) {
			// 버튼 조합키를 사용한 핸들러 정의
			const listener = keyHandler(key, action, MODIFIER.BUTTON);
			useEventListener(target, EVENT.KEY_DOWN, listener, true);
		}
	}

	/**
	 * 버튼 설정 정의
	 * @param {String} key
	 * @param {Function} callback
	 * @returns {Object} buttonConfig
	 */
	function defineButtonConfig(key, callback) {
		return { key, action: () => callback() };
	}

	return {
		// Handler
		EVENT,
		KEY,
		keyHandler,
		keyHandlerWithCtrl,

		// Event
		activateApplyEvent,
		activateCopyEvent,
		activateUpdateEvent,
		activateResetEvent,

		// Button Event
		activateButtonEvent,
		defineButtonConfig,
	};
}

//==================== Input Focus Generator; Accordion 내부 이벤트 관리
export function useInputFocusGenerator() {
	const INPUT_SELECTOR =
		".e-acrdn-panel:not(.e-content-hide) .input-field-box input.e-control";
	const generator = ref(null);

	/**
	 * input focusing을 위한 제너레이터 함수
	 * @param {HTMLElement[]} $inputs
	 */
	function* focusGenerator($inputs) {
		for (const $input of $inputs) {
			yield $input.focus();
		}

		// 마지막 Input에서 엔터 누를 경우 블러 처리한다.
		if ($inputs.length) {
			yield $inputs.at(-1).blur();
		}
	}

	/**
	 * @param {MouseEvent|null} event
	 * @param {HTMLElement} event.target 선택된 input으로 enter 이벤트의 시작점
	 */
	function initGenerator({ target } = {}) {
		const $inputs = [...document.querySelectorAll(INPUT_SELECTOR)];
		const targetIndex = $inputs.findIndex(
			$input => $input === target?.closest(INPUT_SELECTOR),
		);

		// 해당 target 다음의 활성 input들만 generator 정의
		const $validInputs = $inputs.filter(
			({ classList }, index) =>
				index > targetIndex && !classList.contains("e-disabled"),
		);
		generator.value = focusGenerator($validInputs);
	}

	/**
	 * generator를 검증하고 다음 단계를 수행한다.
	 */
	function nextGenerator() {
		if (generator.value) {
			generator.value.next();
		}
	}

	/**
	 * Generator를 초기화하며 포커스한다.
	 * @param {Number|null} index
	 */
	function initAndFocusGenerator(index) {
		const $inputs = [...document.querySelectorAll(INPUT_SELECTOR)];

		// Index를 지정하지 않으면 첫 번째 empty input 포커싱한다.
		if (!Number.isInteger(index)) {
			index = $inputs.findIndex(({ value }) => !value);
		}

		// target은 undefined일 수 있다.
		const target = $inputs[index - 1];
		initGenerator({ target });
		nextGenerator();
	}

	return {
		generator,
		initGenerator,
		nextGenerator,
		initAndFocusGenerator,
	};
}

//==================== Event Control
export function useEventControl() {
	const DEFAULT_DELAY = 2000;

	/**
	 * 특정 시간(delay) 동안 호출이 발생하지 않으면 callback 실행
	 * @param {Function} callback
	 * @param {Number|null} delay
	 * @returns {Function} closer
	 */
	function debounce(callback, delay = DEFAULT_DELAY) {
		let timerId;

		return event => {
			// 이전 timer 제거
			if (timerId) {
				clearTimeout(timerId);
			}
			timerId = setTimeout(callback, delay, event);
		};
	}

	/**
	 * 지연 시간(delay) 동안 타겟 외 반복 호출 무시
	 * @param {Function} callback
	 * @param {Number} delay
	 * @returns {Function} closer
	 */
	function throttle(callback, delay) {
		let timerId;

		return event => {
			if (timerId) return;

			timerId = setTimeout(() => {
				callback(event);
				timerId = null;
			}, delay);
		};
	}

	return { DEFAULT_DELAY, debounce, throttle };
}
