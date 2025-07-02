import { createI18n } from "vue-i18n"; // vue-i18n import

const i18n = createI18n({
	// something vue-i18n options here ...
	locale: "KOREAN",
	fallbackLocale: "ENGLISH",
	messages: {},
	legacy: false,
	warnHtmlMessage: false, //에러 무시
	silentTranslationWarn: true, //에러 무시
	warnCustomKeys: false, //에러 무시
	fallbackWarn: false, //에러 무시
	missingWarn: false, //에러 무시
});
export default i18n;
