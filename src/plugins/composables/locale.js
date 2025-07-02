import { ref, computed, readonly } from "vue";
import { useI18n } from "vue-i18n";

//==================== Language
import * as COMMON from "~/system/modeler/api/modeler-common";
import { TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { API_RESPONSE } from "~/plugins/wfb-constants.js";

export const LANGUAGE_FIELD = readonly({
	VALUE: "ENUMVALUE",
	TEXT: "VALUE1",
});

const languageList = ref([]);
const languageConfigs = ref([]);

export function useLanguage() {
	//==================== Config
	const languageValues = computed(() =>
		languageList.value.map(language => language[LANGUAGE_FIELD.VALUE]),
	);
	const languageValueConfig = computed(() =>
		languageList.value.reduce((acc, cur) => {
			acc[cur[LANGUAGE_FIELD.VALUE]] = cur[LANGUAGE_FIELD.TEXT];
			return acc;
		}, {}),
	);

	/**
	 * Language 리스트 초기화
	 */
	async function fetchLanguageList() {
		const condition = { ["ENUMNAME"]: "Language" };
		const { data } = await COMMON.getBy(TABLE.ENUM_VALUE, condition);

		languageList.value = data[API_RESPONSE.DATA];
	}

	/**
	 * fetchLocale 이후 value 초기화
	 */
	async function fetchLanguageConfigs() {
		const { data } = await COMMON.getBy(TABLE.MULTI_LANGUAGE_DEF);

		languageConfigs.value = data[API_RESPONSE.DATA];
	}

	//==================== I18n
	const i18n = useI18n();
	const { decode } = useUnicode();

	/**
	 * i18n 메시지 데이터 초기화
	 */
	function initLocaleMessage() {
		for (const language of languageValues.value) {
			// key, value 형태의 객체
			const messageValue = languageConfigs.value.reduce(
				(acc, { ["NLSID"]: key, [language]: value }) => {
					acc[key] = decode(value);
					return acc;
				},
				{},
			);

			i18n.setLocaleMessage(language, messageValue);
		}
	}

	return {
		// Locale Resource
		languageList,
		languageValues,
		languageValueConfig,
		languageConfigs,
		fetchLanguageList,
		fetchLanguageConfigs,

		// I18n
		initLocaleMessage,
	};
}

//==================== Naming
export function useNaming() {
	/**
	 * @param {String|null} camel
	 * @returns {String} pascal
	 */
	function camelToPascal(camel = "") {
		return camel.replace(/^[a-z]/, letter => letter.toUpperCase());
	}

	/**
	 * @param {String|null} pascal
	 * @returns {String} camel
	 */
	function pascalToCamel(pascal = "") {
		return pascal.replace(/^[A-Z]+/, letter => letter.toLowerCase());
	}

	/**
	 * @param {String|null} pascalOrKebab
	 * @returns {String} camel
	 */
	function pascalOrKebabToCamel(pascalOrKebab = "") {
		return pascalOrKebab
			.replace(/-([A-Z])/g, (_, p1) => p1.toUpperCase())
			.replace(/^[A-Z]/, match => match.toLowerCase());
	}

	/**
	 * @param {String|null} pascal
	 * @returns {String} kebab
	 */
	function pascalToKebab(pascal = "") {
		return pascal.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
	}

	/**
	 * @param {String|null} snake
	 * @returns {String} camel
	 */
	function snakeToCamel(snake = "") {
		return snake
			.toLowerCase()
			.replace(/_./g, letter => letter.charAt(1).toUpperCase());
	}

	/**
	 * @param {String|null} snake
	 * @returns {String} Pascal
	 */
	function snakeToPascal(snake = "") {
		return camelToPascal(snakeToCamel(snake));
	}

	return {
		camelToPascal,
		pascalToCamel,
		pascalOrKebabToCamel,
		pascalToKebab,
		snakeToCamel,
		snakeToPascal,
	};
}

//==================== Unicode
export function useUnicode() {
	/**
	 * @param {String} unicode
	 * @returns {String}
	 */
	function decode(unicode) {
		return unicode ? JSON.parse(`"${unicode}"`) : "";
	}

	/**
	 * @param {String} text
	 * @returns {String}
	 */
	function encode(text) {
		const transformUnicode = char =>
			`\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;

		return [...text].reduce((acc, cur) => acc + transformUnicode(cur), "");
	}

	return { decode, encode };
}
