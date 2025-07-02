<template>
	<div>
		<CreateForm
			v-if="isShowModalCreate"
			ref="createRef"
			v-bind="createConfig"
			:customPosition="ID_RULE.POSITION"
			@close="closeModalCreate"
		/>
		<ModifyForm
			v-else-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<IdRuleDefForm
			ref="formRef"
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import IdRuleDefForm from "~/system/modeler/components/admin/systemConfig/idRuleDef/IdRuleDefForm";

import { ref, watch } from "vue";
import {
	useModalCreate,
	useModalModify,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { ID_RULE } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "IdRuleDefView",
	components: {
		CreateForm,
		ModifyForm,
		IdRuleDefForm,
	},
	setup() {
		//==================== Config
		const formRef = ref(null);

		//==================== Create
		const {
			isShowModalCreate,
			createConfig,
			openModalCreateAndSetReadOnly,
			closeModalCreate,
		} = useModalCreate();
		const createRef = ref(null);

		// Length Customization
		watch(
			() => createRef.value?.newItem[ID_RULE.SECTION_LENGTH],
			length => {
				const { maxLength } = formRef.value;
				// 최대 크기를 초과할 수 없다.
				if (length > maxLength) {
					createRef.value.newItem[ID_RULE.SECTION_LENGTH] = maxLength;
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

		const { openModalDelete } = useModalDelete();

		return {
			// Config
			ID_RULE,
			formRef,

			// Create
			isShowModalCreate,
			createConfig,
			createRef,
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
