<template>
	<HeaderTemplate :configs="headerConfigs" @search="selectSystemId">
		<template v-slot:[SYSTEM_DEF.ID]>
			<ComboBasic
				v-model="selectedSystemId"
				:items="systems"
				floatLabelType="Never"
			/>
		</template>
	</HeaderTemplate>
</template>

<script>
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic";

import { ref, onMounted } from "vue";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useHeader } from "~/system/modeler/plugins/composables/modeler-uiControl";

import * as COMMON from "~/system/modeler/api/modeler-common";
import { SYSTEM, TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { SYSTEM_DEF } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "HeaderSystem",
	components: {
		HeaderTemplate,
		ComboBasic,
	},
	setup(_, { emit }) {
		//==================== System
		const { ID, NAME } = SYSTEM_DEF;
		const { fetchList } = useFetchData();
		const systems = ref([]);
		const selectedSystemId = ref(null);

		const { formatConfigsByField } = useHeader();
		const headerConfigs = formatConfigsByField([ID]);

		/**
		 * System 데이터 할당
		 */
		async function fetchSystems() {
			const data = await fetchList(() => COMMON.getBy(TABLE.SYSTEM_DEF));

			systems.value = data.map(system => ({
				value: system[ID],
				text: system[NAME],
			}));
		}

		/**
		 * 시스템 Id 이벤트 전송
		 */
		async function selectSystemId() {
			emit("select", selectedSystemId.value);
		}

		onMounted(async () => {
			await fetchSystems();

			// Modeler로 초기화
			selectedSystemId.value = SYSTEM.MODELER;
			selectSystemId();
		});

		return {
			// System
			SYSTEM_DEF,
			headerConfigs,
			systems,
			selectedSystemId,
			selectSystemId,
		};
	},
};
</script>
