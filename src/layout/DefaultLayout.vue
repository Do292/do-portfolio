<template>
	<div class="wrapper">
		<AppHeader></AppHeader>
		<MainLeftSide v-if="false"></MainLeftSide>
		<div class="main-content-wrapper">
			<transition mode="out-in" name="routing-fade">
				<MainView></MainView>
			</transition>
		</div>
		<AppFooter />
	</div>
</template>
<script>
import { onMounted } from "vue";
import MainView from "~/views/MainView.vue";
import MainLeftSide from "~/components/common/MainLeftSide.vue";
import { useSystem } from "~/plugins/composables/authority";
import { useLanguage } from "~/plugins/composables/locale";

export default {
	name: "DefaultLayout",
	components: { MainView, MainLeftSide },
	setup() {
		const { setSystemInfo } = useSystem();
		const { fetchLanguageList, fetchLanguageConfigs, initLocaleMessage } =
			useLanguage();
		setSystemInfo({ id: "suite", name: "Suite", commonFlag: true });

		onMounted(async () => {
			await fetchLanguageList();
			await fetchLanguageConfigs();
			initLocaleMessage();
		});
	},
	data() {
		return {};
	},
};
</script>
<style scope></style>
