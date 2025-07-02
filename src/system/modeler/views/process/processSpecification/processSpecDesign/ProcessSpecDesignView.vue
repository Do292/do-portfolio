<template>
	<div>
		<ModalClone
			v-if="isShowModalClone"
			:field="PROCESS_SPEC.ID"
			:metaDataId="TABLE.PROCESS_SPEC_CONTENT"
			:sources="cloneSources"
			@apply="cloneData"
			@close="toggleModalClone(false)"
		/>
		<ProcessSpecDesignForm ref="formRef" @clone="openModalClone" />
	</div>
</template>

<script>
import ModalClone from "~/system/modeler/components/common/modal/ModalClone";
import ProcessSpecDesignForm from "~/system/modeler/components/process/processSpecification/processSpecDesign/ProcessSpecDesignForm";

import { ref, reactive } from "vue";
import {
	useModalConfig,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useDefaultFactory } from "~/system/modeler/plugins/composables/modeler-authority";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import * as PROCESS from "~/system/modeler/api/modeler-process.js";
import {
	TABLE,
	CLONE_DTO,
	ACTION,
} from "~/system/modeler/constants/modeler_constants.js";
import { PROCESS_SPEC } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "ProcessSpecDesignView",
	components: {
		ModalClone,
		ProcessSpecDesignForm,
	},
	setup() {
		//==================== Common
		const { ID, VERSION } = PROCESS_SPEC;
		const formRef = ref(null);

		//==================== Clone
		const { isShowModal: isShowModalClone, toggleModal: toggleModalClone } =
			useModalConfig();
		const { openModalConfirmBy } = useModalConfirm();
		const { formatDTO, handleAction, initState } = useUpdateData();
		const { assignDataState, fetchList } = useFetchData();
		const { assignDefaultFactory } = useDefaultFactory();

		// CloneDTO
		const { SOURCE, TARGET, FLAG } = CLONE_DTO;
		const cloneDTO = reactive({ [TARGET]: {}, [SOURCE]: {}, [FLAG]: true });
		const cloneSources = ref([]);

		/**
		 * @param {Object} target processSpec
		 */
		async function openModalClone(target) {
			cloneDTO[TARGET] = target;

			// Source 지정
			const param = assignDataState();
			assignDefaultFactory(param);

			const flows = await fetchList(() =>
				COMMON.getBy(TABLE.PROCESS_SPEC, param),
			);

			cloneSources.value = flows
				.filter(
					({ [ID]: id, [VERSION]: version }) =>
						id !== target[ID] || version !== target[VERSION],
				)
				.map(formRef.value.defineProcessSpec);

			toggleModalClone(true);
		}

		/**
		 * @param {Object} source processSpec
		 */
		function cloneData(source) {
			const { PROCESS_SPEC_CONTENT } = TABLE;
			cloneDTO[SOURCE] = source;

			/**
			 * @param {String} comment
			 */
			const okCloneData = async comment => {
				// clone 후 성공 데이터
				const cloneItems = await handleAction(
					PROCESS_SPEC_CONTENT,
					() =>
						PROCESS.cloneSpecContent(formatDTO(cloneDTO, comment)),
				);

				if (cloneItems.length) {
					initState(PROCESS_SPEC_CONTENT, cloneItems, ACTION.CLONE);
				}
				// ModalClone 닫기
				toggleModalClone(false);
			};

			openModalConfirmBy(
				ACTION.CLONE,
				PROCESS_SPEC_CONTENT,
				[{}],
				okCloneData,
			);
		}

		return {
			// Common
			TABLE,
			PROCESS_SPEC,
			formRef,

			// Clone
			cloneSources,
			isShowModalClone,
			toggleModalClone,
			openModalClone,
			cloneData,
		};
	},
};
</script>
