<template>
	<div class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="conditionDef.searchConditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setSearchCondition"
			></FormSearchCondition>
			<div class="row">
				<div class="col-2">
					<div class="tree-header">
						<div class="row">
							<div class="tree-input">
								<Combobox
									:floatLabelType="'Never'"
									:itemsSource="treeComboItems"
									:modelValue="treeComboValue"
									@update:modelValue="searchNode"
								></Combobox>
							</div>
							<div class="tree-btn-box">
								<ButtonBasic
									type="collapse"
									@onClick="toggleTree"
								/>
								<ButtonBasic type="refresh" @onClick="init" />
							</div>
						</div>
					</div>

					<div class="tree-body">
						<wfl-treeview
							ref="treeRef"
							:animation="{
								expand: {
									effect: 'SlideDown',
									duration: 300,
									easing: 'linear',
								},
								collapse: {
									effect: 'SlideUp',
									duration: 300,
									easing: 'linear',
								},
							}"
							:checkbox="true"
							:dataSource="treeItems"
							:fields="treeField"
							:selectedNodes="selectedNodes"
							nodeTemplate="nodeTemplate"
							@nodeSelected="selectNode"
						>
							<template v-slot:nodeTemplate="{ data }">
								<slot name="tree-node" v-bind="data">
									<div class="tree-node">
										<span class="tree-node-id">{{
											data["text"]
										}}</span>
										<span
											v-if="data['child']?.length"
											class="e-badge e-badge-primary"
										>
											{{ data["child"].length }}
										</span>
									</div>
								</slot>
							</template>
						</wfl-treeview>
					</div>
				</div>
				<div class="col-10">
					<div v-if="!isShowChartDetail">
						<div>
							<div class="row">
								<div class="col-7 item-title">
									<label>Chart Group Def</label>
								</div>
								<div class="col-5 text-right mt-2">
									<div class="item-box">
										<ButtonBasic
											:needsAuthority="false"
											:type="ACTION.CREATE"
											class="text-green"
											@onClick="openModalCreate"
										/>
										<ButtonBasic
											:needsAuthority="false"
											:type="ACTION.MODIFY"
											@onClick="openModalModify"
										/>
										<ButtonBasic
											:needsAuthority="false"
											:type="ACTION.DELETE"
											class="text-red"
											@onClick="openModalDelete"
										/>
									</div>
								</div>
							</div>
							<div class="d-table-row">
								<div class="d-table-cell">Group Id :</div>
								<div class="d-table-cell input">
									{{
										selectedGroupNode.chartConditionGroupId
									}}
								</div>
								<div class="d-table-cell">Group Name :</div>
								<div class="d-table-cell input">
									{{
										selectedGroupNode.chartConditionGroupName
									}}
								</div>
								<div class="d-table-cell">Description :</div>
								<div class="d-table-cell input">
									{{ selectedGroupNode.description }}
								</div>
							</div>
						</div>
						<FormGrid
							ref="conditionRef"
							:condition="selectedGroup"
							:createApi="CHART.createChartGroupCondition"
							:customApi="CHART.getChartGroupCondition"
							:deleteApi="CHART.deleteChartGroupCondition"
							:gridId="conditionGridId"
							:gridTitle="conditionDef.label"
							:initSearch="false"
							:menuId="menuId"
							:metaDataId="'ChartCondition'"
							:modifyApi="CHART.moodifyChartGroupCondition"
							@create="setConditionAttribute"
							@delete="$emit('delete', $event)"
							@modify="$emit('modify', $event)"
							><template v-slot:grid-path>
								<Breadcrumb
									:isSelectable="false"
									:items="[
										selectedGroupNode.chartConditionGroupName,
									]"
								/>
							</template>
						</FormGrid>
						<FormGrid
							ref="chartRef"
							:checkbox="false"
							:condition="selectedGroup"
							:createApi="CHART.createChart"
							:customApi="CHART.getChartByGroupId"
							:deleteApi="CHART.deleteChart"
							:gridId="chartGridId"
							:gridTitle="chartDef.label"
							:initSearch="false"
							:menuId="menuId"
							:metaDataId="'Chart'"
							:modifyApi="CHART.modifyChart"
							@create="setChartCreateAttribute"
							@delete="$emit('delete', $event)"
							@modify="setChartModifyAttribute"
						>
							<template v-slot:grid-path>
								<Breadcrumb
									:isSelectable="false"
									:items="[
										selectedGroupNode.chartConditionGroupName,
									]"
								/>
							</template>
						</FormGrid>
					</div>
					<div v-else>
						<ChartDetailForm
							:menuId="menuId"
							:selectedChart="selectedChart"
						>
						</ChartDetailForm>
					</div>
				</div>
			</div>
			<!-- <Splitter
				:paneConfigs="[
					{ key: 'ChartStatusLeft', size: 20 },
					{ key: 'ChartStatusRight', size: 80 },
				]"
			>
				<template v-slot:ChartStatusLeft>
					<div class="tree-header">
						<div class="row">
							<div class="tree-input">
								<Combobox
									:floatLabelType="'Never'"
									:itemsSource="treeComboItems"
									:modelValue="treeComboValue"
									@update:modelValue="searchNode"
								></Combobox>
							</div>
							<div class="tree-btn-box">
								<ButtonBasic
									type="collapse"
									@onClick="toggleTree"
								/>
								<ButtonBasic type="refresh" @onClick="init" />
							</div>
						</div>
					</div>

					<div class="tree-body">
						<wfl-treeview
							ref="treeRef"
							:animation="{
								expand: {
									effect: 'SlideDown',
									duration: 300,
									easing: 'linear',
								},
								collapse: {
									effect: 'SlideUp',
									duration: 300,
									easing: 'linear',
								},
							}"
							:checkbox="true"
							:dataSource="treeItems"
							:fields="treeField"
							:selectedNodes="selectedNodes"
							nodeTemplate="nodeTemplate"
							@nodeSelected="selectNode"
						>
							<template v-slot:nodeTemplate="{ data }">
								<slot name="tree-node" v-bind="data">
									<div class="tree-node">
										<span class="tree-node-id">{{
											data["text"]
										}}</span>
										<span
											v-if="data['child']?.length"
											class="e-badge e-badge-primary"
										>
											{{ data["child"].length }}
										</span>
									</div>
								</slot>
							</template>
						</wfl-treeview>
					</div>
				</template>
				<template v-slot:ChartStatusRight>
					<div v-if="!isShowChartDetail">
						<div>
							<div class="row">
								<div class="col-7 item-title">
									<label>Chart Group Def</label>
								</div>
								<div class="col-5 text-right mt-2">
									<div class="item-box">
										<ButtonBasic
											:needsAuthority="false"
											:type="ACTION.CREATE"
											class="text-green"
											@onClick="openModalCreate"
										/>
										<ButtonBasic
											:needsAuthority="false"
											:type="ACTION.MODIFY"
											@onClick="openModalModify"
										/>
										<ButtonBasic
											:needsAuthority="false"
											:type="ACTION.DELETE"
											class="text-red"
											@onClick="openModalDelete"
										/>
									</div>
								</div>
							</div>
							<div class="d-table-row">
								<div class="d-table-cell">Group Id :</div>
								<div class="d-table-cell input">
									{{
										selectedGroupNode.chartConditionGroupId
									}}
								</div>
								<div class="d-table-cell">Group Name :</div>
								<div class="d-table-cell input">
									{{
										selectedGroupNode.chartConditionGroupName
									}}
								</div>
								<div class="d-table-cell">Description :</div>
								<div class="d-table-cell input">
									{{ selectedGroupNode.description }}
								</div>
							</div>
						</div>
						<FormGrid
							ref="conditionRef"
							:condition="selectedGroup"
							:createApi="CHART.createChartGroupCondition"
							:customApi="CHART.getChartGroupCondition"
							:deleteApi="CHART.deleteChartGroupCondition"
							:gridId="conditionGridId"
							:gridTitle="conditionDef.label"
							:initSearch="false"
							:menuId="menuId"
							:metaDataId="'ChartCondition'"
							:modifyApi="CHART.moodifyChartGroupCondition"
							@create="setConditionAttribute"
							@delete="$emit('delete', $event)"
							@modify="$emit('modify', $event)"
							><template v-slot:grid-path>
								<Breadcrumb
									:isSelectable="false"
									:items="[
										selectedGroupNode.chartConditionGroupName,
									]"
								/>
							</template>
						</FormGrid>
						<FormGrid
							ref="chartRef"
							:checkbox="false"
							:condition="selectedGroup"
							:createApi="CHART.createChart"
							:customApi="CHART.getChartByGroupId"
							:deleteApi="CHART.deleteChart"
							:gridId="chartGridId"
							:gridTitle="chartDef.label"
							:initSearch="false"
							:menuId="menuId"
							:metaDataId="'Chart'"
							:modifyApi="CHART.modifyChart"
							@create="setChartCreateAttribute"
							@delete="$emit('delete', $event)"
							@modify="setChartModifyAttribute"
						>
							<template v-slot:grid-path>
								<Breadcrumb
									:isSelectable="false"
									:items="[
										selectedGroupNode.chartConditionGroupName,
									]"
								/>
							</template>
						</FormGrid>
					</div>
					<div v-else>
						<ChartDetailForm
							:menuId="menuId"
							:selectedChart="selectedChart"
						>
						</ChartDetailForm>
					</div>
				</template>
			</Splitter> -->
		</div>
	</div>
