<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>
<script>
import { onBeforeMount } from "vue";
import { useLanguage } from "~/plugins/composables/locale";

export default {
	name: "LoginLayout",
	components: {},
	setup() {
		const { fetchLanguageList, fetchLanguageConfigs, initLocaleMessage } =
			useLanguage();

		onBeforeMount(async () => {
			await fetchLanguageList();
			await fetchLanguageConfigs();
			initLocaleMessage();
		});
	},
};
</script>
<style></style>
