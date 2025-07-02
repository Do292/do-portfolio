<template>
	<ModalAlert v-if="isShowModalAlert" @close="closeModalAlert" />
	<ModalSuccess />
	<div id="app">
		<router-view></router-view>
		<Spinner v-if="isLoading" />
	</div>
</template>

<script>
import { provide } from "vue";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import { useSpinner } from "~/plugins/composables/uiControl";

export default {
	name: "App",
	components: {},
	setup() {
		//==================== Modal
		const {
			isShowModalAlert,
			openModalInfo,
			openModalWarning,
			openModalError,
			closeModalAlert,
		} = useModalAlert();

		// Stack 관리를 위해 injection 해서 받아야 함.
		provide("alert", {
			isShowModalAlert,
			openModalInfo,
			openModalWarning,
			openModalError,
		});

		// Loading
		const { isLoading } = useSpinner();

		return {
			// Common
			isLoading,

			// Modal
			isShowModalAlert,
			closeModalAlert,
		};
	},
};
</script>

<style></style>