</template>

<script setup>
import { useModalAlert } from "~/plugins/composables/modalHandler";
import { useTableDef, useColumnDef } from "~/plugins/composables/tableHandler";
import { useUpdateData } from "~/plugins/composables/dataHandler";
import { useSpinner } from "~/plugins/composables/uiControl";
import { ref, computed, onMounted, watch } from "vue";
import * as CHART from "#/spc/api/chart.js";
import ChartDetailForm from "./ChartDetailForm.vue";
import { ACTION } from "~/plugins/wfb-constants.js";

const emit = defineEmits(["create", "modify", "modifySpec", "delete"]);

const menuId = "ChartStatus";
const groupMetaDataId = "ChartConditionGroup";
const conditionGridId = "ChartCondition";
const chartGridId = "ChartId";

const { openModalWarning } = useModalAlert();
const { executeWithSpinner } = useSpinner();
const { mergeMetaConfig } = useColumnDef();
const { fetchGridTableDef: fetchConditionDef, gridTableDef: conditionDef } =
	useTableDef();
const { fetchGridTableDef: fetchChartDef, gridTableDef: chartDef } =
	useTableDef();
const { updateState } = useUpdateData();

onMounted(async () => {
	await fetchTreeItems();
	await fetchConditionDef(menuId, conditionGridId);
	await fetchChartDef(menuId, chartGridId);
});

