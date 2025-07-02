<template>
	<div class="wrapper">
		<SuiteHeader />
		<AppLeftSide />
		<div id="content" class="content-wrapper">
			<QmsMainView v-if="isMainView"></QmsMainView>
			<AppTabMenu v-else />
		</div>
	</div>
	<!-- Modal -->
	<AppFooter />
	<ModalConfirm v-if="isShowModalConfirm" @close="closeModalConfirm" />
</template>
<script>
import QmsMainView from "./views/QmsMainView.vue";
import ModalConfirm from "../../components/common/modal/ModalConfirm.vue";

import { computed, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useMenu, useTab, useSystem } from "~/plugins/composables/authority";
import { useModalConfirm } from "~/plugins/composables/modalHandler";

export default {
	name: "QmsLayout",
	components: { QmsMainView, ModalConfirm },
	data() {
		return { isShowLeftSide: false };
	},
	setup() {
		//==================== Common
		const { isShowModalConfirm, closeModalConfirm } = useModalConfirm();

		const route = useRoute();
		const isMainView = computed(() => route.path === "/qms/main");

		//==================== Menu
		const { fetchMenuList } = useMenu();
		const { initTab } = useTab();
		const { setSystemInfo, systemInfo } = useSystem();

		if (systemInfo.id == "" || systemInfo.id != "qms") {
			setSystemInfo({ id: "qms", name: "Qms", commonFlag: true });
		}

		onBeforeMount(async () => {
			await fetchMenuList("qms");
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
