import { useRouter, useRoute } from "vue-router";
import {
	readonly,
	h,
	ref,
	reactive,
	toRefs,
	computed,
	defineAsyncComponent,
} from "vue";
import {
	useFetchData,
	useItem,
	useLocalStorage,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useSpinner,
	useImage,
} from "~/system/modeler/plugins/composables/modeler-uiControl";

import {
	TABLE,
	LAYOUT,
	API_RESPONSE,
	USER,
	SYSTEM,
	ID,
	FLAG,
	DATA_STATE,
} from "~/system/modeler/constants/modeler_constants.js";

//==================== UserInfo
import * as USER_SETTING from "~/system/modeler/api/user.js";

const userState = reactive({
	userInfo: {},
	loggedIn: false,
});

const userId = computed(() => userState.userInfo[USER.ID]);

export function useUserInfo() {
	//==================== Config
	const { toggleLocalStorage } = useLocalStorage();
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
			const { data } = await USER_SETTING.updateImage(
				userKey.value,
				base64,
			);
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
import * as COMMON from "~/system/modeler/api/modeler-common.js";
import { MENU, MENU_TYPE } from "~/system/modeler/constants/tree_constants.js";
import { MENU_RELATION } from "~/system/modeler/constants/table_constants.js";

// can be shared across components
const menuList = ref([]);
const folderList = ref([]);
const tabList = reactive([]);
const currentTab = ref({});

// Auth
const menuAuthConfig = ref({});
const menuItemAuthConfig = ref({});

// Relation
const menuRelationConfig = ref({});

const HOME_PATH = "/main";
const MAIN_PATH = "/modeler/main";
const LOGIN_PATH = "/login";

// View module; 필요한 컴포넌트를 비동기적으로 로드하기 위해 eager false 설정
const VIEW_MODULE = import.meta.glob("/src/system/modeler/views/*/*/**/*.vue", {
	eager: false,
});

export function useMenu() {
	//==================== Router
	const { TYPE, PARENT_ID, SYSTEM_ID, PATH, POSITION } = MENU;
	const { MENU_ID, ITEM_ID, ACCESS_FLAG } = ID;
	const router = useRouter();
	const routePaths = computed(() =>
		router.getRoutes().map(({ path }) => path),
	);

	const AsyncSingleGridView = defineAsyncComponent({
		loader: () =>
			import("~/system/modeler/views/common/SingleGridView.vue"),
		delay: 200,
	});

	class MenuRoute {
		constructor(menu, component) {
			const tableId = menu[MENU_ID];
			const name = tableId + "View";
			this.name = name;
			this.path = menu[PATH];
			this.component = component ?? {
				name,
				render() {
					return h(AsyncSingleGridView, { tableId });
				},
			};
		}
	}

	/**
	 * 메뉴 검증 및 라우트 추가
	 * @param {Object[]} menuList
	 */
	async function validateAndAddRoute(menuList = []) {
		for (const menu of menuList) {
			// Action 메뉴만 라우터에 추가
			const { [PATH]: path, [MENU_ID]: id, [TYPE]: type } = menu;
			if (type === MENU_TYPE.ACTION && !routePaths.value.includes(path)) {
				const component = await defineViewComponent(id);
				router.addRoute(LAYOUT.DEFAULT, new MenuRoute(menu, component));
			}
		}
	}

	/**
	 * 메뉴 ID 기준으로 View Component를 찾아 정의한다.
	 * @param {String} menuId
	 * @returns {Object|null}
	 */
	async function defineViewComponent(menuId) {
		const key = Object.keys(VIEW_MODULE).find(key => {
			const pattern = new RegExp(`/(${menuId})View.vue`);
			return key.match(pattern)?.[1];
		});
		// 파일이 존재하지 않은 경우 null 반환
		if (!key) return;

		const { default: component } = await VIEW_MODULE[key]();
		return component;
	}

	//==================== Menu
	const { MODELER } = SYSTEM;
	const { DATA } = API_RESPONSE;
	const currentMenuId = computed(() => currentTab.value[MENU_ID]);

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
	async function fetchMenuList() {
		// fetchList 사용할 경우 순환 참조 걸림.
		const { data } = await COMMON.getBy(TABLE.MENU, {
			[SYSTEM_ID]: MODELER,
			[ID.DATA_STATE]: DATA_STATE.CREATED,
		});
		const items = data[DATA].sort((a, b) => a[POSITION] - b[POSITION]);

		// 권한 있는 메뉴들만 필터링
		await fetchMenuAuthConfig();
		menuList.value = items.filter(
			item => menuAuthConfig.value[item[MENU_ID]] === FLAG.Y,
		);

		// Folder 정의
		folderList.value = items.filter(
			item =>
				item[TYPE] === MENU_TYPE.FOLDER &&
				menuList.value.some(menu =>
					checkMenuInFolder(item[MENU_ID], menu),
				),
		);

		await validateAndAddRoute(menuList.value);
		initMenuRelation();
	}

	/**
	 * @param {Object|String} config
	 */
	function goMenuAndSetTab(config) {
		const hasTabConfig = typeof config === "object";
		const path = hasTabConfig ? config[PATH] : config;

		currentTab.value = hasTabConfig ? config : {};
		router.push({ path });

		// Item 권한 확인
		fetchMenuItemAuthConfig();
	}

	/**
	 * 현재 탭을 초기화하고, Suite 홈으로 이동
	 */
	function goHome() {
		goMenuAndSetTab(HOME_PATH);
	}

	/**
	 * 현재 탭을 초기화하고, 메인으로 이동
	 */
	function goMain() {
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
			.filter(menu => !menu[PARENT_ID])
			.map(menu => menu[MENU_ID]),
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
	function getSubFolderList(mainId) {
		const pattern = new RegExp(`^/modeler/${mainId}/`, "i");
		return folderList.value.filter(folder => pattern.test(folder[PATH]));
	}

	//==================== Menu Auth
	const currentMenuItemAuthConfig = computed(
		() => menuItemAuthConfig.value[currentMenuId.value] ?? {},
	);

	/**
	 * 사용자의 메뉴 권한을 객체 형태로 정의한다.
	 */
	async function fetchMenuAuthConfig() {
		const { data } = await USER_SETTING.getMenuAuth(MODELER, userId.value);
		menuAuthConfig.value = data[DATA].reduce((acc, cur) => {
			acc[cur[MENU_ID]] = cur[ACCESS_FLAG];
			return acc;
		}, {});

		initMenuItemAuthConfig();
	}

	/**
	 * menuItem 초기화
	 */
	async function initMenuItemAuthConfig() {
		const { data } = await COMMON.getBy(TABLE.MENU_ITEM, {
			[SYSTEM_ID]: MODELER,
		});

		for (const item of data[DATA]) {
			const { [MENU_ID]: menu, [ITEM_ID]: type } = item;

			if (!menuItemAuthConfig.value[menu]) {
				menuItemAuthConfig.value[menu] = {};
			}
			menuItemAuthConfig.value[menu][type] = FLAG.N;
		}

		fetchMenuItemAuthConfig();
	}

	/**
	 * 메뉴 버튼 권한 확인
	 */
	async function fetchMenuItemAuthConfig() {
		const { data } = await USER_SETTING.getMenuItemAuth(
			MODELER,
			userId.value,
		);

		for (const item of data[DATA]) {
			const { [MENU_ID]: menu, [ITEM_ID]: type } = item;

			// MenuItem에 정의된 데이터만 AccessFlag 지정할 수 있다.
			if (menuItemAuthConfig.value[menu]?.[type]) {
				menuItemAuthConfig.value[menu][type] = item[ACCESS_FLAG];
			}
		}
	}

	/**
	 * @param {Object} config
	 * @param {String} type
	 * @returns {Boolean}
	 */
	function checkMenuItemAuth(config = {}, type) {
		return config[type] === FLAG.Y;
	}

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
		const { data } = await COMMON.getBy(TABLE.MENU_RELATION, {
			[ID.DATA_STATE]: DATA_STATE.CREATED,
		});
		for (const relation of data[DATA]) {
			const { [SOURCE]: key, [DESTINATION]: menu } = relation;
			// key, menu 모두 유효한 경우만 추가
			if (key && menu) {
				if (!menuRelationConfig.value[key]) {
					menuRelationConfig.value[key] = [];
				}
				menuRelationConfig.value[key].push(menu);
			}
		}
	}

	return {
		// Path
		MAIN_PATH,
		LOGIN_PATH,

		// Folder
		folderList,
		mainFolderIds,
		getSubFolderList,
		checkMenuInFolder,

		// Menu
		menuList,
		currentMenuId,
		checkMenuAction,
		fetchMenuList,

		// Menu Auth
		menuItemAuthConfig,
		currentMenuItemAuthConfig,
		checkMenuItemAuth,

		// Menu Router
		goMenuAndSetTab,
		goHome,
		goMain,
		goLogin,

		// MenuRelation
		menuRelations,
	};
}

//==================== Tab
export function useTab() {
	const { ID, PATH, NAME } = MENU;
	const route = useRoute();
	const { menuList, goMenuAndSetTab, goMain } = useMenu();
	const { findItem } = useItem();

	const tabNames = computed(() => tabList.map(tab => tab[NAME]));
	const currentTabIndex = computed(() => getTabIndex(currentTab.value));

	/**
	 * path 기준으로 menu data를 찾아 tab에 추가한다.
	 */
	function initTab() {
		// 탭 초기화
		tabList.splice(0);

		const { path } = route;
		if (![MAIN_PATH, LOGIN_PATH].includes(path)) {
			const currentMenu = findItem(menuList.value, PATH, path);
			addTab(currentMenu);
		}
	}

	/**
	 * 메뉴를 검증하고 탭에 추가하거나 선택
	 * @param {String} menuId
	 */
	function addOrSelectTab(menuId) {
		const menu = findItem(menuList.value, ID, menuId);
		const tabIndex = getTabIndex(menu);

		tabIndex === -1 ? addTab(menu) : selectTab(tabIndex);
	}

	/**
	 * 메뉴를 탭에 추가 하고 탭 선택
	 * @param {Object} tabData
	 */
	function addTab(tabData) {
		const length = tabList.push(tabData);
		setTimeout(() => {
			selectTab(length - 1);
		}, 10);
	}

	/**
	 * 선택한 탭으로 path 이동
	 * @param {Number} index
	 */
	function selectTab(index) {
		const tab = tabList[index];
		goMenuAndSetTab(tab);
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

//==================== Encryt
import crypto from "crypto-js";

export function useEncryt() {
	const aesKey = "aimMES240405devbundangdodamrndce";
	const aesIV = "0000000000000000";

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

//==================== Default Factory
import { useFields } from "~/system/modeler/plugins/composables/modeler-tableHandler";

export function useDefaultFactory(enabled, columnsRef) {
	// Default Factory = User Factory
	const { userFactory: defaultFactory } = useUserInfo();

	// Has Default Factory
	const { extractFields } = useFields();
	const hasDefaultFactory = computed(
		() =>
			enabled && extractFields(columnsRef.value).includes(ID.FACTORY_ID),
	);

	/**
	 * defaultFactory가 유효한 경우만 인자에 default factory 추가한다.
	 * @param {Object} params
	 * @param {Boolean|null} force
	 */
	function assignDefaultFactory(params, force) {
		if (force || hasDefaultFactory.value) {
			Object.assign(params, { [ID.FACTORY_ID]: defaultFactory.value });
		}
	}

	return { defaultFactory, hasDefaultFactory, assignDefaultFactory };
}

//==================== System Setting
import { SYSTEM_SETTING } from "~/system/modeler/constants/table_constants.js";

const settingConfig = ref({});

export function useSystemSetting() {
	//==================== Setting Config
	const { ID: SETTING_ID, VALUE: SETTING_VALUE } = SYSTEM_SETTING;
	const KEY = readonly({
		HISTORY_PERIOD: "HISTORY_PERIOD",
		HISTORY_COUNT: "HISTORY_COUNT",
		SESSION_TIMEOUT: "SESSION_TIMEOUT",
	});

	// fetch
	const { assignDataState, fetchList } = useFetchData();

	/**
	 * 모델러의 Setting 정의
	 */
	async function fetchSettingConfig() {
		const param = assignDataState({
			[ID.SYSTEM_ID]: SYSTEM.MODELER,
		});
		const settingList = await fetchList(() =>
			COMMON.getBy(TABLE.SYSTEM_SETTING, param),
		);

		// {id: value} 형식으로 정의
		settingList.forEach(setting => {
			settingConfig.value[setting[SETTING_ID]] = setting[SETTING_VALUE];
		});
	}

	return { KEY, settingConfig, fetchSettingConfig };
}