const treeRef = ref(null);
const treeComboValue = ref(null);
const selectedNodes = ref([]);
const selectedGroupNode = ref({});
const selectedGroup = ref({});
const conditionRef = ref(null);
const chartRef = ref(null);
const selectedChart = ref({});
const isShowChartDetail = computed(() =>
	selectedChart?.value.chartId ? true : false,
);

const treeComboItems = ref([]);
const treeItems = ref([]);
const treeField = ref({
	id: "id",
	text: "text",
	child: "child",
	parentId: "parentId",
});

watch(
	() => updateState.metaDataId,
	newValue => {
		if (newValue === groupMetaDataId) {
			init();
			if (updateState.action !== ACTION.DELETE) {
				const key = updateState.items[0].chartConditionGroupId + "";
				setTimeout(() => searchNode(key), 500);
			}
		} else if (newValue === "Chart") {
			let key = selectedGroup.value.chartConditionGroupId + "";
			if (updateState.action !== ACTION.MODIFY) {
				init();
				setTimeout(() => searchNode(key), 500);
			}
		} else if (newValue === "ChartSpec") {
			let key =
				selectedGroup.value.chartConditionGroupId +
				"_" +
				selectedChart.value.chartId;
			init();
			setTimeout(() => searchNode(key), 500);
		}
	},
);

async function fetchTreeItems() {
	const factoryName = "L1";
	await executeWithSpinner(async () => {
		const { data } = await CHART.getChartTree({ params: { factoryName } });
		formatTreeItem(data.data);
	});
}

