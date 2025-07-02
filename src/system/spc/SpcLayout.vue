<template>
	<ModalConfirm v-if="isShowModalConfirm" @close="closeModalConfirm" />
	<div class="wrapper">
		<SuiteHeader></SuiteHeader>
		<AppLeftSide></AppLeftSide>
		<div id="content" class="content-wrapper">
			<SpcMainView v-if="isMainView" />
			<AppTabMenu v-else />
		</div>
		<AppFooter />
	</div>
</template>
<script>
import SpcMainView from "./views/SpcMainView.vue";

import { computed, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useMenu, useTab, useSystem } from "~/plugins/composables/authority";
import { useModalConfirm } from "~/plugins/composables/modalHandler";

export default {
	name: "SpcLayout",
	components: { SpcMainView },
	setup() {
		// const isRefreshed = ref(false);
		const route = useRoute();
		const isMainView = computed(() => route.path === "/spc/main");
		//==================== Menu
		const { fetchMenuList } = useMenu();
		const { initTab } = useTab();
		const { setSystemInfo, systemInfo } = useSystem();
		const { isShowModalConfirm, closeModalConfirm } = useModalConfirm();

		if (systemInfo.id == "" || systemInfo.id != "spc") {
			setSystemInfo({ id: "spc", name: "Spc", commonFlag: true });
		}

		onBeforeMount(async () => {
			await fetchMenuList("spc");
			initTab();
		});
		return {
			// Menu
			isMainView,

			// modal
			isShowModalConfirm,
			closeModalConfirm,
		};
	},
};
</script>
<style scoped></style>
