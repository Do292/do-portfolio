<template>
	<div>
		<CreateForm
			v-if="isShowModalCreate"
			ref="createRef"
			v-bind="createConfig"
			:customPosition="POSITION"
			@close="closeModalCreate"
		/>
		<ModifyForm
			v-else-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<MenuForm
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import MenuForm from "~/system/modeler/components/user/menuConfig/menu/MenuForm";

import { ref, watch } from "vue";
import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useNaming } from "~/system/modeler/plugins/composables/modeler-locale";
import { MENU } from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "MenuView",
	components: {
		CreateForm,
		ModifyForm,
		MenuForm,
	},
	setup() {
		//==================== Create
		const {
			isShowModalCreate,
			createConfig,
			openModalCreateAndSetReadOnly,
			closeModalCreate,
		} = useModalCreate();
		const createRef = ref(null);

		const { ID, PATH, POSITION } = MENU;
		const { pascalToCamel } = useNaming();

		// View Id Customization
		watch(
			() => createRef.value?.newItem[ID],
			id => {
				if (id) {
					const { [PATH]: path } = createConfig.readOnlyConfig;
					createRef.value.newItem[PATH] = path + pascalToCamel(id);
				}
			},
		);

		watch(
			() => createRef.value?.gridItems,
			(items = []) => {
				for (const item of items) {
					const { [PATH]: path } = createConfig.readOnlyConfig;
					if (item[PATH] === path) {
						item[PATH] = path + pascalToCamel(item[ID]);
					}
				}
			},
		);

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
			// Create
			POSITION,
			createRef,
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
