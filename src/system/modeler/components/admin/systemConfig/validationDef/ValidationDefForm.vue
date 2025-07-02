<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<GridForm
						:condition="selectedSystem"
						:menuId="TABLE.VALIDATION_DEF"
						:tableId="TABLE.VALIDATION_DEF"
						@create="openModalCreateValidation"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectValidation"
					/>
				</template>
				<template v-slot:right>
					<ValidationDetail
						:defaultConfig="selectedValidtion"
						@apply="openModalConfirmAndModify"
					/>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import GridForm from "~/system/modeler/components/common/form/GridForm";
import ValidationDetail from "~/system/modeler/components/admin/systemConfig/validationDef/ValidationDetail";

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useUpdateData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useModalAlert,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

import {
	TABLE,
	ID,
	ACTION,
} from "~/system/modeler/constants/modeler_constants.js";
import { VALIDATION } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "ValidationDefForm",
	components: {
		HeaderSystem,
		GridForm,
		ValidationDetail,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const paneConfigs = [
			{ key: "left", size: 45 },
			{ key: "right", size: 55 },
		];

		//==================== System
		const { SYSTEM_ID } = ID;
		const selectedSystem = ref({});

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		async function selectSystemId(systemId) {
			// 기존 선택된 시스템과 다를 경우만
			if (selectedSystem.value[SYSTEM_ID] !== systemId) {
				selectedSystem.value = { [SYSTEM_ID]: systemId };
			}
		}

		//==================== Validation
		const selectedValidtion = ref({});

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectValidation({ tableId, columns, row = {} }) {
			selectedValidtion.value = row;
			setInformation({ tableId, columns, row });
		}

		/**
		 * SystemId를 readonly 조건으로 설정
		 * @param {Object} config
		 */
		function openModalCreateValidation(config) {
			const readOnlySetting = { ...selectedSystem.value };
			emit("create", config, readOnlySetting);
		}

		// Confirm
		const { modifyList } = useUpdateData();
		const { openModalConfirmBy } = useModalConfirm();
		const { openModalWarning } = useModalAlert();

		function openModalConfirmAndModify(config) {
			if (!selectedValidtion.value[VALIDATION.ID]) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.VALIDATION_DEF,
				});
				return;
			}

			// Confirm 모달 활성화
			openModalConfirmBy(
				ACTION.MODIFY,
				TABLE.VALIDATION_DEF,
				[config],

				// Apply function
				comment => modifyList(TABLE.VALIDATION_DEF, [config], comment),
			);
		}

		return {
			// Config
			TABLE,
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// System
			selectedSystem,
			selectSystemId,

			// Validation
			selectedValidtion,
			selectValidation,
			openModalCreateValidation,
			openModalConfirmAndModify,
		};
	},
};
</script>
<style scoped>
/* Layout */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 340px) !important;
}
:deep(#right-pane) {
	overflow: hidden;
}
</style>
