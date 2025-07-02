<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<!-- <FormFilter :config="filterConfig"></FormFilter> -->
		<div class="card-body">
			<FormSearchCondition
				:conditionId="gridTableDef.searchConditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setCondition"
			></FormSearchCondition>

			<!-- ( Condition : ChartID=1, FactoryName=A1, Term=Monthly,
			StartTime=201703, EndTime=202405 ) -->
			<FormGrid
				:checkbox="false"
				:customApi="COMMON.getByCustomQuery"
				:gridId="gridId"
				:gridTitle="gridTableDef.label"
				:initSearch="false"
				:isUseCreate="false"
				:isUseDelete="false"
				:isUseModify="false"
				:isUsePath="false"
				:menuId="menuId"
				:searchCondition="searchCondition"
				@onSelectionChanged="setInformation"
			>
			</FormGrid>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import * as COMMON from "~/api/system-common";

const menuId = "Capability";
const gridId = "Capability";

const { isShowInformation, infoConfig, setInformation } = useInformation();
const { fetchGridTableDef, gridTableDef } = useTableDef();

onBeforeMount(async () => {
	await fetchGridTableDef(menuId, gridId);
});

const searchCondition = ref({});
const setCondition = async condition => {
	searchCondition.value = {
		queryId: gridTableDef.value.queryId, // GetCapabilityDataList
		queryVersion: gridTableDef.value.queryVersion, // 00002
		parameters: condition,
	};
};
</script>
<style scoped>
:deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 370px) !important;
}
</style>
