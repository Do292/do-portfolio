<template>
	<div class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="simulationDef.searchConditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setCondition"
			></FormSearchCondition>
			<div class="pt-2">
				<SimulationChartForm
					:chartCondition="chartCondition"
					:menuId="menuId"
				></SimulationChartForm>
			</div>
			<div class="pt-2">
				<FormTab
					:id="'simulationTab'"
					ref="simulationTab"
					:items="tabItems"
					:selectedIndex="selectedIndex"
					@selectTab="onSelectedTab"
				>
					<template v-slot:tabContent>
						<div v-show="selectedIndex == 0">
							<FormGrid
								:checkbox="false"
								:customApi="COMMON.getByCustomQuery"
								:gridId="simulationGridId"
								:gridTitle="simulationDef.label"
								:initSearch="false"
								:isUseCreate="false"
								:isUseDelete="false"
								:isUseModify="false"
								:isUsePath="false"
								:menuId="menuId"
								:searchCondition="condition1"
							>
							</FormGrid>
						</div>
						<div v-show="selectedIndex == 1">
							<FormGrid
								:checkbox="false"
								:customApi="COMMON.getByCustomQuery"
								:gridId="controlGridId"
								:gridTitle="controlDef.label"
								:initSearch="false"
								:isUseCreate="false"
								:isUseDelete="false"
								:isUseModify="false"
								:isUsePath="false"
								:menuId="menuId"
								:searchCondition="condition2"
							>
							</FormGrid>
						</div>
						<div v-show="selectedIndex == 2">
							<FormGrid
								:checkbox="false"
								:customApi="COMMON.getByCustomQuery"
								:gridId="ignoreGridId"
								:gridTitle="ignoreDef.label"
								:initSearch="false"
								:isUseCreate="false"
								:isUseDelete="false"
								:isUseModify="false"
								:isUsePath="false"
								:menuId="menuId"
								:searchCondition="condition3"
							>
							</FormGrid>
						</div>
						<div v-show="selectedIndex == 3">
							<FormGrid
								:checkbox="false"
								:customApi="COMMON.getByCustomQuery"
								:gridId="ruleOutGridId"
								:gridTitle="ruleOutDef.label"
								:initSearch="false"
								:isUseCreate="false"
								:isUseDelete="false"
								:isUseModify="false"
								:isUsePath="false"
								:menuId="menuId"
								:searchCondition="condition4"
							>
							</FormGrid>
						</div>
					</template>
				</FormTab>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useTableDef } from "~/plugins/composables/tableHandler";

import * as COMMON from "~/api/system-common.js";
import SimulationChartForm from "./SimulationChartForm.vue";

const menuId = "ControlLimitSimulation";
const simulationGridId = "SimulationHistory";
const controlGridId = "ControlData";
const ignoreGridId = "IgnoreData";
const ruleOutGridId = "RuleOutData";

const { fetchGridTableDef: fetchSimulationDef, gridTableDef: simulationDef } =
	useTableDef();
const { fetchGridTableDef: fetchControlDef, gridTableDef: controlDef } =
	useTableDef();
const { fetchGridTableDef: fetchIgnoreDef, gridTableDef: ignoreDef } =
	useTableDef();
const { fetchGridTableDef: fetchRuleOutDef, gridTableDef: ruleOutDef } =
	useTableDef();

onBeforeMount(async () => {
	await fetchSimulationDef(menuId, simulationGridId);
	await fetchControlDef(menuId, controlGridId);
	await fetchIgnoreDef(menuId, ignoreGridId);
	await fetchRuleOutDef(menuId, ruleOutGridId);
});

const tabItems = ref([
	simulationGridId,
	controlGridId,
	ignoreGridId,
	ruleOutGridId,
]);
const selectedIndex = ref(0);
function onSelectedTab({ index }) {
	selectedIndex.value = index;
}

const condition1 = ref({});
const condition2 = ref({});
const condition3 = ref({});
const condition4 = ref({});
const chartCondition = ref({ chartId: 1, controlChartType: "Xbar" });

const setCondition = async condition => {
	condition1.value = {
		queryId: simulationDef.value.queryId,
		queryVersion: simulationDef.value.queryVersion,
		parameters: condition,
	};
	condition2.value = {
		queryId: controlDef.value.queryId,
		queryVersion: controlDef.value.queryVersion,
		parameters: condition,
	};
	condition3.value = {
		queryId: ignoreDef.value.queryId,
		queryVersion: ignoreDef.value.queryVersion,
		parameters: condition,
	};
	condition4.value = {
		queryId: ruleOutDef.value.queryId,
		queryVersion: ruleOutDef.value.queryVersion,
		parameters: condition,
	};
	//chartCondition.value = { chartId: 1, controlChartType: "Xbar" }; //condition;
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: 300px !important;
}
:deep(.card-body) {
	overflow-y: scroll !important;
}
</style>
