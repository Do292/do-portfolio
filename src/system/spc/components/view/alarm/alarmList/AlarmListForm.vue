<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="conditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setCondition"
			></FormSearchCondition>
			<FormGrid
				:checkbox="false"
				:customApi="COMMON.getByCustomQuery"
				:gridId="gridId"
				:gridTitle="gridTitle"
				:initSearch="false"
				:isUseCreate="false"
				:isUseDelete="false"
				:isUseModify="false"
				:isUsePath="false"
				:menuId="menuId"
				:paging="true"
				:searchCondition="searchCondition"
				@clickHoverCell="clickHoverCell"
				@onSelectionChanged="setInformation"
			>
			</FormGrid>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>
<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import { useTab } from "~/plugins/composables/authority";
import * as COMMON from "~/api/system-common";

const menuId = "AlarmList";
const gridId = "Alarm";

const { isShowInformation, infoConfig, setInformation } = useInformation();
const { fetchGridTableDef, gridTableDef } = useTableDef();
const { addOrSelectTab } = useTab();

onBeforeMount(async () => {
	await fetchGridTableDef(menuId, gridId);
});

const conditionId = computed(() => {
	return gridTableDef.value.searchConditionId;
});

const gridTitle = computed(() => {
	return gridTableDef.value.label;
});

const searchCondition = ref({});
const setCondition = async condiiton => {
	searchCondition.value = {
		queryId: gridTableDef.value.queryId,
		queryVersion: gridTableDef.value.queryVersion,
		parameters: condiiton,
	};
};

function clickHoverCell(e) {
	const state = {
		chartId: e.data.chartId,
		alarmId: e.data.alarmId,
		alarmSeq: e.data.ALARMSEQ,
		chartName: e.data.chartName,
	};
	addOrSelectTab("AlarmDetail", state);
}
</script>
<style scoped></style>
