<template>
	<HeaderTemplate :configs="headerConfigs" @search="selectSpec">
		<template v-slot:[SPEC_ID]>
			<ComboBasic
				v-model="selectedSpecId"
				:dataSource="specIds"
				floatLabelType="Never"
			/>
		</template>
		<template v-slot:[VERSION]>
			<ComboBasic
				v-model="selectedVersion"
				:dataSource="versions"
				floatLabelType="Never"
			/>
		</template>
	</HeaderTemplate>
</template>

<script>
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic.vue";

import { ref, computed, watch, onMounted } from "vue";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useHeader } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useUserInfo } from "~/system/modeler/plugins/composables/modeler-authority";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import * as COMMON from "~/system/modeler/api/modeler-common";
import { PROCESS_SPEC } from "~/system/modeler/constants/table_constants.js";
import { TABLE, ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "HeaderProcessSpec",
	components: {
		HeaderTemplate,
		ComboBasic,
	},
	setup(_, { emit }) {
		const { ID: SPEC_ID, VERSION } = PROCESS_SPEC;
		const { formatConfigsByField } = useHeader();
		const headerConfigs = formatConfigsByField([SPEC_ID, VERSION]);

		const { fetchList } = useFetchData();
		const { userFactory } = useUserInfo();
		const { openModalWarning } = useModalAlert();

		const specList = ref([]);
		const selectedSpecId = ref("");
		const selectedVersion = ref("");

		/**
		 * Spec 데이터 할당
		 */
		async function fetchProcessSpecs() {
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.PROCESS_SPEC, {
					[ID.FACTORY_ID]: userFactory.value,
				}),
			);

			specList.value = data;
		}
		const specIds = computed(() => {
			return [...new Set(specList.value.map(spec => spec[SPEC_ID]))];
		});

		const versions = computed(() =>
			specList.value
				.filter(spec => spec[SPEC_ID] == selectedSpecId.value)
				.map(spec => spec[VERSION])
				.sort(),
		);

		/**
		 * 선택한 Spec 전송
		 */
		function selectSpec() {
			if (!selectedSpecId.value || !selectedVersion.value) {
				openModalWarning("warning.selectData");
				return;
			}

			emit("select", {
				[SPEC_ID]: selectedSpecId.value,
				[VERSION]: selectedVersion.value,
			});
		}

		// default factory 변경 시 초기화
		watch(
			() => userFactory.value,
			() => {
				fetchProcessSpecs();
				emit("select", {});
			},
		);

		onMounted(async () => {
			await fetchProcessSpecs();
		});

		return {
			ID,
			SPEC_ID,
			VERSION,
			headerConfigs,
			selectedSpecId,
			selectedVersion,
			specIds,
			versions,
			selectSpec,
		};
	},
};
</script>

<style scoped></style>
