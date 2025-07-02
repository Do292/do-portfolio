<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<GridForm
						menuId="ReasonCode"
						tableId="ReasonClass"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectClass"
					/>
				</template>
				<template v-slot:right>
					<GridForm
						ref="reasonRef"
						:condition="selectedClass"
						:dragging="true"
						menuId="ReasonCode"
						tableId="Reason"
						@create="openModalCreateReason"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="setInformation"
					/>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { REASON_CLASS } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "ReasonCodeForm",
	components: {
		GridForm,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { openModalWarning } = useModalAlert();
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== Reason
		const reasonRef = ref(null);
		const selectedClass = ref({ [REASON_CLASS.ID]: "" });

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectClass({ tableId, columns, row = {} }) {
			selectedClass.value = {
				[REASON_CLASS.ID]: row[REASON_CLASS.ID] ?? "",
			};

			setInformation({ tableId, columns, row });
		}

		/**
		 * @param {Object} config
		 */
		function openModalCreateReason(config) {
			// ReasonClass 미선택시
			if (!selectedClass.value[REASON_CLASS.ID]) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.REASON_CLASS,
				});
				return;
			}

			emit("create", config, selectedClass.value);
		}

		return {
			// Config
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// EnumValue
			reasonRef,
			selectedClass,
			selectClass,
			openModalCreateReason,
		};
	},
};
</script>
<style></style>
