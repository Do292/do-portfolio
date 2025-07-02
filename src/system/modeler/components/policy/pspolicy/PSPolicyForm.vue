<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderProcessSpec @select="selectSpec" />
					<GridForm
						:customItems="operationList"
						:gridId="TABLE.PROCESS_OPERATION"
						:tableId="TABLE.PROCESS_OPERATION"
						menuId="PSPolicy"
						@onSelectionChanged="selectOperation"
					>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</GridForm>
				</template>
				<template v-slot:right>
					<PSPolicyTab
						:condition="selectedOperation"
						:selectedSpec="selectedSpec"
						@create="openModalCreate"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@selectRow="setInformation"
					/>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import GridForm from "~/system/modeler/components/common/form/GridForm";

import HeaderProcessSpec from "~/system/modeler/components/policy/pspolicy/HeaderProcessSpec";
import PSPolicyTab from "~/system/modeler/components/policy/pspolicy/PSPolicyTab";

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import * as POLICY from "~/system/modeler/api/policy.js";
import { TABLE } from "~/system/modeler/constants/modeler_constants.js";
import {
	PROCESS_SPEC,
	PROCESS_FLOW,
	PROCESS_OPERATION,
} from "~/system/modeler/constants/table_constants";

export default {
	name: "PSPolicyForm",
	components: {
		GridForm,
		HeaderProcessSpec,
		PSPolicyTab,
	},
	emits: ["create", "modify", "delete"],
	setup(_, { emit }) {
		//==================== Config
		// Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		// Splitter
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== Process Operation
		const { fetchList } = useFetchData();
		const { filterItem } = useItem();

		const { ID: SPEC_ID, VERSION } = PROCESS_SPEC;
		const { ID: FLOW_ID } = PROCESS_FLOW;
		const { ID: OPERATION_ID } = PROCESS_OPERATION;

		const selectedSpec = ref({ [SPEC_ID]: "" });
		const operationList = ref([]);
		const selectedOperation = ref(defineProcessOperation({}));

		function selectSpec(config) {
			selectedSpec.value = config;
			fetchProcessOperations(config);
		}

		/**
		 * ProcessOperation 데이터 가져오기
		 * @param {Object} params
		 */
		async function fetchProcessOperations(params) {
			operationList.value = await fetchList(() =>
				POLICY.getProcessOperation(params),
			);
		}

		/**
		 * @param {Object|null} item
		 * @returns {Object}
		 */
		function defineProcessOperation(item = {}) {
			return filterItem(item, [SPEC_ID, VERSION, FLOW_ID, OPERATION_ID]);
		}

		/**
		 * @param {Object} config
		 * @param {Object} config.row
		 */
		function selectOperation(config) {
			selectedOperation.value = defineProcessOperation(config.row);
			setInformation(config);
		}

		//==================== Policy Tab
		const { openModalWarning } = useModalAlert();

		/**
		 * readOnly 설정을 포함해 이벤트 전송
		 * @param {Object} config
		 */
		function openModalCreate(config) {
			const isConditionValid = Object.values(
				selectedOperation.value,
			).every(Boolean);

			if (!isConditionValid) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_OPERATION,
				});
				return;
			}

			emit("create", config, selectedOperation.value);
		}

		return {
			// Config
			TABLE,
			isShowInformation,
			infoConfig,
			setInformation,
			paneConfigs,

			// Process Operation
			selectedSpec,
			selectSpec,
			operationList,
			fetchProcessOperations,
			selectOperation,
			selectedOperation,

			// Policy Tab
			openModalCreate,
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 340px) !important;
}
:deep(#right-pane .e-gridcontent) {
	height: calc(100vh - 311px) !important;
}
:deep(#right-pane .e-pane-vertical .e-gridcontent) {
	height: calc(100vh - 678px) !important;
}

:deep(.e-frozenscrollbar.e-frozen-left-scrollbar) {
	display: inline-block !important;
}

/* Tab */
/* tab content 무시 */
:deep(.e-tab.e-background .e-content.e-lib.e-touch) {
	display: none;
}
</style>
