<template>
	<div id="container" class="modeler-tab-view header-tab-view">
		<!-- 전체 삭제 후 tab 추가 시, 초기화 오류로 v-if 사용해 랜더링 관리 -->
		<TabTemplate
			v-if="tabNames.length"
			:tabIndex="currentTabIndex"
			:tabKeys="tabNames"
			@close="removeTab"
			@select="selectTab"
		>
			<template v-slot:tabContent>
				<div class="container-fluid">
					<div class="row">
						<div class="col">
							<router-view v-slot="{ Component }" class="content">
								<keep-alive :include="viewNames">
									<component :is="Component"></component>
								</keep-alive>
							</router-view>
						</div>
					</div>
				</div>
			</template>
		</TabTemplate>
		<ButtonClose @click="removeAllTabs" />
	</div>
</template>
<script>
import TabTemplate from "~/system/modeler/components/common/template/TabTemplate";
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";

import { computed, watch } from "vue";
import {
	useMenu,
	useTab,
} from "~/system/modeler/plugins/composables/modeler-authority";
import {
	useEventListener,
	useKeyEvent,
} from "~/system/modeler/plugins/composables/modeler-eventHandler";
import {
	useSpinner,
	useInformation,
} from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useUpdateData } from "~/system/modeler/plugins/composables/modeler-dataHandler";

import { META_TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { MENU } from "~/system/modeler/constants/tree_constants.js";
import * as COMMON from "~/system/modeler/api/modeler-common.js";

export default {
	name: "ModelerTabView",
	components: {
		TabTemplate,
		ButtonClose,
	},
	setup() {
		//==================== Menu
		const { executeWithSpinner } = useSpinner();
		const { goMain } = useMenu();
		const {
			tabList,
			tabNames,
			currentTabIndex,
			initTab,
			selectTab,
			removeTab,
		} = useTab();

		const viewNames = computed(() =>
			tabList.map(tab => `${tab[MENU.ID]}View`),
		);

		/**
		 * 전체 탭 삭제 후 메인 이동
		 */
		function removeAllTabs() {
			executeWithSpinner(() => {
				goMain();
				setTimeout(() => initTab(), 100);
			});
		}

		//==================== Information Event
		const { EVENT, KEY, keyHandlerWithCtrl } = useKeyEvent();
		const { toggleInformation } = useInformation();

		const informationToggler = keyHandlerWithCtrl(
			KEY.INFO,
			toggleInformation,
		);

		// Information 토글 이벤트 등록
		useEventListener(window, EVENT.KEY_DOWN, informationToggler);

		//==================== Meta Config
		const { updateState } = useUpdateData();

		watch(
			() => updateState.tableId,
			tableId => {
				if (Object.values(META_TABLE).includes(tableId)) {
					setTimeout(() => {
						COMMON.refresh();
					}, 500);
				}
			},
		);

		return {
			// Menu
			viewNames,
			tabList,
			tabNames,
			currentTabIndex,
			selectTab,
			removeTab,
			removeAllTabs,
		};
	},
};
</script>
<style scoped>
/* tab content 무시 */
#container > :deep(.e-tab.e-background .e-content.e-lib.e-touch) {
	display: none;
}

/* Card */
:deep(.card-body) {
	overflow: hidden !important;
}
</style>
