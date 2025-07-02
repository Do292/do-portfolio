<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<HeaderSystem @select="selectSystemId" />
			<GridForm
				ref="settingRef"
				:condition="selectedSystem"
				:dragging="true"
				:menuId="TABLE.SYSTEM_SETTING"
				:tableId="TABLE.SYSTEM_SETTING"
				@create="openModalCreateSetting"
				@delete="$emit('delete', $event)"
				@modify="$emit('modify', $event)"
				@onSelectionChanged="setInformation"
			/>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";

import {
	TABLE,
	ID,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "SystemSettingDefForm",
	components: {
		HeaderSystem,
		GridForm,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const settingRef = ref(null);

		//==================== System
		const { SYSTEM_ID, POSITION } = ID;
		const selectedSystem = ref({ [SYSTEM_ID]: "" });

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		function selectSystemId(systemId) {
			// 기존 선택된 시스템과 다를 경우만
			if (selectedSystem.value[SYSTEM_ID] !== systemId) {
				selectedSystem.value = { [SYSTEM_ID]: systemId };
			}
		}

		/**
		 * readOnly 설정을 포함해 이벤트 전송
		 * @param {Object} config
		 */
		function openModalCreateSetting(config) {
			const { length } = settingRef.value.gridItems;
			const readOnlySetting = {
				...selectedSystem.value,
				[POSITION]: length + DEFAULT_POSITION,
			};

			emit("create", config, readOnlySetting);
		}

		return {
			// Config
			TABLE,
			settingRef,
			isShowInformation,
			infoConfig,
			setInformation,

			// System
			selectedSystem,
			selectSystemId,
			openModalCreateSetting,
		};
	},
};
</script>
<style scoped>
/* Grid */
:deep(.e-gridcontent) {
	height: calc(100vh - 333px) !important;
}
</style>
