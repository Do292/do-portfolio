<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<!-- ( Condition : FactoryName:P1, MachineName:P1ANT0100, DCType:Production,
		StartDate:20240603063000000000, EndDate:20240604103000000000, Start
		Partition Key: 20240603, End Partition Key: 20240604, ItemName:PPA_y) -->
		<FormTab
			:id="'edcData'"
			ref="edcData"
			:items="tabItems"
			:selectedIndex="selectedIndex"
			@selectTab="onSelectedTab"
		>
			<template v-slot:searchCondition>
				<FormSearchCondition
					:conditionId="rawGridTableDef.searchConditionId"
					:isUseCustomQuery="true"
					:menuId="menuId"
					@searchByCondition="setCondition"
				></FormSearchCondition>
			</template>
			<template v-slot:tabContent>
				<div v-show="selectedIndex == 0">
					<FormGrid
						:checkbox="false"
						:customApi="COMMON.getByCustomQuery"
						:gridId="rawGridId"
						:gridTitle="rawGridTableDef.label"
						:initSearch="false"
						:isUseCreate="false"
						:isUseDelete="false"
						:isUseModify="false"
						:isUsePath="false"
						:menuId="menuId"
						:searchCondition="rawCondition"
						@onSelectionChanged="setInformation"
					>
					</FormGrid>
				</div>
				<div v-show="selectedIndex == 1">
					<FormGrid
						:checkbox="false"
						:customApi="COMMON.getByCustomQuery"
						:gridId="pivotGridId"
						:gridTitle="pivotGridTableDef.label"
						:initSearch="false"
						:isUseCreate="false"
						:isUseDelete="false"
						:isUseModify="false"
						:isUsePath="false"
						:menuId="menuId"
						:searchCondition="pivotCondition"
						@onSelectionChanged="setInformation"
					>
					</FormGrid>
				</div>
			</template>
		</FormTab>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import * as COMMON from "~/api/system-common";

const menuId = "EDCData";
const rawGridId = "EDCDataRaw";
const pivotGridId = "EDCDataPivot";

const { isShowInformation, infoConfig, setInformation } = useInformation();
const {
	fetchGridTableDef: fetchRawGridTableDef,
	gridTableDef: rawGridTableDef,
} = useTableDef();
const {
	fetchGridTableDef: fetchPivotGridTableDef,
	gridTableDef: pivotGridTableDef,
} = useTableDef();

onBeforeMount(async () => {
	await fetchRawGridTableDef(menuId, rawGridId);
	await fetchPivotGridTableDef(menuId, pivotGridId);
});

const tabItems = ref(["Raw View", "Pivot View"]);
const selectedIndex = ref(0);

function onSelectedTab({ index }) {
	selectedIndex.value = index;
}

const rawCondition = ref({});
const pivotCondition = ref({});
const setCondition = async condiiton => {
	rawCondition.value = {
		queryId: rawGridTableDef.value.queryId,
		queryVersion: rawGridTableDef.value.queryVersion,
		parameters: condiiton,
	};
	pivotCondition.value = {
		queryId: pivotGridTableDef.value.queryId,
		queryVersion: pivotGridTableDef.value.queryVersion,
		parameters: condiiton,
	};
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(80vh - 130px) !important;
}
</style>
