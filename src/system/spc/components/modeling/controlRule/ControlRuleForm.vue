<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="gridTableDef.searchConditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setCondition"
			></FormSearchCondition>
			<FormGrid
				:createApi="RULE.createRule"
				:customApi="COMMON.getByCustomQuery"
				:deleteApi="RULE.deleteRule"
				:gridId="gridId"
				:gridTitle="gridTableDef.label"
				:initSearch="false"
				:isUsePath="false"
				:menuId="menuId"
				:metaDataId="'ControlRule'"
				:modifyApi="RULE.modifyRule"
				:searchCondition="searchCondition"
				@create="$emit('create', $event)"
				@delete="deleteRuleDef"
				@modify="checkRuleType"
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
import { useModalAlert } from "~/plugins/composables/modalHandler";
import * as COMMON from "~/api/system-common";
import * as RULE from "#/spc/api/rule";

const emit = defineEmits(["create", "modify", "delete"]);

const menuId = "ControlRule";
const gridId = "ControlRule";
const { openModalWarning } = useModalAlert();
const { isShowInformation, infoConfig, setInformation } = useInformation();
const { fetchGridTableDef, gridTableDef } = useTableDef();

onBeforeMount(async () => {
	await fetchGridTableDef(menuId, gridId);
});

const searchCondition = ref({});
const setCondition = async condition => {
	searchCondition.value = {
		queryId: gridTableDef.value.queryId,
		queryVersion: gridTableDef.value.queryVersion,
		parameters: condition,
	};
};

function checkRuleType(event) {
	const items = event.items;
	if (items.length == 0) {
		openModalWarning("warning.selectData");
		return false;
	} else if (items.length > 1) {
		openModalWarning("warning.selectOneData");
		return false;
	} else if (items[0].ruleType !== "Custom") {
		openModalWarning("'Cutom' Rule만 수정 가능합니다.");
		return false;
	} else {
		emit("modify", event);
	}
}

function deleteRuleDef(event) {
	const items = event.items;
	if (items.length == 0) {
		openModalWarning("warning.selectData");
		return false;
	} else if (items.filter(f => f.ruleType != "Custom").length > 0) {
		openModalWarning("'Cutom' Rule만 삭제 가능합니다.");
		return false;
	} else {
		emit("delete", event);
	}
}
</script>
<style scoped>
:deep(.e-grid .e-gridcontent) {
	height: calc(100vh - 320px) !important;
}
</style>
