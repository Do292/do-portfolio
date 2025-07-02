<template>
	<div class="info-audit">
		<div v-if="editing" class="row">
			<div class="col text-right">
				<div class="excel-box">
					<div class="btn-group">
						<button
							class="btn btn-md btn-default excel"
							title="Export Excel"
							@click="exportExcel"
						>
							<i class="aim aimcons_excel"></i>
							<i class="aim aimcons_output"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
		<template v-for="config of gridConfigs" :key="config.getKey()">
			<Grid
				v-bind="config"
				:autoFit="false"
				:checkbox="false"
				:columns="gridColumns"
				:exporting="false"
				:paging="false"
				:reordering="false"
				:selecting="false"
				:sorting="false"
			>
				<template v-slot:grid-button>
					<span></span>
				</template>
				<template v-slot:[COLUMN_TEMPLATE.NUMERIC]="data">
					<Numericbox
						:enabled="editing"
						:max="+data[ITEM.MAX_SCORE]"
						:min="0"
						:modelValue="data[data.column.field]"
						:showSpinButton="false"
						@update:modelValue="updateResponse($event, data)"
					/>
				</template>
			</Grid>
		</template>
		<template v-if="!gridConfigs.length">
			<div>No Evaluation</div>
		</template>
	</div>
</template>

<script>
import * as XLSX from "xlsx";

import { ref, computed, onMounted, inject } from "vue";

import { useItem, useFetchData } from "~/plugins/composables/dataHandler";
import { useColumnDef } from "~/plugins/composables/tableHandler";
import { useGrid, useTemplate } from "~/plugins/composables/syncfusionHelper";

import * as COMMON from "~/api/common.js";

import {
	META,
	STRATEGY_CONFIG,
	EVALUATION_ITEM as ITEM,
	EVALUATION_RESPONSE as RESPONSE,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "FormAudit",
	props: {
		config: { type: Object },
		editing: { type: Boolean },
	},
	setup(props) {
		//==================== Config
		const { filterItem, groupByItems, sortItemsBySequence } = useItem();
		const { ID, fetchGridColumns, gridColumns } = useColumnDef();
		const { Base } = useTemplate();
		const { COLUMN_TEMPLATE } = useGrid();

		const keyConfig = computed(() =>
			filterItem(props.config, [
				STRATEGY_CONFIG.ID,
				STRATEGY_CONFIG.EVALUATION,
			]),
		);

		// Grid
		const gridConfigs = computed(() => {
			return Object.entries(itemsByCategory.value).map(
				([category, items]) => new GridAudit(category, items),
			);
		});

		class GridAudit extends Base {
			constructor(category, items) {
				super(category);
				this.gridId = category.replace(/ /g, "");
				this.gridName = category;
				this.gridItems = items;
			}
		}

		// Step
		const { selectedStep } = inject("step");
		const { metaDataId } = selectedStep;

		//==================== Evaluation
		const evaluationItems = ref([]);
		const responses = ref([]);

		const { fetchList } = useFetchData();

		/**
		 * Evaluation Item, Response 데이터 가져오기
		 */
		async function fetchEvaluation() {
			if (validateKeyConfig()) {
				evaluationItems.value = await fetchList(() =>
					COMMON.getByParam(
						META.EVALUATION_RESPONSE,
						keyConfig.value,
					),
				);
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
			await fetchGridColumns("SupplierAuditHandling", metaDataId);
			await fetchEvaluation();
		});

		/**
		 * 평가 목록 카테고리별 그룹화
		 */
		const itemsByCategory = computed(() => {
			const data = groupByItems(ITEM.CATEGORY, evaluationItems.value);
			Object.entries(data).forEach(([category, items]) => {
				data[category] = sortItemsBySequence(items, ITEM.SEQUENCE);
			});
			return data;
		});

		/**
		 * @param {Number} value
		 * @param {Object} data
		 */
		function updateResponse(value, data) {
			let item = findResponse(data);
			if (!item) {
				item = defineResponse(data);
				responses.value.push(item);
			}
			item[data.column.field] = value;
		}

		/**
		 * @param {Object} data
		 * @return {Object}
		 */
		function findResponse(data) {
			return responses.value.find(
				item => item[RESPONSE.ITEM_ID] == data[RESPONSE.ITEM_ID],
			);
		}

		/**
		 * @param {Object} item
		 * @return {Object}
		 */
		function defineResponse(item = {}) {
			const response = filterItem(item, Object.values(RESPONSE));
			response[RESPONSE.ISSUANCE_NO] = props.config[STRATEGY_CONFIG.ID];
			return response;
		}

		/**
		 * 평가 응답 저장
		 */
		async function respondEvaluation() {
			await fetchList(() =>
				COMMON.create(META.EVALUATION_RESPONSE, responses.value),
			);
		}

		//==================== Excel

		/**
		 * 카테고리별로 Sheet 생성 후 엑셀 다운로드
		 * @todo 엑셀 형식 달라질 경우 수정 필요
		 */
		function exportExcel() {
			const wb = XLSX.utils.book_new();
			const keys = gridColumns.value.map(column => column[ID.FIELD]);

			gridConfigs.value.forEach(gridConfig => {
				const data = gridConfig.gridItems.map(item =>
					filterItem(item, keys),
				);
				const ws = XLSX.utils.json_to_sheet(data);
				const sheetName = gridConfig.gridName.slice(0, 31);
				XLSX.utils.book_append_sheet(wb, ws, sheetName);
			});

			XLSX.writeFile(wb, `Audit.xlsx`);
		}

		return {
			// Config
			META,
			COLUMN_TEMPLATE,
			ITEM,
			metaDataId,
			gridConfigs,
			gridColumns,

			// Evaluation
			evaluationItems,
			itemsByCategory,
			updateResponse,
			save: respondEvaluation,

			// Excel
			exportExcel,
		};
	},
};
</script>
<style scoped>
/* Input */
/* Numericbox SpinButton 숨김 처리시 공간 차지하지 않도록 함 */
.e-input-group > input.e-numeric-hidden {
	padding: 0px !important;
}

/* Excel */
/* .excel-box {
	display: inline-block;
}
.excel-box .btn-group button {
	color: #4d4d4d;
} */
</style>
