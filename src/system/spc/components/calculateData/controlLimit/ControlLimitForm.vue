<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<FormSearchCondition
			:conditionId="gridTableDef.searchConditionId"
			:isUseCustomQuery="true"
			:menuId="menuId"
			@searchByCondition="setCondition"
		></FormSearchCondition>
		<div class="card-body">
			<FormGrid
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

const menuId = "ControlLimit";
const gridId = "ControlLimit";

const { isShowInformation, infoConfig, setInformation } = useInformation();
const { fetchGridTableDef, gridTableDef } = useTableDef();

onBeforeMount(async () => {
	await fetchGridTableDef(menuId, gridId);
});

const searchCondition = ref({});
const setCondition = async condition => {
	searchCondition.value = {
		queryId: gridTableDef.value.queryId, // GetControlLimitDataList
		queryVersion: gridTableDef.value.queryVersion, // 00005
		parameters: condition,
	};
};
</script>
<style scoped></style>
