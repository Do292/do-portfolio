import store from "~/store";

export default {
	install: app => {
		app.config.globalProperties.$isEmpty = data => {
			if (
				data == "" ||
				data == null ||
				data == undefined ||
				data.length < 1
			) {
				return true;
			}
			return false;
		};

		app.config.globalProperties.$isSame = (item1, item2) => {
			if (item1 == item2) {
				return true;
			}
			return false;
		};

		app.config.globalProperties.$getUserLocale = () => {
			let locale =
				store.state.locale == ""
					? store.getters.getLocale
					: store.state.locale;
			return locale;
		};

		app.config.globalProperties.$checkInformationBox = () => {
			let state =
				store.state.isFixedPin == ""
					? store.getters.isFixedPin
					: store.state.isFixedPin;

			if (state == false) {
				store.commit("SET_FLAG_SHOWINFO", false);
			}
		};

		app.config.globalProperties.$hasOwnProperty = (object, key) => {
			return Object.prototype.hasOwnProperty.call(object, key);
		};

		app.config.globalProperties.$sortItems = (items, key) => {
			return items.sort((a, b) => {
				return Number(a[key]) < Number(b[key])
					? -1
					: Number(a[key]) > Number(b[key])
					? 1
					: 0;
			});
		};
	},
};
