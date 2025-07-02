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
			:field="RECIPE_ID"
			:metaDataId="RECIPE_PARAMETER"
			:sources="cloneSources"
			@apply="cloneItem"
			@close="toggleModalClone(false)"
		/>
		<RecipeParameterForm
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
import RecipeParameterForm from "~/system/modeler/components/factory/recipeConfig/recipeParameter/RecipeParameterForm";

import { ref, reactive } from "vue";
import {
	useModalConfig,
	useModalCreate,
	useModalModify,
	useModalDelete,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import {
	CLONE_DTO,
	ACTION,
} from "~/system/modeler/constants/modeler_constants.js";
import {
	RECIPE_TABLE,
	RECIPE_ID_CONFIG,
	RECIPE_TYPE,
} from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "RecipeParameterView",
	components: {
		CreateForm,
		ModifyForm,
		RecipeParameterForm,
		ModalClone,
	},
	setup() {
		//==================== Common
		const {
			RECIPE_GROUP_ID,
			RECIPE_ID,
			RECIPE_TYPE: TYPE,
		} = RECIPE_ID_CONFIG;
		const { RECIPE, RECIPE_PARAMETER } = RECIPE_TABLE;
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
		const { filterItem } = useItem();

		// CloneDTO
		const cloneDTO = reactive({ [TARGET]: {}, [SOURCE]: {}, [FLAG]: true });
		const cloneSources = ref([]);

		async function openModalClone(target) {
			cloneDTO[TARGET] = target;

			// Source 지정
			const param = assignDataState({ [TYPE]: RECIPE_TYPE.EQUIPMENT });
			const recipes = await fetchList(() => COMMON.getBy(RECIPE, param));

			cloneSources.value = recipes
				.filter(recipe => recipe[RECIPE_ID] !== target[RECIPE_ID])
				.map(recipe =>
					filterItem(recipe, [RECIPE_GROUP_ID, RECIPE_ID]),
				);

			toggleModalClone(true);
		}

		/**
		 * @todo 서버 API 확인 후 코드 전면 수정 필요!!!
		 */
		function cloneItem(source) {
			cloneDTO[SOURCE] = source;

			openModalConfirmBy(
				ACTION.CLONE,
				RECIPE_PARAMETER,
				[{}],
				async comment => {
					const cloneItems = await handleAction(
						RECIPE_PARAMETER,
						() =>
							COMMON.clone(
								RECIPE_PARAMETER,
								formatDTO(cloneDTO, comment),
							),
					);
					if (cloneItems.length) {
						initState(RECIPE_PARAMETER, cloneItems, ACTION.CLONE);
					}
					// ModalClone 닫기
					toggleModalClone(false);
				},
			);
		}

		return {
			// Common
			RECIPE_PARAMETER,
			RECIPE_ID,

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
			cloneSources,
			isShowModalClone,
			toggleModalClone,
			openModalClone,
			cloneItem,
		};
	},
};
</script>
