<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<GridForm
						:condition="selectedSystem"
						:useAPI="false"
						menuId="MetaDataDef"
						tableId="MetaData"
						@create="openModalCreateMeta"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectMeta"
					/>
				</template>
				<template v-slot:right>
					<GridForm
						ref="detailRef"
						:condition="selectedMeta"
						:dragging="true"
						:useAPI="false"
						menuId="MetaDataDef"
						tableId="MetaDataDetail"
						@create="openModalCreateDetail"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="setInformation"
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

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	ID,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "MetaDataDefForm",
	components: {
		HeaderSystem,
		GridForm,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { openModalWarning } = useModalAlert();
		const paneConfigs = [
			{ key: "left", size: 40, min: "500px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== System
		const { META_ID, SYSTEM_ID, POSITION } = ID;
		const selectedSystem = ref({ [SYSTEM_ID]: "" });

		/**
		 * 시스템 Id 선택으로 그리드 바인딩
		 */
		function selectSystemId(systemId) {
			// 기존 선택된 시스템과 다를 경우만
			if (selectedSystem.value[SYSTEM_ID] !== systemId) {
				selectedSystem.value = { [SYSTEM_ID]: systemId };
			}
		}

		//==================== Detail
		const { createItem } = useItem();
		const detailRef = ref(null);
		const selectedMeta = ref({ [SYSTEM_ID]: "", [META_ID]: "" });

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectMeta({ tableId, columns, row = {} }) {
			selectedMeta.value = createItem(
				[SYSTEM_ID, META_ID],
				key => row[key],
			);

			setInformation({ tableId, columns, row });
		}

		/**
		 * readOnly 설정을 포함해 이벤트 전송
		 * @param {Object} config
		 */
		function openModalCreateMeta(config) {
			emit("create", config, { ...selectedSystem.value });
		}

		/**
		 * readOnly 설정을 포함해 이벤트 전송
		 * @param {Object} config
		 */
		function openModalCreateDetail(config) {
			// Table 미선택시
			if (!selectedMeta.value[ID.META_ID]) {
				openModalWarning("warning.selectRowData", {
					param: "MetaData",
				});
				return;
			}

			const { length } = detailRef.value.gridItems;
			const readOnlySetting = {
				...selectedMeta.value,
				[POSITION]: length + DEFAULT_POSITION,
			};

			emit("create", config, readOnlySetting);
		}

		return {
			// Config
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// System
			selectedSystem,
			selectSystemId,

			// Detail
			detailRef,
			selectedMeta,
			selectMeta,
			openModalCreateMeta,
			openModalCreateDetail,
		};
	},
};
</script>
<style scoped>
/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 340px) !important;
}
</style>
