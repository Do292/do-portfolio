<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<FormSearchCondition
				:conditionId="gridTableDef.searchConditionId"
				:isUseCustomQuery="true"
				:menuId="menuId"
				@searchByCondition="setCondition"
			></FormSearchCondition>
			<Splitter
				:paneConfigs="[
					{ key: 'left', size: 50, min: 25 },
					{ key: 'right', size: 50, min: 25 },
				]"
			>
				<template v-slot:left>
					<FormGrid
						:checkbox="false"
						:createApi="QUERY.createCustomQuery"
						:customApi="COMMON.getByCustomQuery"
						:deleteApi="QUERY.deleteCustomQuery"
						:gridId="gridId"
						:gridTitle="gridTableDef.label"
						:initSearch="false"
						:menuId="menuId"
						:metaDataId="'ManageQuery'"
						:modifyApi="QUERY.modifyCustomQuery"
						:searchCondition="searchCondition"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectQuery"
					/>
				</template>
				<template v-slot:right>
					<div class="row">
						<div class="col-6 item-title">
							<label>
								{{ $t("CustomQuery") }}
							</label>
						</div>
					</div>
					<div class="row">
						<div class="col-12">
							<div class="query-box">
								<textarea
									:value="selectedQueryString"
									disabled
								></textarea>
							</div>
						</div>
					</div>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import * as COMMON from "~/api/system-common.js";
import * as QUERY from "#/spc/api/query";

const menuId = "ManageQuery";
const gridId = "ManageQuery";
const { isShowInformation, infoConfig, setInformation } = useInformation();
const { fetchGridTableDef, gridTableDef } = useTableDef();

const selectedQueryString = ref("");
function selectQuery({ gridId, columns, row }) {
	selectedQueryString.value = row.queryString ?? "";
	setInformation({ gridId, columns, row });
}

onBeforeMount(async () => {
	await fetchGridTableDef(menuId, gridId);
});

const searchCondition = ref({});
const setCondition = async condition => {
	searchCondition.value = {
		queryId: gridTableDef.value.queryId, // GetCtCustomQuerySample
		queryVersion: gridTableDef.value.queryVersion, // 00001
		parameters: condition,
	};
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(85vh - 190px);
}
.query-box {
	width: 100%;
	height: calc(100vh - 230px);
	border: 1px solid #7778791e;
	background: #f3f4f5;
	padding: 3px 5px;
	overflow: hidden;
}
.query-box > textarea {
	width: 100%;
	height: 100%;
	border: none;
	background: #f3f4f5;
	resize: none;
	cursor: context-menu;
}
</style>
