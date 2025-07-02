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
		<CustomerComplaintsForm
			@create="openModalCreate"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import ModalCreate from "~/system/qms/components/common/modal/ModalCreate.vue";
import ModalModify from "~/system/qms/components/common/modal/ModalModify.vue";
import CustomerComplaintsForm from "~/system/qms/components/customerQuality/customerComplaints/CustomerComplaintsForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/plugins/composables/modalHandler";

export default {
	name: "CustomerComplaintsView",
	components: { ModalCreate, ModalModify, CustomerComplaintsForm },
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
