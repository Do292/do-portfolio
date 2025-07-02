import store from "~/store";
import moment from "moment";

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

		// app.config.globalProperties.$getCols = name => {
		// 	let columns = COLUMNS.getColumnInfo(name);
		// 	return columns;
		// };

		app.config.globalProperties.$getUserLocale = () => {
			let locale =
				store.state.locale == ""
					? store.getters.getLocale
					: store.state.locale;
			return locale;
		};

		app.config.globalProperties.$getGridSelectedItems = grid => {
			// let items = grid.rows ? grid.rows : grid._data.selectedItems;
			// let num = CC.SELECTED_OPTION_NUMBER;
			let items = grid.getSelectedItems();
			let num = null;

			if (items) {
				if (num) {
					// let filterList = items.filter(r => r.isSelected == true);
					// return filterList.slice(0, num);
					return items.slice(0, num);
				} else {
					// let filterList = items.filter(r => r.isSelected == true);
					// return filterList;
					return items;
				}
			} else {
				// items = grid._data.selectedItems;
				// if (num) {
				// 	return items.slice(0, num);
				// } else {
				// 	return items;
				// }
			}
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

		app.config.globalProperties.$isValidDate = date => {
			if (date == "Invalid date") {
				return false;
			}
			return true;
		};

		app.config.globalProperties.$moment = () => {
			return moment();
		};
	},
};
