<template>
	<div class="step-detail-container d-table table-item">
		<div
			v-for="column of metaColumns"
			:key="column.field"
			class="d-table-row"
		>
			<div class="d-table-cell field">{{ column.headerText }}</div>
			<div class="d-table-cell input">
				<FormInput
					v-model="detailConfig[column.field]"
					:class="{ 'multi-line': hasMultiLine(column) }"
					:fieldConfig="column"
					:hasLabel="false"
					:isDisabled="!editing"
					class="step-detail"
					floatLabelType="Never"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, computed, watch, onBeforeMount, inject } from "vue";

import { useSpinner } from "~/plugins/composables/uiControl";
import { useColumnDef } from "~/plugins/composables/tableHandler";
import { useFetchData, useItem } from "~/plugins/composables/dataHandler";

import { STRATEGY_CONFIG } from "~/system/qms/constants/qms_meta_constants.js";
import { DATA_TYPE } from "~/constants/common_constants.js";
import * as COMMON from "~/api/common.js";
import * as STRATEGY from "~/system/qms/api/strategy.js";

export default {
	name: "FormStepDetail",
	props: {
		config: { type: Object },
		editing: { type: Boolean },
	},
	setup(props, { emit }) {
		//==================== Field
		const { executeWithSpinner } = useSpinner();
		const { ID: COLUMN_ID, metaColumns, fetchMetaColumns } = useColumnDef();

		// Step
		const { selectedStep } = inject("step");
		const { id: stepId, metaDataId } = selectedStep;

		// Config
		const detailConfig = ref({});

		/**
		 * @param {Object} column
		 * @returns {Boolean}
		 */
		function hasMultiLine(column) {
			return column[COLUMN_ID.DATA_TYPE] === DATA_TYPE.LOB;
		}

		onBeforeMount(() =>
			executeWithSpinner(async () => {
				await fetchMetaColumns(metaDataId);
				await initConfig();

				// id 값이 정의되지 않은 경우, 편집할 필요 없으므로 바로 작성 가능
				if (!detailConfig.value[STRATEGY_CONFIG.ID]) {
					emit("edit");
				}
			}),
		);

		watch(
			() => props.editing,
			editing => {
				// edit 취소 시, input 데이터 초기화
				if (!editing) {
					initConfig();
				}
			},
		);

		//==================== Config
		const { ID, TYPE } = STRATEGY_CONFIG;
		const { fetchList } = useFetchData();
		const { filterItem } = useItem();

		const typeConfig = computed(() => filterItem(props.config, [ID, TYPE]));

		/**
		 * stepId가 있고, issuanceNo이 정의된 경우만 데이터를 fetch한다.
		 */
		async function initConfig() {
			if (stepId && typeConfig.value[ID]) {
				const data = await fetchList(() =>
					COMMON.getByParam(stepId, typeConfig.value),
				);
				detailConfig.value = data ?? {};
			}
		}

		/**
		 * strategy 생성 시엔, typeId endPoint로 보내야 함.
		 */
		async function saveConfig() {
			const typeId = props.config[TYPE];
			const config = Object.assign(detailConfig.value, typeConfig.value);
			await fetchList(() => STRATEGY.create(stepId, typeId, config));
		}

		return { metaColumns, hasMultiLine, detailConfig, save: saveConfig };
	},
};
</script>
<style scoped>
:deep(.input-field-box .e-input-group) {
	width: 100% !important;
	height: 35px !important;
}
</style>
