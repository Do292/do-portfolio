<template>
	<div>
		<CreateForm
			v-if="isShowModalCreate"
			ref="createRef"
			v-bind="createConfig"
			@close="closeModalCreate"
		/>
		<ModifyForm
			v-else-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<LabelDefForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import LabelDefForm from "~/system/modeler/components/material/labelDef/LabelDefForm";

import { ref, watch } from "vue";
import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useFieldColumn } from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { LABEL } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "LabelDefView",
	components: {
		CreateForm,
		ModifyForm,
		LabelDefForm,
	},
	setup() {
		//==================== Modal Create
		const {
			isShowModalCreate,
			createConfig,
			openModalCreateAndSetReadOnly,
			closeModalCreate,
		} = useModalCreate();
		const createRef = ref(null);

		// VariableList Customization
		const { CODE, VARIABLE_LIST, QUERY, DEPENDENCY } = LABEL;
		const { defineDependency } = useFieldColumn();

		/**
		 * @param {String} code
		 * @returns {String}
		 */
		function getVariables(code) {
			const pattern = /{([^}]+)}/g;
			const variables = code
				.match(pattern)
				?.map(target => target.slice(1, -1));
			return variables?.join();
		}

		watch(
			() => createRef.value?.newItem[CODE],
			code => {
				if (code) {
					createRef.value.newItem[VARIABLE_LIST] = getVariables(code);
				}
			},
		);

		watch(
			() => createRef.value?.newItem[QUERY],
			query => {
				if (query) {
					createRef.value.newItem[DEPENDENCY] =
						defineDependency(query);
				}
			},
		);

		watch(
			() => createRef.value?.gridItems,
			(items = []) => {
				for (const item of items) {
					item[VARIABLE_LIST] = getVariables(item[CODE]);
					item[DEPENDENCY] = defineDependency(item[QUERY]);
				}
			},
		);

		//==================== Modal Modify
		const {
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,
		} = useModalModify();

		//==================== Modal Delete
		const { openModalDelete } = useModalDelete();

		return {
			// Create
			createRef,
			isShowModalCreate,
			createConfig,
			openModalCreateAndSetReadOnly,
			closeModalCreate,

			// Modify
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,

			// Delete
			openModalDelete,
		};
	},
};
</script>
