import { useRouter, useRoute } from "vue-router";
import { h, ref, reactive, toRef, toRefs, computed, readonly } from "vue";
import { useItem, useLocalStorage } from "~/plugins/composables/dataHandler";
import {
	LAYOUT,
	API_RESPONSE,
	USER,
	MENU_TYPE,
	THEME,
	MENU,
} from "~/plugins/wfb-constants.js";

export const TABLE = readonly({
	ALARM_ACTION: "AlarmAction",
	ALARM_DEF: "AlarmDef",
	COLUMN_DEF: "ColumnDef",
	ENUM_VALUE: "EnumValue",
	FACTORY: "Factory",
	GRID_COLUMN_DEF: "GridColumnDef",
	GRID_TABLE_DEF: "GridTableDef",
	MENU: "Menu",
	MENU_RELATION: "MenuRelation",
	MULTI_LANGUAGE_DEF: "MultiLanguageDef",
	SYSTEM_DEF: "SystemDef",
	TABLE_DEF: "TableDef",
	USER_INFO: "UserInfo",
});

import { useSpinner, useImage } from "~/plugins/composables/uiControl";
//==================== UserInfo
import * as USER_API from "~/system/modeler/api/user.js";

const userState = reactive({
	userInfo: {},
	loggedIn: false,
});
const userId = computed(() => userState.userInfo[USER.ID]);

export function useUserInfo() {
	//==================== Config
	const { getAllLocalStorage, toggleLocalStorage } = useLocalStorage();
	const { filterItem } = useItem();
	const userKey = computed(() => ({
		[USER.ID]: userId.value,
	}));

	/**
	 * @param {Object|null} userInfo
	 * @param {Boolean|null} loggedIn
	 */
	function initUserState(userInfo, loggedIn) {
		const user = filterItem(userInfo, Object.values(USER));
		toggleLocalStorage("userInfo", user);
		toggleLocalStorage("loggedIn", loggedIn);

		setUserState(userInfo, loggedIn);
	}

	/**
	 * @param {Object|null} userInfo
	 * @param {Boolean|null} loggedIn
	 */
	function setUserState(userInfo, loggedIn) {
		userState.userInfo = userInfo ?? {};
		userState.loggedIn = loggedIn ?? false;
	}

	function mergeUserInfo(config) {
		Object.assign(userState.userInfo, config);
		toggleLocalStorage("userInfo", userState.userInfo);
	}

	// BeforeMount JIHYUN 확인 필요
	// const { userInfo, loggedIn } = getAllLocalStorage();
	// setUserState(userInfo, loggedIn);

	//==================== User Info
	const { RESULT, SUCCESS } = API_RESPONSE;
	const { executeWithSpinner } = useSpinner();
	const { formatImageUrl } = useImage();

	const userImage = computed(() =>
		formatImageUrl(userState.userInfo[USER.IMAGE]),
	);
	const userLanguage = computed(() => userState.userInfo[USER.LANGUAGE]);
	const userFactory = computed(() => userState.userInfo[USER.FACTORY_ID]);

	function updateUserImage(base64) {
		executeWithSpinner(async () => {
			const { data } = await USER_API.updateImage(userKey.value, base64);
			if (data[RESULT] === SUCCESS) {
				mergeUserInfo({ [USER.IMAGE]: base64 });
			}
		});
	}

	return {
		// config
		...toRefs(userState),
		userId,
		initUserState,
		setUserState,
		mergeUserInfo,

		// Image
		userImage,
		updateUserImage,

		// Language
		userLanguage,

		// Factory
		userFactory,
	};
}

//==================== Menu
import * as COMMON from "~/api/common.js";
import * as MODELER_COMMON from "~/system/modeler/api/modeler-common.js";

export const NODE_FIELD = readonly({
	ID: "NODEID",
	CHILDREN: "CHILD_NODE",
});

const MENU_RELATION = readonly({
	SYSTEM_ID: "SYSTEMID",
	SOURCE: "SOURCEMENUID",
	DESTINATION: "DESTINATIONMENUID",
});

// can be shared across components
const menuList = ref([]);
const folderList = ref([]);
const tabList = reactive([]);
const currentTab = ref({});

// Auth
const menuItemAuthConfig = ref({});

// Relation
const menuRelationConfig = ref({});

// Path
const MAIN_PATH = "/main";
const LOGIN_PATH = "/login";
const SYSTEM_MAIN_PATH = [
	"/mes/main",
	"/spc/main",
	"/qms/main",
	"/modeler/main",
];

import SingleGridView from "~/views/SingleGridView.vue";

