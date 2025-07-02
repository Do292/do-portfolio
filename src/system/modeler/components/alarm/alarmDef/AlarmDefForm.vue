<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderTemplate :configs="headerConfigs">
						<template v-slot:[ALARM_TYPE]>
							<ComboBasic
								v-model="selectedType"
								:items="alarmTypes"
								floatLabelType="Never"
							/>
						</template>
					</HeaderTemplate>
					<GridForm
						:condition="typeConfig"
						:menuId="TABLE.ALARM_DEF"
						:tableId="TABLE.ALARM_DEF"
						@create="openModalCreateAlarm"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectAlarm"
					/>
				</template>
				<template v-slot:right>
					<AlarmActionTab :config="selectedAlarm" />
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
// Header
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic";

// Form
import GridForm from "~/system/modeler/components/common/form/GridForm";
import AlarmActionTab from "~/system/modeler/components/alarm/alarmDef/AlarmActionTab";

import { ref, watch, computed, onBeforeMount } from "vue";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useInformation,
	useHeader,
} from "~/system/modeler/plugins/composables/modeler-uiControl";

import { TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { ALARM, ENUM } from "~/system/modeler/constants/table_constants.js";
import * as COMMON from "~/system/modeler/api/modeler-common";

export default {
	name: "AlarmDefForm",
	components: {
		HeaderTemplate,
		ComboBasic,
		GridForm,
		AlarmActionTab,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const ALARM_TYPE = "AlarmType";
		const { formatConfigsByField } = useHeader();
		const headerConfigs = formatConfigsByField([ALARM_TYPE]);

		const paneConfigs = [
			{ key: "left", size: 60 },
			{ key: "right", size: 40 },
		];

		//==================== Alarm Type
		const { fetchList } = useFetchData();
		const alarmTypes = ref([]);
		const selectedType = ref("");
		const typeConfig = computed(() => ({
			[ALARM.TYPE]: selectedType.value,
		}));

		/**
		 * Alarm Type 데이터 할당
		 */
		async function fetchAlarmTypes() {
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.ENUM_VALUE, { [ENUM.NAME]: ALARM_TYPE }),
			);

			alarmTypes.value = data.map(item => item[ENUM.VALUE]);
		}

		onBeforeMount(() => {
			fetchAlarmTypes();
		});

		//==================== Alarm
		const selectedAlarm = ref({});

		// Type 변경 시 alarmId 초기화
		watch(
			() => selectedType.value,
			() => {
				selectedAlarm.value = {};
			},
		);

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectAlarm({ tableId, columns, row = {} }) {
			selectedAlarm.value = row;
			setInformation({ tableId, columns, row });
		}

		/**
		 * @param {Object} config
		 */
		function openModalCreateAlarm(config) {
			emit("create", config, typeConfig.value);
		}

		return {
			// Config
			TABLE,
			paneConfigs,
			headerConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// AlarmType
			ALARM,
			ALARM_TYPE,
			alarmTypes,
			selectedType,
			typeConfig,

			// Alarm
			selectedAlarm,
			selectAlarm,
			openModalCreateAlarm,
		};
	},
};
</script>
<style scoped>
/* Alarm Def */
:deep(.card-header .btn-search) {
	display: none;
}
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 341px) !important;
}
</style>
