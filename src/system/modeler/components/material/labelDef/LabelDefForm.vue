<template>
	<ModalLabel
		v-if="isShowModalLabel"
		:code="code"
		:variables="variables"
		@close="toggleModalLabel(false)"
	/>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<GridForm
				:customPattern="customPattern"
				menuId="LabelDef"
				tableId="LabelDef"
				@create="$emit('create', $event)"
				@delete="$emit('delete', $event)"
				@modify="$emit('modify', $event)"
				@onRowClick="openModalLabel"
				@onSelectionChanged="setInformation"
			/>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import ModalLabel from "~/system/modeler/components/common/modal/ModalLabel";

import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalConfig } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import { ID } from "~/system/modeler/constants/modeler_constants.js";
import { LABEL } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "LabelDefForm",
	components: {
		GridForm,
		ModalLabel,
	},
	emits: ["create", "modify", "delete"],
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const customPattern = /(labelCode)$/i;

		//==================== Modal
		const { isShowModal: isShowModalLabel, toggleModal: toggleModalLabel } =
			useModalConfig();
		const code = ref("");
		const variables = ref([]);

		function openModalLabel({ column, rowData }) {
			if (column[ID.FIELD] === LABEL.CODE) {
				code.value = rowData[LABEL.CODE];
				variables.value = rowData[LABEL.VARIABLE_LIST]?.split(",");

				toggleModalLabel(true);
			}
		}

		return {
			// Config
			isShowInformation,
			infoConfig,
			setInformation,
			customPattern,

			// Modal
			code,
			variables,
			isShowModalLabel,
			toggleModalLabel,
			openModalLabel,
		};
	},
};
</script>
<style scoped>
/* LabelCode */
:deep(tr .labelcode:hover) {
	text-decoration: underline;
	cursor: pointer;
}
:deep(tr .labelcode) {
	font-weight: 500 !important;
}
:deep(tr .labelcode:hover::before) {
	opacity: 1;
}
:deep(tr .labelcode::before) {
	font-family: aimcons;
	content: "\e99c";
	color: #175388 !important;
	position: relative;
	left: -3px;
	top: 1px;
	font-weight: 600;
	opacity: 0.8;
	padding-right: 6px;
}
</style>
