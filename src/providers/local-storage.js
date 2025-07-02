// export default {
// 	provide() {
// 		// use function syntax so that we can access `this`
// 		return {
// 			setLocalStorageItem: (key, value) => {
// 				localStorage.setItem(key, value);
// 			},
// 			getLocalStorageItem: key => {
// 				return localStorage.getItem(key);
// 			},
// 			clearLocalStorageItem: () => {
// 				localStorage.clear();
// 			},
// 			removeLocalStorageItem: key => {
// 				localStorage.removeItem(key);
// 			},
// 		};
// 	},
// };
export default {
	install: app => {
		const setLocalStorageItem = (key, value) => {
			localStorage.setItem(key, value);
		};
		const getLocalStorageItem = key => {
			return localStorage.getItem(key);
		};
		const clearLocalStorageItem = () => {
			localStorage.clear();
		};
		const removeLocalStorageItem = key => {
			localStorage.removeItem(key);
		};
		app.provide("setLocalStorageItem", setLocalStorageItem);
		app.provide("getLocalStorageItem", getLocalStorageItem);
		app.provide("clearLocalStorageItem", clearLocalStorageItem);
		app.provide("removeLocalStorageItem", removeLocalStorageItem);
	},
};
