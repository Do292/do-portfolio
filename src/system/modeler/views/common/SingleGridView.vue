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
		<div :class="{ infor: isShowInformation }" class="card">
			<div class="card-body">
				<GridForm
					ref="gridRef"
					:menuId="tableId"
					:tableId="tableId"
					@create="openModalCreate"
					@delete="openModalDelete"
					@modify="openModalModify"
					@onSelectionChanged="setInformation"
				/>
			</div>
			<FormInformation :config="infoConfig" />
		</div>
	</div>
</template>

<script>
// Default
import GridForm from "~/system/modeler/components/common/form/GridForm";
// Modal Form
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "SingleGridView",
	components: {
		// Default
		GridForm,
		// Modal Form
		CreateForm,
		ModifyForm,
	},
	props: {
		tableId: { type: String },
	},
	setup() {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const gridRef = ref(null);

		//==================== Create
		const {
			isShowModalCreate,
			createConfig,
			openModalCreate,
			closeModalCreate,
		} = useModalCreate();

		//==================== Modify
		const {
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,
		} = useModalModify();

		//==================== Delete
		const { openModalDelete } = useModalDelete();

		return {
			// Information
			isShowInformation,
			infoConfig,
			setInformation,
			gridRef,

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
<style></style>
