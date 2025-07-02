export default {
	data() {
		return {
			// ALERT MODAL
			isShowModalAlert: false,
			modalAlertHeaderTitle: "",
			modalAlertHeaderDivClass: "",
			modalAlertHeaderIClass: "",
			modalAlertBodyTag: "",
			modalAlertResult: {},
		};
	},
	inject: [
		"modalServiceHeaderTitle",
		"modalServiceHeaderDivClass",
		"modalServiceHeaderIClass",
		"modalServiceBodyTag",
	],
	created() {},
	mounted() {},
	methods: {
		showModal(type, title, message, result) {
			const modalType = type;
			let modalInfo = {
				headerTitle: this.modalServiceHeaderTitle(modalType),
				headerDivClass: this.modalServiceHeaderDivClass(modalType),
				headerIClass: this.modalServiceHeaderIClass(modalType),
				bodyTag: this.modalServiceBodyTag(modalType, title, message),
			};
			this.modalAlertHeaderTitle = modalInfo.headerTitle;
			this.modalAlertHeaderDivClass = modalInfo.headerDivClass;
			this.modalAlertHeaderIClass = modalInfo.headerIClass;
			this.modalAlertBodyTag = modalInfo.bodyTag;
			this.modalAlertResult = result;
		},
	},
};
