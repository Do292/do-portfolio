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
		<ModalClone
			v-else-if="isShowModalClone"
			:field="DC_ITEM.EQUIPMENT_ID"
			:metaDataId="TABLE.DC_ITEM"
			:sources="cloneSources"
			@apply="cloneItem"
			@close="toggleModalClone(false)"
		/>
		<DCItemForm
			ref="formRef"
			@clone="openModalClone"
			@create="openModalCreateAndSetReadOnly"
			@delete="openModalDelete"
			@modify="openModalModify"
		/>
	</div>
</template>

<script>
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import ModalClone from "~/system/modeler/components/common/modal/ModalClone";
import DCItemForm from "~/system/modeler/components/dc/dcitem/DCItemForm";

import { ref, reactive } from "vue";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useModalConfig,
	useModalCreate,
	useModalModify,
	useModalDelete,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useDefaultFactory } from "~/system/modeler/plugins/composables/modeler-authority";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import {
	TABLE,
	CLONE_DTO,
	ACTION,
} from "~/system/modeler/constants/modeler_constants.js";
import { DC_ITEM } from "~/system/modeler/constants/table_constants.js";
import { EQUIPMENT_CONDITION } from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "DCItemView",
	components: {
		ModalClone,
		CreateForm,
		ModifyForm,
		DCItemForm,
	},
	setup() {
		//==================== Common
		const formRef = ref(null);
		const { EQUIPMENT_ID } = DC_ITEM;
		const { SOURCE, TARGET, FLAG } = CLONE_DTO;

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

		//==================== Clone
		const { isShowModal: isShowModalClone, toggleModal: toggleModalClone } =
			useModalConfig();
		const { openModalConfirmBy } = useModalConfirm();
		const { formatDTO, handleAction, initState } = useUpdateData();
		const { assignDataState, fetchList } = useFetchData();
		const { assignDefaultFactory } = useDefaultFactory();
		const { filterItem } = useItem();

		// CloneDTO
		const cloneDTO = reactive({ [TARGET]: {}, [SOURCE]: {}, [FLAG]: true });
		const cloneSources = ref([]);

		async function openModalClone(target) {
			cloneDTO[TARGET] = target;

			// Source 지정
			const param = assignDataState();
			assignDefaultFactory(param);

			const equipments = await fetchList(() =>
				COMMON.getBy(TABLE.EQUIPMENT_DEF, param),
			);

			cloneSources.value = equipments
				.filter(
					equipment =>
						equipment[EQUIPMENT_ID] !== target[EQUIPMENT_ID],
				)
				.map(equipment =>
					filterItem(equipment, Object.values(EQUIPMENT_CONDITION)),
				);

			toggleModalClone(true);
		}

		/**
		 * @todo 서버 API 확인 후 코드 전면 수정 필요!!!
		 */
		function cloneItem(source) {
			const { DC_ITEM } = TABLE;
			cloneDTO[SOURCE] = formRef.value.defineEquipment(source);

			openModalConfirmBy(ACTION.CLONE, DC_ITEM, [{}], async comment => {
				const cloneItems = await handleAction(DC_ITEM, () =>
					COMMON.clone(DC_ITEM, formatDTO(cloneDTO, comment)),
				);
				if (cloneItems.length) {
					initState(DC_ITEM, cloneItems, ACTION.CLONE);
				}
				// ModalClone 닫기
				toggleModalClone(false);
			});
		}

		return {
			// Common
			formRef,

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

			// Clone
			TABLE,
			DC_ITEM,
			cloneSources,
			isShowModalClone,
			toggleModalClone,
			openModalClone,
			cloneItem,
		};
	},
};
</script>
