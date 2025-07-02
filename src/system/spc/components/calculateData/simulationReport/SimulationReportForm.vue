<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="leftGridTableDef.searchConditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setCondition"
			></FormSearchCondition>
			<!-- ( Condition : FactoryName=A1, ChartId=1, StartDate=202210241057,
			EndDate=2024060216532 ) -->
			<Splitter
				:paneConfigs="[
					{ key: 'left', size: 30 },
					{ key: 'right', size: 70 },
				]"
			>
				<template v-slot:left>
					<FormGrid
						:checkbox="false"
						:customApi="COMMON.getByCustomQuery"
						:gridId="leftGridId"
						:gridTitle="leftGridTableDef.label"
						:initSearch="false"
						:isUseCreate="false"
						:isUseDelete="false"
						:isUseModify="false"
						:isUsePath="false"
						:menuId="menuId"
						:paging="false"
						:searchCondition="leftGridCondition"
						@onSelectionChanged="selectGrid"
					></FormGrid>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="simulationGridRef"
						:customApi="getSimulationData"
						:gridId="rightGridId"
						:gridTitle="rightGridTableDef.label"
						:initSearch="false"
						:menuId="menuId"
						:paging="false"
						:searchCondition="rightGridCondition"
						@onSelectionChanged="setInformation"
					>
						<template v-slot:grid-path>
							<Breadcrumb
								:isSelectable="false"
								:items="[selectedChartDefName]"
						/></template>
						<template #grid-button
							><div class="btn-group">
								<ButtonText
									:id="'reportBtn'"
									:type="ACTION.REPORT"
									@click="openModalReport"
								></ButtonText></div></template
					></FormGrid>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from "vue";
import * as COMMON from "~/api/system-common.js";
import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import { ACTION } from "~/plugins/wfb-constants.js";

const emit = defineEmits(["report"]);

const menuId = "SimulationReport";
const leftGridId = "Chart";
const rightGridId = "SimulationReport";

const { isShowInformation, infoConfig, setInformation } = useInformation();
const { openModalWarning } = useModalAlert();
const {
	fetchGridTableDef: fetchLeftGridTableDef,
	gridTableDef: leftGridTableDef,
} = useTableDef();

const {
	fetchGridTableDef: fetchRightGridTableDef,
	gridTableDef: rightGridTableDef,
} = useTableDef();

onBeforeMount(async () => {
	await fetchLeftGridTableDef(menuId, leftGridId);
	await fetchRightGridTableDef(menuId, rightGridId);
});

const leftGridCondition = ref({});

const simulationGridRef = ref(null);
const selectedChartRow = ref({});

const selectedChartDefName = computed(
	() => selectedChartRow.value.chartDefName,
);

const setCondition = async condition => {
	leftGridCondition.value = {
		queryId: leftGridTableDef.value.queryId, // GetChartIDList
		queryVersion: leftGridTableDef.value.queryVersion, // 00011
		parameters: condition,
	};
};

const rightGridCondition = computed(() => ({
	queryId: rightGridTableDef.value.queryId, // GetSimulationReportList
	queryVersion: rightGridTableDef.value.queryVersion, // 00001
	parameters: {
		chartId: selectedChartRow.value.chartId,
		dateFrom: leftGridCondition.value.parameters?.dateFrom,
		dateTo: leftGridCondition.value.parameters?.dateTo,
	},
	isCall: selectedChartRow.value.chartId,
}));

function selectGrid({ gridId, columns, row = {} }) {
	if (row.chartId) {
		selectedChartRow.value = row;
	} else {
		simulationGridRef.value.gridItems = [];
	}
	setInformation({ gridId, columns, row });
}

const getSimulationData = () =>
	COMMON.getByCustomQuery({
		searchCondition: rightGridCondition.value,
	});

function openModalReport() {
	const checkItems =
		simulationGridRef.value.$refs.templateRef.getCheckItems();
	if (checkItems.length == 0) {
		openModalWarning("warning.selectData");
		return;
	} else if (checkItems.length > 1) {
		openModalWarning("warning.selectOneData");
		return;
	} else {
		emit("report", checkItems[0]);
	}
}
</script>
<style scoped></style>
