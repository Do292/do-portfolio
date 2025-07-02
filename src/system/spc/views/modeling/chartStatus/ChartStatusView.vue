<template>
	<div>
		<FormCreate
			v-if="isShowModalCreate"
			:compareKeyValueFlag="true"
			:excludeKeyList="['chartConditionSeq']"
			v-bind="createConfig"
			@close="closeModalCreate"
		/>
		<FormModify
			v-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<ChartStatusForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import ChartStatusForm from "#/spc/components/modeling/chartStatus/ChartStatusForm.vue";
import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/plugins/composables/modalHandler";

export default {
	name: "ChartStatusView",
	components: { ChartStatusForm },
	setup() {
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
<style scoped></style>