export function useMenu() {
	//==================== System
	const { systemId } = useSystem();

	//==================== Router
	const router = useRouter();
	const { ID, TYPE, SYSTEM_ID, PATH, POSITION } = MENU;
	const routePaths = computed(() =>
		router.getRoutes().map(({ path }) => path),
	);

	// const AsyncSingleGridView = defineAsyncComponent(() => SingleGridView);

	class MenuRoute {
		constructor(menu, systemId) {
			const menuId = systemId + menu[ID];
			const name = menuId + "View";
			this.name = name;
			this.path = menu[PATH];
			this.component = {
				name,
				render() {
					return h(SingleGridView, { menuId });
				},
			};
		}
	}

	/**
	 * 메뉴 검증 및 라우트 추가
	 * @param {Object[]} menuList
	 */
	async function validateAndAddRoute(menuList = [], systemId) {
		for (const menu of menuList) {
			const path = `${menu[PATH]}`;
			if (checkMenuAction(menu) && !routePaths.value.includes(path)) {
				const route = new MenuRoute(menu, systemId);
				router.addRoute(LAYOUT[systemId], route);
			}
		}
	}

	//==================== Menu
	const { DATA } = API_RESPONSE;

	const currentMenuId = computed(() => currentTab.value[ID]);

	/**
	 * @param {Object} config
	 * @returns {Boolean}
	 */
	function checkMenuAction(config) {
		return config[TYPE] === MENU_TYPE.ACTION;
	}

	/**
	 * 메뉴 리스트 초기화
	 */
	async function fetchMenuList(systemId) {
		// fetchList 사용할 경우 순환 참조 걸림.
		const { data } = await MODELER_COMMON.getBy(TABLE.MENU, {
			[SYSTEM_ID]: systemId,
		});
		const items = data[DATA].sort((a, b) => a[POSITION] - b[POSITION]);

		// Action 메뉴들만 필터링
		menuList.value = items.filter(checkMenuAction);

		// Folder 정의
		folderList.value = items.filter(
			item =>
				!checkMenuAction(item) &&
				menuList.value.some(menu =>
					checkMenuInFolder(item[MENU.ID], menu),
				),
		);

		await validateAndAddRoute(menuList.value, systemId);
		// initMenuRelation();
	}

	/**
	 * @param {Object|String|null} config
	 */
	function goMenuAndSetTab(config, state) {
		const hasTabConfig = config && typeof config === "object";
		const path = hasTabConfig ? config["VIEWID"] : config;
		currentTab.value = hasTabConfig ? config : {};
		router.push({ path, state });
	}

	/**
	 * 현재 탭을 초기화하고, 메인으로 이동
	 */
	function goMain() {
		// System의 main으로 이동
		const mainPath = `/${systemId.value}${MAIN_PATH}`;
		goMenuAndSetTab(mainPath);
	}
	/**
	 * 현재 탭을 초기화하고, Suite 메인으로 이동
	 */
	function goHome() {
		goMenuAndSetTab(MAIN_PATH);
	}

	/**
	 * 현재 탭을 초기화하고, 로그인 화면으로 이동
	 */
	function goLogin() {
		goMenuAndSetTab(LOGIN_PATH);
	}

	//==================== Folder
	const mainFolderIds = computed(() =>
		folderList.value
			.filter(menu => !menu[MENU.PARENT_ID])
			.map(menu => menu[MENU.ID]),
	);

	/**
	 * 메뉴가 해당 폴더에 존재하는지 확인한다.
	 * @param {String} folderId
	 * @param {String} menu
	 * @returns {Object[]}
	 */
	function checkMenuInFolder(folderId, menu) {
		const pattern = new RegExp(`/${folderId}/`, "i");
		return pattern.test(menu[PATH]);
	}

	/**
	 * @param {String} mainId
	 * @returns {Object[]}
	 */
	function getSubFolderList(mainId, systemId) {
		const pattern = new RegExp(`^/${systemId}/${mainId}/`, "i");
		return folderList.value.filter(folder => pattern.test(folder[PATH]));
	}

	//==================== Menu Auth
	const currentMenuItemAuthConfig = computed(
		() => menuItemAuthConfig.value[currentMenuId.value] ?? {},
	);

	//==================== Menu Relation
	const { SOURCE, DESTINATION } = MENU_RELATION;
	const menuRelations = computed(
		() => menuRelationConfig.value[currentMenuId.value],
	);

	/**
	 * Menu Relation 초기화
	 */
	async function initMenuRelation() {
		menuRelationConfig.value = {};

		// fetchList 사용할 경우 순환 참조 걸림.
		const { data } = await COMMON.getBy({
			metaDataId: TABLE.MENU_RELATION,
		});
		for (const relation of data[API_RESPONSE.DATA]) {
			const { [SOURCE]: key, [DESTINATION]: menu } = relation;
			if (!menuRelationConfig.value[key]) {
				menuRelationConfig.value[key] = [];
			}
			menuRelationConfig.value[key].push(menu);
		}
	}

	return {
		// Menu Route
		goMenuAndSetTab,
		goMain,
		goLogin,
		goHome,

		// Menu
		MENU,
		menuList,
		currentMenuId,
		fetchMenuList,
		checkMenuAction,

		// Folder
		folderList,
		mainFolderIds,
		getSubFolderList,
		checkMenuInFolder,

		// Menu Auth
		menuItemAuthConfig,
		currentMenuItemAuthConfig,

		// MenuRelation
		menuRelations,
		initMenuRelation,
	};
}