function init() {
	treeItems.value = [];
	treeComboItems.value = [];
	treeComboValue.value = "";
	selectedGroupNode.value = {};
	selectedChart.value = {};
	selectedGroup.value = {
		chartConditionGroupId: "",
		factoryName: "",
	};
	fetchTreeItems();
}

const setSearchCondition = async condition => {
	console.log(condition);
	// leftGridCondition.value = {
	// 	queryId: leftGridTableDef.value.queryId, // GetChartIDList
	// 	queryVersion: leftGridTableDef.value.queryVersion, // 00011
	// 	parameters: condition,
	// };
};

function formatTreeItem(items) {
	const treeNodes = [];
	const comboItems = [];
	for (const item of items) {
		let groupObj = {};
		groupObj["id"] = item.chartConditionGroupId;
		groupObj["text"] = item.chartConditionGroupName;
		groupObj["parentId"] = null;
		groupObj["data"] = item;
		comboItems.push({
			parentID: null,
			id: groupObj.id,
			item: groupObj.data,
			value: groupObj.id + "",
			text: groupObj.text,
		});
		if (item.chartDefs.length > 0) {
			const chartNodes = [];
			for (const chartItem of item.chartDefs) {
				chartItem["chartConditionGroupName"] =
					item.chartConditionGroupName;
				let chartObj = {};
				chartObj["id"] =
					chartItem.chartConditionGroupId + "_" + chartItem.chartId;
				chartObj["text"] = chartItem.chartDefName;
				chartObj["parentId"] = chartItem.chartConditionGroupId;
				chartObj["child"] = [];
				chartObj["data"] = chartItem;
				chartNodes.push(chartObj);

				comboItems.push({
					parentID: groupObj.id,
					id: chartObj.id,
					item: chartObj.data,
					value: chartObj.id,
					text: groupObj.text + " > " + chartObj.text,
				});
			}
			groupObj["child"] = chartNodes;
		}
		treeNodes.push(groupObj);
	}
	treeItems.value = treeNodes;
	treeComboItems.value = comboItems;
}

function searchNode(key) {
	const nodeData = treeComboItems.value.find(({ value }) => value === key);

	if (nodeData) {
		treeRef.value.expandAll();
		treeComboValue.value = key;
		selectedNodes.value = [nodeData.id];
		selectNode({ nodeData });
	}
}

function selectNode({ nodeData }) {
	if (nodeData.parentID) {
		const parentItem = treeItems.value.find(
			({ id }) => id == nodeData.parentID,
		);
		let item = parentItem.child.find(({ id }) => id == nodeData.id);
		selectedChart.value = item.data;
		selectedGroupNode.value = item.data;
		selectedGroup.value = {
			chartConditionGroupId: parentItem.data.chartConditionGroupId,
			factoryName: parentItem.data.factoryName,
		};
	} else {
		selectedGroup.value = {};
		selectedChart.value = {};
		let item = treeItems.value.find(({ id }) => id == nodeData.id);
		selectedGroupNode.value = item.data;
		selectedGroup.value = {
			chartConditionGroupId: item.data.chartConditionGroupId,
			factoryName: item.data.factoryName,
		};
	}
}
/**
 * 트리 expandAll/collapseAll 전환
 */
function toggleTree() {
	treeRef.value.onTreeAllOpenClose();
}

function openModalCreate() {
	emit(
		"create",
		mergeMetaConfig({
			metaDataId: groupMetaDataId,
			api: CHART.createChartGroup,
			items: selectedGroupNode.value ? [selectedGroupNode.value] : [],
		}),
	);
}
function openModalModify() {
	if (validateChartGroup()) {
		emit(
			"modify",
			mergeMetaConfig({
				metaDataId: groupMetaDataId,
				api: CHART.moodifyChartGroup,
				items: [
					{
						chartConditionGroupId:
							selectedGroupNode.value.chartConditionGroupId,
						chartConditionGroupName:
							selectedGroupNode.value.chartConditionGroupName,
						description: selectedGroupNode.value.description,
						materialType: selectedGroupNode.value.materialType,
						factoryName: selectedGroupNode.value.factoryName,
					},
				],
			}),
		);
	}
}
function openModalDelete() {
	if (validateChartGroup()) {
		const data = chartRef.value.gridItems;
		if (data.length == 0) {
			emit(
				"delete",
				mergeMetaConfig({
					metaDataId: groupMetaDataId,
					api: CHART.deleteChartGroup,
					items: [
						{
							chartConditionGroupId:
								selectedGroupNode.value.chartConditionGroupId,
							factoryName: selectedGroupNode.value.factoryName,
						},
					],
				}),
			);
		} else {
			openModalWarning("Chart 먼저 삭제해주세요");
			return false;
		}
	}
}

