<template>
	<TabTemplate
		v-if="tabNames.length"
		:isRemovable="false"
		:tabKeys="tabNames"
		@select="selectTab"
	>
		<template v-slot:tabContent>
			<div v-if="selectedTab == OVERVIEW_TAB" class="overview">
				<GridForm
					:condition="selectedSpec"
					:tableId="TABLE.OBJECT_PROCESS_SPEC"
					@onSelectionChanged="$emit('selectRow', $event)"
				>
					<template v-slot:grid-button>
						<span></span>
					</template>
				</GridForm>
				<template v-for="{ key } in verticalConfigs" :key="key">
					<GridForm
						:condition="selectedSpec"
						:tableId="key"
						@onSelectionChanged="$emit('selectRow', $event)"
					>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</GridForm>
				</template>
			</div>
			<GridForm
				v-else
				:key="selectedTab"
				:condition="condition"
				:tableId="selectedTab"
				@create="$emit('create', $event)"
				@delete="$emit('delete', $event)"
				@modify="$emit('modify', $event)"
				@onSelectionChanged="$emit('selectRow', $event)"
			/>
		</template>
	</TabTemplate>
	<template v-else>
		<div class="nodata">Not exist policy data</div>
	</template>
</template>

<script>
import TabTemplate from "~/system/modeler/components/common/template/TabTemplate";

import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref, onBeforeMount, computed } from "vue";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import { TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { PS_TABLE_CONDITION_DEF } from "~/system/modeler/constants/table_constants";

export default {
	name: "PSPolicyTab",
	components: {
		TabTemplate,
		GridForm,
	},
	props: { condition: { type: Object }, selectedSpec: { type: Object } },
	emits: ["create", "delete", "modify", "selectRow"],
	setup() {
		//==================== Tab
		const { TABLE_ID, CONDITION_ID, POSITION } = PS_TABLE_CONDITION_DEF;

		const { fetchList, assignDataState } = useFetchData();

		const psTableConditionList = ref([]);
		const tabNames = ref([]);
		const selectedTab = ref(null);

		const OVERVIEW_TAB = "tab.overview";

		/**
		 * PsTableCondition 데이터 가져오기
		 * @todo 파라미터 수정
		 */
		async function fetchPsTableConditions() {
			const param = assignDataState({ [CONDITION_ID]: "TFO" });
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.PS_TABLE_CONDITION_DEF, param),
			);
			psTableConditionList.value = data.sort(
				(a, b) => a[POSITION] - b[POSITION],
			);
		}

		onBeforeMount(async () => {
			await fetchPsTableConditions();
			const conditionList = psTableConditionList.value.map(
				table => table[TABLE_ID],
			);
			tabNames.value = [OVERVIEW_TAB, ...conditionList];
			selectedTab.value = tabNames.value[0];
		});

		/**
		 * @param {Number} index
		 */
		function selectTab(index) {
			selectedTab.value = tabNames.value[index];
		}

		//==================== Splitter
		const verticalConfigs = computed(() =>
			psTableConditionList.value.map(key => ({
				key: key[TABLE_ID],
				size: 100 / psTableConditionList.value.length,
			})),
		);

		return {
			// Tab
			TABLE,
			OVERVIEW_TAB,
			tabNames,
			selectTab,
			selectedTab,

			// Splitter
			verticalConfigs,
		};
	},
};
</script>

<style scoped>
.overview {
	position: relative;
	height: calc(100vh - 180px);
	overflow: auto;
}
#right-pane .overview :deep(.grid-form) {
	position: relative;
	height: calc(40vh - 80px);
}
#right-pane .overview :deep(.grid-form .e-grid) {
	height: calc(100% - 50px) !important;
}
#right-pane .overview :deep(.grid-form .e-gridcontent) {
	height: calc(100% - 84px) !important;
}
#right-pane .overview :deep(.grid-form .e-gridpager) {
	border-bottom: #e0e0e0 !important;
}

.nodata {
	font-size: 20px;
	justify-content: center;
	text-align: center;
	align-items: center;
	height: 100%;
	display: flex;
}
</style>
