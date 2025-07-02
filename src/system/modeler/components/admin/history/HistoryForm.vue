<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<HeaderTemplate
			:configs="headerConfigs"
			class="pr-2 mr-1"
			@search="searchHistory"
		>
			<template v-slot:[HEADER.ID]>
				<ComboBasic
					v-model="headerCondition[HEADER.ID]"
					:items="tableList"
					floatLabelType="Never"
				/>
			</template>
			<template v-slot:[HEADER.FROM]>
				<InputDate
					v-model="headerCondition[HEADER.FROM]"
					:hasTime="true"
					:showClearButton="false"
					floatLabelType="Never"
				/>
			</template>
			<template v-slot:[HEADER.TO]>
				<InputDate
					v-model="headerCondition[HEADER.TO]"
					:hasTime="true"
					:max="historyMax"
					:min="headerCondition[HEADER.FROM]"
					:showClearButton="false"
					floatLabelType="Never"
				/>
			</template>
		</HeaderTemplate>
		<div :class="{ unselected: !historyId }" class="card-body">
			<GridForm
				:key="currentRef"
				:checkbox="false"
				:customItems="historyList"
				:gridId="gridName"
				:needsDataState="false"
				:tableId="historyId"
				@onSelectionChanged="setInformation"
			>
				<template v-slot:grid-button>
					<span></span>
				</template>
			</GridForm>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import GridForm from "~/system/modeler/components/common/form/GridForm";
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic";
import InputDate from "~/system/modeler/components/common/input/InputDate";

import { ref, computed, onBeforeMount } from "vue";
import {
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useSystemSetting } from "~/system/modeler/plugins/composables/modeler-authority";
import {
	useInformation,
	useHeader,
} from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import { TABLE, ID } from "~/system/modeler/constants/modeler_constants.js";
import {
	HISTORY_HEADER,
	HISTORY_DTO,
} from "~/system/modeler/constants/table_constants.js";
import * as COMMON from "~/system/modeler/api/modeler-common";

export default {
	name: "HistoryForm",

	components: {
		GridForm,
		HeaderTemplate,
		ComboBasic,
		InputDate,
	},
	setup() {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		// Modal Alert
		const { openModalWarning } = useModalAlert();

		//==================== Header
		const HEADER = HISTORY_HEADER;
		const { formatConfigsByField } = useHeader();
		const headerConfigs = formatConfigsByField(Object.values(HEADER));

		// Condition
		const { createItem } = useItem();
		const headerCondition = ref(createItem(Object.values(HEADER)));

		//==================== History
		// Setting Config
		const { KEY, settingConfig } = useSystemSetting();
		const historyCount = computed(
			() => +settingConfig.value[KEY.HISTORY_COUNT],
		);
		const historyPeriod = computed(
			() => +settingConfig.value[KEY.HISTORY_PERIOD] || 0,
		);

		// ToDate
		const historyMax = computed(() => {
			const date = new Date(headerCondition.value[HEADER.FROM] || null);
			date.setDate(date.getDate() + historyPeriod.value);
			return date.toISOString().slice(0, -5);
		});

		const { fetchList } = useFetchData();

		const tableList = ref([]);
		const selectedHistoryId = ref("");

		/**
		 * History Table 데이터 할당
		 */
		async function fetchTableList() {
			const data = await fetchList(() => COMMON.getBy(TABLE.TABLE_DEF));

			// History Table이 존재하는 경우만 필터링
			tableList.value = data
				.filter(table => table[ID.HISTORY_TABLE_ID])
				.map(table => ({
					text: table[ID.TABLE_ID],
					value: table[ID.HISTORY_TABLE_ID],
				}))
				.sort();
		}

		onBeforeMount(fetchTableList);

		//==================== Grid
		const DTO = HISTORY_DTO;
		const currentRef = ref(0);
		const historyId = ref("");
		const historyList = ref([]);
		const gridName = computed(() => historyId.value || "History");

		/**
		 * 선택한 History 조회
		 */
		async function searchHistory() {
			if (!headerCondition.value[HEADER.ID]) {
				openModalWarning("warning.selectRowData", {
					param: ID.TABLE_ID,
				});
				return;
			}

			/**
			 * ISO를 timekey로 변환
			 * @param {String} key
			 */
			const formatTimeKey = key =>
				headerCondition.value[key].replace(/[^\d]/g, "");

			const dto = {
				[DTO.FROM_KEY]: formatTimeKey(HEADER.FROM),
				[DTO.TO_KEY]: formatTimeKey(HEADER.TO),
				[DTO.COUNT]: historyCount.value,
				condition: {},
			};

			historyId.value = headerCondition.value[HEADER.ID];
			historyList.value = await fetchList(() =>
				COMMON.getHistory(historyId.value, dto),
			);
			currentRef.value++;
		}

		return {
			// Information
			isShowInformation,
			infoConfig,
			setInformation,

			// Header
			HEADER,
			headerConfigs,
			headerCondition,
			historyMax,

			// Table
			ID,
			tableList,
			selectedHistoryId,

			// Grid Table
			currentRef,
			gridName,
			historyId,
			historyList,
			searchHistory,
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(.e-rowdragheader),
:deep(.e-movableheader),
:deep(.e-headercell) {
	padding-top: 1px;
	height: 34px !important;
	background: #f7f9fc !important;
}
:deep(.e-gridcontent) {
	height: calc(100vh - 333px) !important;
}
:deep(.e-frozenscrollbar.e-frozen-left-scrollbar) {
	display: inline-block !important;
}

/* Unselected Table */
.unselected :deep(.e-content) {
	display: none !important;
}
</style>
