<template>
	<div class="wrapper">
		<SuiteHeader />
		<AppLeftSide />
		<div id="content" class="content-wrapper">
			<MesMainView v-show="isMainView" />
			<AppTabMenu v-show="!isMainView" />
		</div>
	</div>
	<AppFooter />

	<!-- Modal -->
	<ModalConfirm v-if="isShowModalConfirm" @close="closeModalConfirm" />
</template>
<script>
import MesMainView from "./views/MesMainView.vue";

import { provide, computed, onBeforeMount, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useMenu, useTab, useSystem } from "~/plugins/composables/authority";
import {
	useModalConfig,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";
import {
	useEventListener,
	useKeyEvent,
} from "~/plugins/composables/eventHandler";

export default {
	name: "MesLayout",
	components: { MesMainView },
	setup() {
		//==================== Common
		// const isRefreshed = ref(false);
		const route = useRoute();
		const isMainView = computed(() => route.path === "/mes/main");

		//==================== Modal Confirm
		const {
			isShowModalConfirm,
			openModalConfirm,
			openModalConfirmBy,
			closeModalConfirm,
		} = useModalConfirm();

		// 버튼 이벤트 사용하는 경우 injection 해서 받아야 함.
		provide("confirm", {
			openModalConfirm,
			openModalConfirmBy,
		});

		//==================== Modal Event
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
		const { fetchMenuList } = useMenu();
		const { initTab } = useTab();
		const { systemInfo, systemId, setSystemInfo } = useSystem();

		if (systemInfo.id == "" || systemInfo.id != "mes") {
			setSystemInfo({ id: "mes", name: "Mes", commonFlag: true });
		}

		onBeforeMount(async () => {
			await fetchMenuList(systemId.value);
			initTab();
			// isRefreshed.value = true;
		});

		// MES를 나가면 tab 모두 정리
		onUnmounted(() => {
			initTab();
		});
		return {
			// Menu
			isMainView,
			// isRefreshed,

			// modal
			isShowModalConfirm,
			closeModalConfirm,
		};
	},
	// data() {
	// 	return { isShowLeftSide: false };
	// },
};
</script>
<style scoped></style>
