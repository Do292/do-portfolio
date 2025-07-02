<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<GridForm
						:condition="selectedSystem"
						menuId="GridTableDef"
						tableId="GridTableDef"
						@create="openModalCreateGrid"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectGrid"
					/>
				</template>
				<template v-slot:right>
					<GridForm
						ref="columnRef"
						:condition="selectedGrid"
						:dragging="true"
						menuId="GridTableDef"
						tableId="GridColumnDef"
						@create="openModalCreateColumn"
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
	TABLE,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "GridTableDefForm",
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
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== System
		const { MENU_ID, GRID_ID, SYSTEM_ID, POSITION } = ID;
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

		//==================== Grid
		const { createItem } = useItem();
		const columnRef = ref(null);
		const selectedGrid = ref({
			[SYSTEM_ID]: "",
			[MENU_ID]: "",
			[GRID_ID]: "",
		});

		/**
		 * type condition을 할당한다.
		 * @param {Object} config
		 * @param {Object|null} config.row
		 */
		function selectGrid(config) {
			selectedGrid.value = createItem(
				[SYSTEM_ID, MENU_ID, GRID_ID],
				key => config.row?.[key],
			);
			setInformation(config);
		}

		/**
		 * readOnly 설정을 포함해 이벤트 전송
		 * @param {Object} config
		 */
		function openModalCreateGrid(config) {
			emit("create", config, { ...selectedSystem.value });
		}

		/**
		 * readOnly 설정을 포함해 이벤트 전송
		 * @param {Object} config
		 */
		function openModalCreateColumn(config) {
			// Grid 미선택시
			if (!selectedGrid.value[GRID_ID]) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.GRID_TABLE_DEF,
				});
				return;
			}

			const { length } = columnRef.value.gridItems;
			const readOnlySetting = {
				...selectedGrid.value,
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

			// Grid Column
			columnRef,
			selectedGrid,
			selectGrid,
			openModalCreateGrid,
			openModalCreateColumn,
		};
	},
};
</script>
<style scoped>
/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 332px) !important;
}
</style>
