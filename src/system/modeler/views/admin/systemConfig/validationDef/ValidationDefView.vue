<template>
	<div>
		<CreateForm
			v-if="isShowModalCreate"
			v-bind="createConfig"
			@close="closeModalCreate"
		/>
		<ModifyForm
			v-else-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<ValidationDefForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import ValidationDefForm from "~/system/modeler/components/admin/systemConfig/validationDef/ValidationDefForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "ValidationDefView",
	components: {
		CreateForm,
		ModifyForm,
		ValidationDefForm,
	},
	setup() {
		//==================== Modal
		const {
			isShowModalCreate,
			createConfig,
			openModalCreateAndSetReadOnly,
			closeModalCreate,
		} = useModalCreate();
		const {
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,
		} = useModalModify();
		const { openModalDelete } = useModalDelete();

		return {
			// Create
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
