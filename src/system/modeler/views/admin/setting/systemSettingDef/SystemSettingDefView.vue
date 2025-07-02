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
		<SystemSettingDefForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import SystemSettingDefForm from "~/system/modeler/components/admin/setting/systemSettingDef/SystemSettingDefForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "SystemSettingDefView",
	components: {
		CreateForm,
		ModifyForm,
		SystemSettingDefForm,
	},
	setup() {
		//==================== Modal Create
		const {
			isShowModalCreate,
			createConfig,
			openModalCreateAndSetReadOnly,
			closeModalCreate,
		} = useModalCreate();

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
