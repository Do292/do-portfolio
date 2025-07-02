<template>
	<div>
		<ModalCreate
			v-if="isShowModalCreate"
			v-bind="createConfig"
			@close="closeModalCreate"
		/>
		<ModalModify
			v-else-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<NonconformancesForm
			@create="openModalCreate"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import ModalCreate from "~/system/qms/components/common/modal/ModalCreate.vue";
import ModalModify from "~/system/qms/components/common/modal/ModalModify.vue";
import NonconformancesForm from "~/system/qms/components/ocaManagement/nonconformances/NonconformancesForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/plugins/composables/modalHandler";

export default {
	name: "NonconformancesView",
	components: { ModalCreate, ModalModify, NonconformancesForm },
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
		const { openModalDelete } = useModalDelete();

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
			openModalDelete,
		};
	},
};
</script>
<style scoped></style>
