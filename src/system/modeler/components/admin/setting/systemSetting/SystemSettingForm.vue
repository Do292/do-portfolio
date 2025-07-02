<template>
	<div class="card">
		<div class="card-body">
			<HeaderSystem @select="selectSystemId" />
			<div class="row mb-1">
				<div class="col-10 item-title">
					<label> SystemSetting </label>
					<BreadcrumbTemplate
						:isSelectable="false"
						:items="[selectedSystemId]"
					/>
				</div>
				<div class="col-2 text-right mt-1">
					<div class="item-box right-space">
						<ButtonBasic
							type="refresh"
							@onClick="fetchSettingList"
						/>
						<ButtonText
							:needsAuthority="true"
							type="apply"
							@onClick="applySettingConfig"
						/>
					</div>
				</div>
			</div>
			<div class="row">
				<div :key="currentRef" class="col box-container">
					<SystemSettingBox
						v-for="(setting, index) in settingList"
						:key="index"
						v-model="settingConfig[setting[SYSTEM_SETTING.ID]]"
						:setting="setting"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";

import SystemSettingBox from "~/system/modeler/components/admin/setting/systemSetting/SystemSettingBox";

import { ref } from "vue";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import { TABLE, ID } from "~/system/modeler/constants/modeler_constants.js";
import { SYSTEM_SETTING } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "SystemSettingForm",
	components: {
		HeaderSystem,
		BreadcrumbTemplate,
		ButtonText,
		ButtonBasic,
		SystemSettingBox,
	},
	setup() {
		//==================== System
		const selectedSystemId = ref("");

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		function selectSystemId(systemId) {
			// 기존 선택된 시스템과 다를 경우만
			if (selectedSystemId.value !== systemId) {
				selectedSystemId.value = systemId;
				fetchSettingList();
			}
		}

		//==================== System Setting
		const { ID: SETTING_ID, VALUE: SETTING_VALUE } = SYSTEM_SETTING;
		const { executeWithSpinner } = useSpinner();
		const { assignDataState, fetchList } = useFetchData();
		const settingList = ref([]);

		/**
		 * 선택한 System의 Setting List 순서대로 할당
		 */
		function fetchSettingList() {
			executeWithSpinner(async () => {
				const param = assignDataState({
					[ID.SYSTEM_ID]: selectedSystemId.value,
				});
				const data = await fetchList(() =>
					COMMON.getBy(TABLE.SYSTEM_SETTING, param),
				);
				settingList.value = data.sort(
					(a, b) => a[ID.POSITION] - b[ID.POSITION],
				);

				// Config 초기화
				initSettingConfig();
			});
		}

		// Config
		const currentRef = ref(0);
		const settingConfig = ref({});
		const { modifyList } = useUpdateData();

		/**
		 * SettingId를 key로 하는 config를 정의한다.
		 */
		function initSettingConfig() {
			settingConfig.value = {};
			settingList.value.forEach(setting => {
				settingConfig.value[setting[SETTING_ID]] =
					setting[SETTING_VALUE];
			});

			currentRef.value++;
		}

		/**
		 * 변경된 값만 Modify 수행
		 */
		function applySettingConfig() {
			const items = [];
			for (const setting of settingList.value) {
				const newValue = settingConfig.value[setting[SETTING_ID]];
				if (setting[SETTING_VALUE] !== newValue) {
					setting[SETTING_VALUE] = `${newValue}`;
					items.push(setting);
				}
			}

			executeWithSpinner(() =>
				modifyList(TABLE.SYSTEM_SETTING, items, "", false),
			);
		}

		return {
			// System
			selectedSystemId,
			selectSystemId,

			// System Setting
			SYSTEM_SETTING,
			settingList,
			fetchSettingList,

			// Config
			currentRef,
			settingConfig,
			applySettingConfig,
		};
	},
};
</script>
<style scoped>
/* Box Container */
.box-container {
	height: calc(100vh - 250px) !important;
	border: 1px solid #e0e0e0;
	border-radius: 7px;
	padding: 0 10px;
	overflow: auto;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-auto-rows: minmax(140px, 160px);
	grid-column-gap: 30px;
}
</style>
