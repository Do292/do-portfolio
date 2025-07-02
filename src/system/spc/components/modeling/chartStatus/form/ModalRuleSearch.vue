<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h6 class="modal-title">
						<span>{{ $t("modal.search.title") }}</span>
					</h6>
					<ButtonBasic type="close" @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark p-2">
					<div class="card mb-3">
						<FormGrid
							ref="ruleModalGrid"
							:customItems="ruleItems"
							:exporting="false"
							:gridId="gridId"
							:gridTitle="gridTableDef.label"
							:isUseCreate="false"
							:isUseDelete="false"
							:isUseModify="false"
							:isUsePath="false"
							:menuId="menuId"
							@onAfterBindData="selectRuleItems"
						>
							<!-- @onCheckBoxChange="checkSelectedRowCnt" -->
						</FormGrid>
					</div>
				</div>
				<div class="modal-footer">
					<!-- :disabled="!isApplicable" -->
					<ButtonBasic
						class="apply"
						type="apply"
						@onClick="applyData"
					>
						<label>Apply</label>
					</ButtonBasic>
					<ButtonBasic
						class="btn btn-md btn-footer"
						type="close"
						@onClick="$emit('close')"
					>
						<label>Close</label>
					</ButtonBasic>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, computed, onBeforeMount, watch, readonly } from "vue";
import { useSpinner } from "~/plugins/composables/uiControl";
import { useTableDef } from "~/plugins/composables/tableHandler";
import * as COMMON from "~/api/system-common.js";

const FIELD_MAP = readonly({
	CHARTNAME: "chartName",
	RULETYPE: "ruleType",
	RULENAME: "ruleName",
	DESCRIPTION: "description",
	CHARTID: "chartId",
	ALARMID: "alarmId",
	WARNINGMESSAGE: "warningMessage",
});

export default {
	name: "ModalRuleSearch",
	props: {
		menuId: { type: String },
		condition: {
			type: Object,
			default() {
				return {};
			},
		},
		currentRuleItems: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	setup(props, { emit }) {
		const { alarmComboSource, controlChartType, chartId } = props.condition;
		const { fetchGridTableDef, gridTableDef } = useTableDef();
		const { executeWithSpinner } = useSpinner();

		const menuId = props.menuId;
		const gridId = "ModalSearch.RuleLimit";
		const ruleModalGrid = ref(null);
		const ruleItems = ref([]);
		const selectedRuleData = ref([]);

		const searchCondition = computed(() => ({
			queryId: gridTableDef.value.queryId,
			queryVersion: gridTableDef.value.queryVersion,
			parameters: { controlChartType, chartId },
		}));

		// const selectedRows = ref([]);
		// const isApplicable = computed(() => selectedRows.value.length !== 0);

		// function checkSelectedRowCnt(checkedItems) {
		// 	selectedRows.value = checkedItems;
		// }

		onBeforeMount(async () => {
			await fetchGridTableDef(menuId, gridId);
		});

		watch(
			() => searchCondition.value.queryId,
			value => {
				if (value) {
					fetchRuleList(searchCondition.value);
				}
			},
		);

		async function fetchRuleList(searchCondition) {
			const { data } = await COMMON.getByCustomQuery({
				searchCondition,
			});
			ruleItems.value = convertField(data.data);
		}

		function convertField(items) {
			const fieldList = Object.keys(FIELD_MAP);
			const data = [];

			for (let i = 0; i < items.length; i++) {
				let obj = {};
				for (let field of fieldList) {
					obj[FIELD_MAP[field]] = items[i][field.toUpperCase()];
				}
				obj["alarmIdComboSource"] = alarmComboSource;
				obj["alarmIdComboColumn"] = ["AlarmId", "Description"];
				obj["alarmIdMultiColumns"] = true;
				data.push(obj);
			}

			return data;
		}

		function selectRuleItems() {
			if (ruleModalGrid.value?.gridItems.length > 0) {
				executeWithSpinner(() => {
					// const orgItems = ruleModalGrid.value.gridItems;
					// const selectedIndexes = orgItems
					// 	.map((item, index) => ({ ...item, index }))
					// 	.filter(item => item.chartId)
					// 	.map(({ index }) => index);
					const allItems = ruleItems.value.map((item, index) => ({
						...item,
						index,
					}));
					const selectedIndexes = allItems
						.filter(item =>
							props.currentRuleItems.some(
								cur =>
									item.chartName == cur.chartName &&
									item.ruleName == cur.ruleName,
							),
						)
						.map(({ index }) => index);
					ruleModalGrid.value.selectRows(selectedIndexes);
				});
			}
		}

		function applyData() {
			selectedRuleData.value = ruleModalGrid.value.cloneCheckItems();
			emit("apply", selectedRuleData);
		}

		return {
			gridId,
			gridTableDef,
			searchCondition,
			ruleModalGrid,
			ruleItems,

			// checkSelectedRowCnt,
			selectRuleItems,

			COMMON,

			// isApplicable,
			applyData,
		};
	},
};
</script>
<style scoped>
.modal-dialog-centered {
	min-width: 60vw !important;
}
.modal-content {
	max-height: 100vh !important;
}
</style>
