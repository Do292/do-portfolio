<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<FormGrid
						ref="gridRef"
						:createApi="GRID.createGridTableDef"
						:customApi="GRID.getAllGridTableDef"
						:deleteApi="GRID.deleteGridTableDef"
						:modifyApi="GRID.modifyGridTableDef"
						gridId="GridTableDef"
						menuId="GridTableDef"
						metaDataId="GridTableDef"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectGrid"
					>
					</FormGrid>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="columnRef"
						:condition="columnConfig"
						:createApi="GRID.createGridColumnDef"
						:customApi="getGridColumnDefBy"
						:deleteApi="GRID.deleteGridColumnDef"
						:dragging="true"
						:modifyApi="GRID.modifyGridColumnDef"
						gridId="GridColumnDef"
						menuId="GridTableDef"
						metaDataId="GridColumnDef"
						@create="openModalCreateColumn"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="setInformation"
					></FormGrid>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useItem } from "~/plugins/composables/dataHandler";
import { CAMEL_ID } from "~/constants/common_constants.js";
import * as GRID from "~/api/system-common.js";

const emit = defineEmits(["create", "modify"]);
const { isShowInformation, infoConfig, setInformation } = useInformation();
const paneConfigs = [
	{ key: "left", size: 40, min: "600px" },
	{ key: "right", size: 60, min: "600px" },
];
//==================== Grid
const { MENU_ID, TABLE_ID, GRID_ID, SEQUENCE } = CAMEL_ID;
const { createItem } = useItem();
const gridRef = ref(null);
const columnRef = ref(null);
const selectedGrid = ref({
	[MENU_ID]: "",
	[TABLE_ID]: "",
	[GRID_ID]: "",
});
const columnConfig = computed(() => ({
	[MENU_ID]: selectedGrid.value[MENU_ID],
	[GRID_ID]: selectedGrid.value[GRID_ID],
}));

const getGridColumnDefBy = () =>
	GRID.getGridColumnDef(
		columnConfig.value[MENU_ID],
		columnConfig.value[GRID_ID],
	);

/**
 * type condition을 할당한다.
 * @param {Object} config
 * @param {Object|null} config.row
 */
function selectGrid({ gridId, columns, row = {} }) {
	selectedGrid.value = createItem(
		[MENU_ID, TABLE_ID, GRID_ID],
		key => row?.[key],
	);

	setInformation({ gridId, columns, row });
}

/**
 * readOnly 설정을 포함해 이벤트 전송
 * @param {Object} config
 */
function openModalCreateColumn(config) {
	const { length } = columnRef.value.gridItems;
	const readOnlySetting = {
		...selectedGrid.value,
		[SEQUENCE]: length,
	};

	emit("create", config, readOnlySetting);
}
</script>
<style></style>
