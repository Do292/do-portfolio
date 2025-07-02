<template>
	<!-- View -->
	<div v-if="!isRefreshing" :class="wrapperClass">
		<AppHeader />
		<AppLeftSide />
		<div id="content" class="content-wrapper">
			<MainView v-show="isMainView" />
			<TabView v-show="!isMainView" />
		</div>
		<AppFooter />
		<Spinner v-if="isLoading" />
	</div>
	<Spinner v-else />

	<!-- 전역 모달 -->
	<ModalAlert v-if="isShowModalAlert" @close="closeModalAlert" />
	<ModalResult v-if="isShowModalResult" @close="closeModalResult" />
	<ModalSearch v-if="isShowModalSearch" @close="closeModalSearch" />
	<ModalConfirm v-if="isShowModalConfirm" @close="closeModalConfirm" />
	<ModalSuccess />
</template>
<script>
import AppHeader from "~/system/modeler/components/common/ModelerAppHeader";
import AppFooter from "~/system/modeler/components/common/ModelerAppFooter";
import AppLeftSide from "~/system/modeler/components/common/ModelerAppLeftSide";

import MainView from "~/system/modeler/views/ModelerMainView";
import TabView from "~/system/modeler/views/ModelerTabView";

// Modeler
import ModalConfirm from "~/system/modeler/components/common/modal/ModalConfirm";
import ModalAlert from "~/system/modeler/components/common/modal/ModalAlert";
import ModalResult from "~/system/modeler/components/common/modal/ModalResult";
import ModalSearch from "~/system/modeler/components/common/modal/ModalSearch";
import ModalSuccess from "~/system/modeler/components/common/modal/ModalSuccess";

import { ref, computed, onBeforeMount } from "vue";
import { useRoute } from "vue-router";

// Common
import { useSystem } from "~/plugins/composables/authority";
import { useFetchData } from "~/plugins/composables/dataHandler";

// Modeler
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useModalConfig,
	useModalAlert,
	useModalResult,
	useModalSearch,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useEventListener,
	useKeyEvent,
} from "~/system/modeler/plugins/composables/modeler-eventHandler";
import {
	useMenu,
	useTab,
	useUserInfo,
} from "~/system/modeler/plugins/composables/modeler-authority";
import { useLanguage } from "~/system/modeler/plugins/composables/modeler-locale";

import * as USER from "~/system/modeler/api/user.js";
import { SYSTEM } from "~/system/modeler/constants/modeler_constants.js";
import { MENU } from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "ModelerLayout",
	components: {
		// Layout
		AppHeader,
		AppFooter,
		AppLeftSide,

		// view
		TabView,
		MainView,

		// Modal
		ModalAlert,
		ModalConfirm,
		ModalResult,
		ModalSearch,
		ModalSuccess,
	},
	setup() {
		//==================== Common
		// Loading
		const { isLoading } = useSpinner();

		const wrapperClass = computed(() =>
			isLoading.value ? "loading wrapper" : "wrapper",
		);

		// Config
		const { fetchLanguageList, fetchLanguageConfigs, initLocaleMessage } =
			useLanguage();
		const { fetchOne } = useFetchData();
		const { initUserState } = useUserInfo();
		const { setSystemInfoBy } = useSystem();

		//==================== Modal
		const { isShowModalAlert, closeModalAlert } = useModalAlert();
		const { isShowModalConfirm, closeModalConfirm } = useModalConfirm();
		const { isShowModalSearch, closeModalSearch } = useModalSearch();
		const { isShowModalResult, openModalResult, closeModalResult } =
			useModalResult();

		// Event
		const { currentModalStack } = useModalConfig();
		const { EVENT, KEY, keyHandler } = useKeyEvent();

		// F6 키를 누를 경우, 현재 View의 가장 마지막 모달 닫기
		const modalCloser = keyHandler(KEY.CLOSE, () => {
			if (currentModalStack.value.length > 0) {
				const { toggleModal } = currentModalStack.value.at(-1) ?? {};
				toggleModal(false);
			}
		});

		// 모달 클로즈 이벤트
		useEventListener(window, EVENT.KEY_DOWN, modalCloser);

		//==================== Menu
		const route = useRoute();
		const { MAIN_PATH } = useMenu();

		const isMainView = computed(() => route.path === MAIN_PATH);
		const isRefreshing = ref(true);

		const { fetchMenuList, menuList } = useMenu();
		const { initTab, addOrSelectTab } = useTab();

		onBeforeMount(async () => {
			await init();

			// Redirect 임시 처리
			const { redirectFrom } = route.query;
			if (redirectFrom) {
				const { [MENU.ID]: menuId } = menuList.value.find(
					({ [MENU.PATH]: path }) => path === redirectFrom,
				);
				addOrSelectTab(menuId);
			}

			isRefreshing.value = false;
		});

		/**
		 * 임의로 로그인 후 default Factory 사용
		 */
		async function init() {
			// System 정의
			setSystemInfoBy(SYSTEM.MODELER);

			// Language
			await fetchLanguageList();
			await fetchLanguageConfigs();
			initLocaleMessage();

			// 로그인 임시
			const data = await fetchOne(() =>
				USER.logIn("admin", "QQMqgUpMTloaetGDiKXcew=="),
			);

			// data가 있을 경우 = 로그인 성공
			if (data) {
				initUserState(data, true);
			}

			// Menu
			await fetchMenuList();
			initTab();
		}

		return {
			// Common
			isLoading,
			wrapperClass,

			// Alert
			isShowModalAlert,
			closeModalAlert,

			// Result
			isShowModalResult,
			openModalResult,
			closeModalResult,

			// Search
			isShowModalSearch,
			closeModalSearch,

			// Confirm
			isShowModalConfirm,
			closeModalConfirm,

			// Menu
			isMainView,
			isRefreshing,
		};
	},
};
</script>
<style scoped>
/* Router Transition */
.routing-fade-enter-active,
.routing-fade-leave-active {
	transition: opacity 0s ease;
}
.routing-fade-enter, .routing-fade-leave-to
	/* .routing-fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}

/* Content */
.wrapper.loading::after {
	content: "";
	position: absolute;
	display: block;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1000;
}
.e-content-animation {
	transform: none;
}
/*
.content-wrapper {
	position: absolute;
	width: calc(100% + 10px);
	top: 0px;
	left: 55px;
}*/
</style>