function setConditionAttribute(config = conditionDef) {
	config = Object.assign(config, {
		compareKeyValueFlag: "true",
		excludeKeyList: ["chartConditionSeq"],
	});

	if (validateChartGroup()) {
		const data = {
			chartConditionSeq: conditionRef.value.gridItems.length + 1,
			sequence: conditionRef.value.gridItems.length + 1,
		};
		emitEvent("create", config, data);
	}
}

function setChartCreateAttribute(config = chartDef) {
	if (validateChartGroup() && validateChartCondition()) {
		emitEvent("create", config, selectedGroup.value);
	}
}

function setChartModifyAttribute(config = chartDef) {
	if (validateChartGroup()) {
		emitEvent("modify", config);
	}
}

function validateChartGroup() {
	if (!selectedGroupNode.value.chartConditionGroupId) {
		openModalWarning("warning.selectRowData", {
			param: "Chart Condition Group",
		});
		return false;
	}
	return true;
}

function validateChartCondition() {
	const data = conditionRef.value.gridItems.filter(f => f.machineName);
	if (data.length == 0) {
		openModalWarning("Chart Condition에서 확인 필요(MachineName)");
		return false;
	}
	return true;
}

function emitEvent(eventName, config, data = {}) {
	selectedGroupNode.value = Object.assign(selectedGroupNode.value, data);
	const readOnlySetting = {
		...selectedGroupNode.value,
	};
	emit(eventName, config, readOnlySetting);
}
</script>
<!-- <script>
import { useModalAlert } from "~/plugins/composables/modalHandler";
import { useTableDef, useColumnDef } from "~/plugins/composables/tableHandler";
import { useUpdateData } from "~/plugins/composables/dataHandler";
import { useSpinner } from "~/plugins/composables/uiControl";
import { ref, computed, onMounted, watch } from "vue";
import * as CHART from "#/spc/api/chart.js";
import ChartDetailForm from "./ChartDetailForm.vue";
import { ACTION } from "~/plugins/wfb-constants.js";

