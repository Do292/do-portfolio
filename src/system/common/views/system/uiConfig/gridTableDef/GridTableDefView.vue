<template>
	<div>
		<FormCreate
			v-if="isShowModalCreate"
			v-bind="createConfig"
			@close="closeModalCreate"
		/>
		<FormModify
			v-else-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<GridTableDefForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import GridTableDefForm from "#/common/components/system/uiConfig/gridTableDef/GridTableDefForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/plugins/composables/modalHandler";

export default {
	name: "GridTableDefView",
	components: { GridTableDefForm },
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
<style></style>
