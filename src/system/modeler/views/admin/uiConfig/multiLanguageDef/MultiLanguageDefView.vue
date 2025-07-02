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
		<MultiLanguageDefForm
			@create="openModalCreate"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import MultiLanguageDefForm from "~/system/modeler/components/admin/uiConfig/multiLanguageDef/MultiLanguageDefForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "MultiLanguageDefView",
	components: {
		MultiLanguageDefForm,
		CreateForm,
		ModifyForm,
	},
	setup() {
		//==================== Modal
		const {
			isShowModalCreate,
			createConfig,
			openModalCreate,
			closeModalCreate,
		} = useModalCreate();
		const {
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,
		} = useModalModify();
		const { isShowModalDelete, openModalDelete } = useModalDelete();

		return {
			// Create
			isShowModalCreate,
			createConfig,
			openModalCreate,
			closeModalCreate,

			// Modify
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,

			// Delete
			isShowModalDelete,
			openModalDelete,
		};
	},
};
</script>
<style></style>
