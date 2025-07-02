<template>
	<div id="container" class="header-tab-view">
		<wfl-tabbasic
			ref="tabRef"
			:animation="{
				previous: { effect: 'None' },
				next: { effect: 'FadeIn' },
			}"
			:selectedItem="currentTabIndex"
			:showCloseButton="true"
			:tabActionSettings="{ effect: 'None' }"
			class="e-background"
			overflowMode="Scrollable"
			@removing="removeTab($event.removedIndex)"
			@selected="clickTab"
		>
			<wfl-tabitems>
				<wfl-tabitem
					v-for="tab of tabs"
					:key="tab.getKey()"
					v-bind="tab"
				></wfl-tabitem>
			</wfl-tabitems>
		</wfl-tabbasic>
		<div class="container-fluid">
			<div class="row">
				<div class="col p-0">
					<router-view v-slot="{ Component }" class="content">
						<keep-alive :include="viewNames">
							<component :is="Component"></component>
						</keep-alive>
					</router-view>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useMenu, useTab, useSystem } from "~/plugins/composables/authority";
import { useSpinner } from "~/plugins/composables/uiControl";
import { useTemplate } from "~/plugins/composables/syncfusionHelper";
import { useUpdateData } from "~/plugins/composables/dataHandler";

import { META_TABLE } from "#/modeler/constants/modeler_constants.js";
import * as COMMON from "~/api/common.js";
import { MENU } from "~/plugins/wfb-constants.js";

export default {
	name: "AppTabMenu",
	components: {},
	setup() {
		//==================== Menu
		const { executeWithSpinner } = useSpinner();
		const { goMain } = useMenu();
		const { tabList, currentTabIndex, initTab, selectTab, removeTab } =
			useTab();
		const { systemInfo } = useSystem();
		// Route Name과 같아야 함.
		const viewNames = computed(() =>
			tabList.map(tab => systemInfo.id + `${tab[MENU.ID]}View`),
		);
		const tabs = computed(() => tabList.map(tab => new Tab(tab)));
		const tabRef = ref(null);

		const { Base } = useTemplate("tab");
		const { t } = useI18n();

		class Tab extends Base {
			constructor(tab) {
				super(systemInfo.id + tab[MENU.ID]);
				this.header = { text: t(tab[MENU.NAME]) };
			}
		}

		//==================== Mehtod
		/**
		 * @param {Object} event
		 * @param {Boolean} event.isSwiped
		 * @param {Boolean} event.isInteracted
		 * @param {Number} event.selectedIndex
		 */
		function clickTab({ isSwiped, isInteracted, selectedIndex: index }) {
			if (!isSwiped && isInteracted) {
				//탭 클릭하여 선택한 경우 이벤트 전송
				selectTab(index);
			} else if (index !== currentTabIndex.value) {
				//라우터 이동에 의한 탭 선택
				tabRef.value.select(currentTabIndex.value);
			}
		}

		function removeAllTabs() {
			executeWithSpinner(() => {
				goMain();
				setTimeout(() => initTab(), 100);
			});
		}

		//==================== Meta Config
		const { updateState } = useUpdateData();

		watch(
			() => updateState.tableId,
			tableId => {
				if (Object.values(META_TABLE).includes(tableId)) {
					COMMON.refresh();
				}
			},
		);

		return {
			// Config
			tabRef,
			tabs,

			// Menu
			viewNames,
			currentTabIndex,
			selectTab,
			removeTab,
			removeAllTabs,
			clickTab,
		};
	},
};
</script>
<style scoped>
/* tab content 무시 */
#container > :deep(.e-tab.e-background .e-content.e-lib.e-touch) {
	display: none;
}
</style>