export default {
	name: "ChartStatusForm",
	components: { ChartDetailForm },
	emits: ["create", "modify", "modifySpec", "delete"],
	setup({ emit }) {
		const menuId = "ChartStatus";
		const groupMetaDataId = "ChartConditionGroup";
		const conditionGridId = "ChartCondition";
		const chartGridId = "ChartId";

		const { openModalWarning } = useModalAlert();
		const { executeWithSpinner } = useSpinner();
		const { mergeMetaConfig } = useColumnDef();
		const {
			fetchGridTableDef: fetchConditionDef,
			gridTableDef: conditionDef,
		} = useTableDef();
		const { fetchGridTableDef: fetchChartDef, gridTableDef: chartDef } =
			useTableDef();
		const { updateState } = useUpdateData();

		onMounted(async () => {
			await fetchTreeItems();
			await fetchConditionDef(menuId, conditionGridId);
			await fetchChartDef(menuId, chartGridId);
		});

		const treeRef = ref(null);
		const treeComboValue = ref(null);
		const selectedNodes = ref([]);
		const selectedGroupNode = ref({});
		const selectedGroup = ref({});
		const conditionRef = ref(null);
		const chartRef = ref(null);
		const selectedChart = ref({});
		const isShowChartDetail = computed(() =>
			selectedChart?.value.chartId ? true : false,
		);

		const treeComboItems = ref([]);
		const treeItems = ref([]);
		const treeField = ref({
			id: "id",
			text: "text",
			child: "child",
			parentId: "parentId",
		});

		watch(
			() => updateState.metaDataId,
			newValue => {
				if (newValue === groupMetaDataId) {
					init();
					if (updateState.action !== ACTION.DELETE) {
						const key =
							updateState.items[0].chartConditionGroupId + "";
						setTimeout(() => searchNode(key), 500);
					}
				} else if (newValue === "Chart") {
					let key = selectedGroup.value.chartConditionGroupId + "";
					if (updateState.action !== ACTION.MODIFY) {
						init();
						setTimeout(() => searchNode(key), 500);
					}
				} else if (newValue === "ChartSpec") {
					let key =
						selectedGroup.value.chartConditionGroupId +
						"_" +
						selectedChart.value.chartId;
					init();
					setTimeout(() => searchNode(key), 500);
				}
			},
		);

		async function fetchTreeItems() {
			const factoryName = "L1";
			await executeWithSpinner(async () => {
				const { data } = await CHART.getChartTree({
					params: { factoryName },
				});
				formatTreeItem(data.data);
			});
		}

		function init() {
			treeItems.value = [];
			treeComboItems.value = [];
			treeComboValue.value = "";
			selectedGroupNode.value = {};
			selectedChart.value = {};
			selectedGroup.value = {
				chartConditionGroupId: "",
				factoryName: "",
			};
			fetchTreeItems();
		}

		const setSearchCondition = async condition => {
			console.log(condition);
			// leftGridCondition.value = {
			// 	queryId: leftGridTableDef.value.queryId, // GetChartIDList
			// 	queryVersion: leftGridTableDef.value.queryVersion, // 00011
			// 	parameters: condition,
			// };
		};

		function formatTreeItem(items) {
			const treeNodes = [];
			const comboItems = [];
			for (const item of items) {
				let groupObj = {};
				groupObj["id"] = item.chartConditionGroupId;
				groupObj["text"] = item.chartConditionGroupName;
				groupObj["parentId"] = null;
				groupObj["data"] = item;
				comboItems.push({
					parentID: null,
					id: groupObj.id,
					item: groupObj.data,
					value: groupObj.id + "",
					text: groupObj.text,
				});
				if (item.chartDefs.length > 0) {
					const chartNodes = [];
					for (const chartItem of item.chartDefs) {
						chartItem["chartConditionGroupName"] =
							item.chartConditionGroupName;
						let chartObj = {};
						chartObj["id"] =
							chartItem.chartConditionGroupId +
							"_" +
							chartItem.chartId;
						chartObj["text"] = chartItem.chartDefName;
						chartObj["parentId"] = chartItem.chartConditionGroupId;
						chartObj["child"] = [];
						chartObj["data"] = chartItem;
						chartNodes.push(chartObj);

						comboItems.push({
							parentID: groupObj.id,
							id: chartObj.id,
							item: chartObj.data,
							value: chartObj.id,
							text: groupObj.text + " > " + chartObj.text,
						});
					}
					groupObj["child"] = chartNodes;
				}
				treeNodes.push(groupObj);
			}
			treeItems.value = treeNodes;
			treeComboItems.value = comboItems;
		}

		function searchNode(key) {
			const nodeData = treeComboItems.value.find(
				({ value }) => value === key,
			);

			if (nodeData) {
				treeRef.value.expandAll();
				treeComboValue.value = key;
				selectedNodes.value = [nodeData.id];
				selectNode({ nodeData });
			}
		}

		function selectNode({ nodeData }) {
			if (nodeData.parentID) {
				const parentItem = treeItems.value.find(
					({ id }) => id == nodeData.parentID,
				);
				let item = parentItem.child.find(({ id }) => id == nodeData.id);
				selectedChart.value = item.data;
				selectedGroupNode.value = item.data;
				selectedGroup.value = {
					chartConditionGroupId:
						parentItem.data.chartConditionGroupId,
					factoryName: parentItem.data.factoryName,
				};
			} else {
				selectedGroup.value = {};
				selectedChart.value = {};
				let item = treeItems.value.find(({ id }) => id == nodeData.id);
				selectedGroupNode.value = item.data;
				selectedGroup.value = {
					chartConditionGroupId: item.data.chartConditionGroupId,
					factoryName: item.data.factoryName,
				};
			}
		}
		/**
		 * 트리 expandAll/collapseAll 전환
		 */
		function toggleTree() {
			treeRef.value.onTreeAllOpenClose();
		}

		function openModalCreate() {
			emit(
				"create",
				mergeMetaConfig({
					metaDataId: groupMetaDataId,
					api: CHART.createChartGroup,
					items: selectedGroupNode.value
						? [selectedGroupNode.value]
						: [],
				}),
			);
		}
		function openModalModify() {
			if (validateChartGroup()) {
				emit(
					"modify",
					mergeMetaConfig({
						metaDataId: groupMetaDataId,
						api: CHART.moodifyChartGroup,
						items: [
							{
								chartConditionGroupId:
									selectedGroupNode.value
										.chartConditionGroupId,
								chartConditionGroupName:
									selectedGroupNode.value
										.chartConditionGroupName,
								description:
									selectedGroupNode.value.description,
								materialType:
									selectedGroupNode.value.materialType,
								factoryName:
									selectedGroupNode.value.factoryName,
							},
						],
					}),
				);
			}
		}
		function openModalDelete() {
			if (validateChartGroup()) {
				const data = chartRef.value.gridItems;
				if (data.length == 0) {
					emit(
						"delete",
						mergeMetaConfig({
							metaDataId: groupMetaDataId,
							api: CHART.deleteChartGroup,
							items: [
								{
									chartConditionGroupId:
										selectedGroupNode.value
											.chartConditionGroupId,
									factoryName:
										selectedGroupNode.value.factoryName,
								},
							],
						}),
					);
				} else {
					openModalWarning("Chart 먼저 삭제해주세요");
					return false;
				}
			}
		}

		function setConditionAttribute(config = conditionDef) {
			config = Object.assign(config, {
				compareKeyValueFlag: "true",
				excludeKeyList: ["chartConditionSeq"],
			});

			if (validateChartGroup()) {
				const data = {
					chartConditionSeq: conditionRef.value.gridItems.length + 1,
					sequence: conditionRef.value.gridItems.length + 1,
				};
				emitEvent("create", config, data);
			}
		}

		function setChartCreateAttribute(config = chartDef) {
			if (validateChartGroup() && validateChartCondition()) {
				emitEvent("create", config, selectedGroup.value);
			}
		}

		function setChartModifyAttribute(config = chartDef) {
			if (validateChartGroup()) {
				emitEvent("modify", config);
			}
		}

		function validateChartGroup() {
			if (!selectedGroupNode.value.chartConditionGroupId) {
				openModalWarning("warning.selectRowData", {
					param: "Chart Condition Group",
				});
				return false;
			}
			return true;
		}

		function validateChartCondition() {
			const data = conditionRef.value.gridItems.filter(
				f => f.machineName,
			);
			if (data.length == 0) {
				openModalWarning("Chart Condition에서 확인 필요(MachineName)");
				return false;
			}
			return true;
		}

		function emitEvent(eventName, config, data = {}) {
			selectedGroupNode.value = Object.assign(
				selectedGroupNode.value,
				data,
			);
			const readOnlySetting = {
				...selectedGroupNode.value,
			};
			emit(eventName, config, readOnlySetting);
		}

		return {
			menuId,
			setSearchCondition,

			treeComboItems,
			treeComboValue,
			searchNode,

			toggleTree,
			init,

			treeItems,
			treeField,
			selectedNodes,
			selectNode,

			isShowChartDetail,

			openModalCreate,
			openModalModify,
			openModalDelete,

			selectedGroupNode,
			selectedGroup,

			conditionGridId,
			conditionDef,
			setConditionAttribute,

			chartGridId,
			chartDef,
			setChartCreateAttribute,
			setChartModifyAttribute,
			selectedChart,

			ACTION,
			CHART,
		};
	},
};
</script>-->
<style scoped>
:deep(.e-gridcontent) {
	height: calc(50vh - 250px) !important;
}
</style>
