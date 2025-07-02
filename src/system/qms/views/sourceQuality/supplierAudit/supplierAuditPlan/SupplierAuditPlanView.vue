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
		<SupplierAuditPlanForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import SupplierAuditPlanForm from "~/system/qms/components/sourceQuality/supplierAudit/supplierAuditPlan/SupplierAuditPlanForm";

import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/plugins/composables/modalHandler";

export default {
	name: "SupplierAuditPlanView",
	components: { SupplierAuditPlanForm },
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