//==================== Tab
export function useTab() {
	//==================== Config
	const route = useRoute();
	const { ID, NAME, PATH } = MENU;
	const { menuList, goMenuAndSetTab, goMain } = useMenu();
	const { findItem } = useItem();

	//==================== Tab Handler
	const tabNames = computed(() => tabList.map(tab => tab[NAME]));
	const currentTabIndex = computed(() => getTabIndex(currentTab.value));

	/**
	 * path 기준으로 menu data를 찾아 tab에 추가한다.
	 */
	function initTab() {
		// 탭 초기화
		tabList.splice(0);

		const { path } = route;
		if (
			![MAIN_PATH, LOGIN_PATH].includes(path) &&
			!SYSTEM_MAIN_PATH.includes(path)
		) {
			const currentMenu = findItem(menuList.value, PATH, path);
			addTab(currentMenu);
		}
	}

	/**
	 * 메뉴를 검증하고 탭에 추가하거나 선택
	 * @param {String} menuId
	 */
	function addOrSelectTab(menuId, data) {
		const menu = findItem(menuList.value, ID, menuId);
		const tabIndex = getTabIndex(menu);

		tabIndex === -1 ? addTab(menu, data) : selectTab(tabIndex, data);
	}

	/**
	 * 메뉴를 탭에 추가 하고 탭 선택
	 * @param {Object} tabData
	 */
	function addTab(tabData, data) {
		const length = tabList.push(tabData);
		selectTab(length - 1, data);
	}

	/**
	 * 선택한 탭으로 path 이동
	 * @param {Number} index
	 */
	function selectTab(index, data) {
		const tab = tabList[index];
		goMenuAndSetTab(tab, data);
	}

	/**
	 * @param {Number} index
	 */
	function removeTab(index) {
		const [removedTab] = tabList.splice(index, 1);

		if (!tabList.length) {
			// 남은 탭이 없으면 메인으로 이동
			goMain();
		} else if (currentTab.value === removedTab) {
			// 현재 탭 삭제시, 다음 탭 선택
			const newIndex = index === tabList.length ? index - 1 : index;
			selectTab(newIndex);
		}
	}

	/**
	 * tab index 반환
	 * @param {Object} targetTab
	 * @returns {Number}
	 */
	function getTabIndex(targetTab) {
		return tabList.findIndex(tab => tab?.[ID] === targetTab?.[ID]);
	}

	return {
		// Tab Value
		tabList,
		tabNames,
		currentTab,
		currentTabIndex,

		// Method
		initTab,
		addOrSelectTab,
		addTab,
		selectTab,
		removeTab,
		getTabIndex,
	};
}

//==================== System
const systemInfo = reactive({ id: "", name: "", commonFlag: true });

export function useSystem() {
	const systemId = toRef(systemInfo, "id");
	const { toggleLocalStorage } = useLocalStorage();

	/**
	 * @param {String} id SystemId
	 * @param {String} name SystemName
	 * @param {Boolean} commonFlag
	 */
	function setSystemInfo({ id, name, commonFlag }) {
		document.documentElement.setAttribute("data-theme", THEME[id]);
		systemInfo.id = id;
		systemInfo.name = name;
		systemInfo.commonFlag = commonFlag;
		toggleLocalStorage("systemInfo", systemInfo);
	}

	/**
	 * name 기준으로 Info 할당
	 * @param {String} name
	 * @param {Boolean|null} commonFlag
	 */
	function setSystemInfoBy(name, commonFlag) {
		const id = name.toLowerCase();
		setSystemInfo({ id, name, commonFlag });
	}

	return { systemId, systemInfo, setSystemInfo, setSystemInfoBy };
}

//==================== Encryt
import crypto from "crypto-js";

export function useEncryt() {
	const aesKey = import.meta.env.VITE_APP_AES_KEY;
	const aesIV = import.meta.env.VITE_APP_AES_IV;

	/**
	 * AES 암호화에 필요한 키와 IV를 반환
	 * @returns {Object} 키와 IV 객체
	 */
	function getAesParams() {
		const key = crypto.enc.Utf8.parse(aesKey);
		const iv = crypto.enc.Hex.parse(aesIV);
		return { key, iv };
	}

	/**
	 * 파라미터를 암호화한 후 반환
	 * @param {*}  value 암호화할 값
	 * @return {String} 암호화된 값
	 */
	function encryptValue(value) {
		const { key, iv } = getAesParams();
		const cipher = crypto.AES.encrypt(String(value), key, {
			iv: iv,
			mode: crypto.mode.CBC,
			padding: crypto.pad.Pkcs7,
		});
		return cipher.toString();
	}

	return { encryptValue };
}
