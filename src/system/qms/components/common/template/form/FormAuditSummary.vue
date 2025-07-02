<template>
	<div class="info-audit-summary">
		<div class="row mb-2">
			<div class="col-6 summary-text">
				<Numericbox
					v-model="summaryInfo[SUMMARY.SCORE]"
					:enabled="false"
					:showSpinButton="false"
					floatLabelType="Always"
					placeholder="Score"
				/>
			</div>
			<div class="col-6 summary-text">
				<Textbox
					v-model="summaryInfo[SUMMARY.GRADE]"
					:enabled="false"
					floatLabelType="Always"
					placeholder="Grade"
				/>
			</div>
		</div>
		<FormGrid
			:checkbox="false"
			:customItems="summaries"
			:freezing="false"
			:gridId="META.SUPPLIER_AUDIT_SUMMARY"
			:paging="false"
			menuId="SupplierAudit"
		>
			<template v-slot:default-grid-button>
				<span></span>
			</template>
			<template v-slot:grid-button>
				<span></span>
			</template>
		</FormGrid>
	</div>
</template>

<script>
import { ref, computed, onMounted, reactive } from "vue";

import { useFetchData, useItem } from "~/plugins/composables/dataHandler";

import * as EVALUATION from "~/system/qms/api/evaluation";

import {
	META,
	STRATEGY_CONFIG,
	SURVEY_SUMMARY as SUMMARY,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "FormAuditSummary",
	props: {
		config: {
			type: Object,
			default() {
				return {};
			},
		},
		editing: { type: Boolean },
	},
	setup(props) {
		//==================== Summary
		const summaries = ref([]);

		const { fetchList } = useFetchData();
		const { filterItem, sortItemsBySequence } = useItem();

		const keyConfig = computed(() =>
			filterItem(props.config, [
				STRATEGY_CONFIG.ID,
				STRATEGY_CONFIG.EVALUATION,
			]),
		);

		/**
		 * auditSummary 가져오기
		 */
		async function fetchAuditSummary() {
			if (validateKeyConfig()) {
				const data = await fetchList(() =>
					EVALUATION.getSummariesBy(keyConfig.value),
				);
				summaries.value = sortItemsBySequence(data, "categorySequence");
			}
		}

		/**
		 * Key Config 유효성 검사
		 * @return {Boolean}
		 */
		function validateKeyConfig() {
			return Object.values(keyConfig.value).every(value => value != null);
		}

		onMounted(async () => {
			await fetchAuditSummary();
			calculateAverageScore();
		});

		//==================== Avg, Grade
		const summaryInfo = reactive({
			[SUMMARY.SCORE]: 0,
			[SUMMARY.GRADE]: "",
		});

		/**
		 * 총 평균 점수 계산
		 * @return {Number}
		 */
		function calculateAverageScore() {
			const sum = summaries.value
				.map(summary => summary.score)
				.reduce((acc, cur) => acc + Number(cur), 0);
			summaryInfo.score = +(sum / summaries.value.length).toFixed(2);
		}

		return {
			META,
			SUMMARY,

			summaries,
			summaryInfo,
		};
	},
};
</script>

<style scoped></style>
