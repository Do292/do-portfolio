<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="horizontalConfigs">
				<template v-slot:left>
					<FormGrid
						ref="evaluationRef"
						:gridId="META.EVALUATION"
						:menuId="META.SUPPLIER_AUDIT_PLAN"
						:metaDataId="META.EVALUATION"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectEvaluation"
					/>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="evaluationItemRef"
						:condition="selectedEvaluation"
						:dragging="true"
						:gridId="META.EVALUATION_ITEM"
						:menuId="META.SUPPLIER_AUDIT_PLAN"
						:metaDataId="META.EVALUATION_ITEM"
						@create="openModalCreateValue"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="setInformation"
					/>
				</template>
			</Splitter>
			<FormInformation :config="infoConfig" />
		</div>
	</div>
</template>

<script>
import { ref } from "vue";
import { META } from "~/system/qms/constants/qms_meta_constants.js";
import { useInformation } from "~/plugins/composables/uiControl";
import { CAMEL_ID } from "~/constants/common_constants.js";
export default {
	name: "SupplierAuditsForm",
	emits: ["create", "modify"],
	props: {
		menuId: { type: String },
		metaDataId: { type: String },
		gridId: { type: String },
		gridTitle: { type: String },
		condition: {
			type: Object,
			default() {
				return {};
			},
		},
		searchCondition: {
			type: [Array, Object],
			default() {
				return [];
			},
		},
		createApi: { type: Function },
	},
	setup(props, { emit }) {
		const evaluationRef = ref(null);
		const evaluationItemRef = ref(null);

		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const horizontalConfigs = [
			{ key: "left", size: 40, min: "500px" },
			{ key: "right", size: 60, min: "600px" },
		];

		const selectedEvaluation = ref({ evaluationId: "" });

		function selectEvaluation({ gridId, columns, row = {} }) {
			selectedEvaluation.value = { ["evaluationId"]: row["id"] };
			setInformation({ gridId, columns, row });
		}

		function openModalCreateValue(config) {
			const { length } = evaluationItemRef.value.gridItems;
			const readOnlySetting = {
				...selectedEvaluation.value,
				[CAMEL_ID.SEQUENCE]: length + 1,
			};

			emit("create", config, readOnlySetting);
		}

		return {
			//Evaluation
			evaluationRef,

			// Config
			META,
			isShowInformation,
			infoConfig,
			setInformation,
			horizontalConfigs,

			//EvaluationItem
			evaluationItemRef,
			selectEvaluation,
			selectedEvaluation,
			openModalCreateValue,
		};
	},
};
</script>

<style></style>
