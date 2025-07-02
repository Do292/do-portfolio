<template>
	<div class="info-audit-plan">
		<div class="row mb-2">
			<div class="col-6">
				<InputSearch
					:dependency="[]"
					:field="META.EVALUATION"
					:isDisabled="!editing"
					:showSpinButton="false"
					:value="selectedEvaluation[EVALUATION_ID]"
					floatLabelType="Always"
					placeholder="Evaluation"
					@reset="resetValue"
					@search="updateValue"
				/>
			</div>
		</div>
		<FormGrid
			:checkbox="false"
			:condition="selectedEvaluation"
			:exporting="false"
			:metaDataId="META.EVALUATION_ITEM"
			:paging="true"
			menuId="SupplierAuditHandling"
		>
			<template v-slot:grid-button>
				<span></span>
			</template>
		</FormGrid>
	</div>
</template>

<script>
import { ref, computed } from "vue";

import { useFetchData, useItem } from "~/plugins/composables/dataHandler";

import * as EVALUATION_API from "~/system/qms/api/evaluation";

import {
	META,
	STRATEGY_CONFIG,
	EVALUATION,
	EVALUATION_ITEM,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "FormAuditPlan",
	props: {
		config: { type: Object },
		editing: { type: Boolean },
	},
	setup(props, { emit }) {
		//==================== Config
		const { filterItem } = useItem();

		const typeConfig = computed(() =>
			filterItem(props.config, [
				STRATEGY_CONFIG.ID,
				STRATEGY_CONFIG.TYPE,
			]),
		);

		//==================== Evaluation
		const { EVALUATION_ID } = EVALUATION_ITEM;
		const { fetchList } = useFetchData();

		const selectedEvaluation = ref(
			defineEvaluation(props.config[STRATEGY_CONFIG.EVALUATION]),
		);

		/**
		 * @param {Object[]}
		 */
		function updateValue(items) {
			selectedEvaluation.value = defineEvaluation(
				items[0][EVALUATION.ID],
			);
		}

		/**
		 * 선택한 evaluationId 초기화
		 */
		function resetValue() {
			selectedEvaluation.value = defineEvaluation("");
		}

		/**
		 * @param {String} value
		 * @returns {Object}
		 */
		function defineEvaluation(value) {
			return { [EVALUATION_ID]: value };
		}

		/**
		 * 해당 Type에 EvaluationId 할당
		 */
		async function saveEvaluation() {
			const typeId = typeConfig.value[STRATEGY_CONFIG.TYPE];
			const config = {
				...selectedEvaluation.value,
				...filterItem(typeConfig.value, [STRATEGY_CONFIG.ID]),
			};
			await fetchList(() =>
				EVALUATION_API.updateEvaluation(typeId, config),
			);
			emit("saveCompleted", selectedEvaluation.value);
		}

		return {
			META,
			EVALUATION_ID,

			selectedEvaluation,
			save: saveEvaluation,

			updateValue,
			resetValue,
		};
	},
};
</script>

<style scoped></style>
