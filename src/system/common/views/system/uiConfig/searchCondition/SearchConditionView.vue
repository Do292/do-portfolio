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
		<SearchConditionForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		></SearchConditionForm>
	</div>
</template>

<script>
import SearchConditionForm from "#/common/components/system/uiConfig/searchCondition/SearchConditionForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/plugins/composables/modalHandler";

export default {
	name: "SearchConditionView",
	components: {
		SearchConditionForm,
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
