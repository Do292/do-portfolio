<template>
	<div>
		<ModalClone
			v-if="isShowModalClone"
			:field="FLOW_ID"
			:metaDataId="TABLE.PROCESS_FLOW_CONTENT"
			:sources="cloneSources"
			@apply="cloneData"
			@close="toggleModalClone(false)"
		/>
		<FlowDesignerForm
			ref="formRef"
			@clone="openModalClone"
			@delete="openModalDelete"
		/>
	</div>
</template>

<script>
import ModalClone from "~/system/modeler/components/common/modal/ModalClone";
import FlowDesignerForm from "~/system/modeler/components/process/processDesign/flowDesigner/FlowDesignerForm";

import { ref, reactive } from "vue";
import {
	useModalConfig,
	useModalConfirm,
	useModalDelete,
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
import { PROCESS_FLOW } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "FlowDesignerView",
	components: { ModalClone, FlowDesignerForm },
	setup() {
		//==================== Common
		const { ID: FLOW_ID } = PROCESS_FLOW;
		const formRef = ref(null);

		// Delete
		const { openModalDelete } = useModalDelete();

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
		 * @param {Object} target processFlow
		 */
		async function openModalClone(target) {
			cloneDTO[TARGET] = target;

			// Source 지정
			const param = assignDataState();
			assignDefaultFactory(param);

			const flows = await fetchList(() =>
				COMMON.getBy(TABLE.PROCESS_FLOW, param),
			);

			cloneSources.value = flows
				.filter(({ [FLOW_ID]: id }) => id !== target[FLOW_ID])
				.map(formRef.value.defineProcessFlow);

			toggleModalClone(true);
		}

		/**
		 * @param {Object} source processFlow
		 */
		function cloneData(source) {
			const { PROCESS_FLOW_CONTENT } = TABLE;
			cloneDTO[SOURCE] = source;

			/**
			 * @param {String} comment
			 */
			const okCloneData = async comment => {
				// clone 후 성공 데이터
				const cloneItems = await handleAction(
					PROCESS_FLOW_CONTENT,
					() =>
						PROCESS.cloneFlowContent(formatDTO(cloneDTO, comment)),
				);

				if (cloneItems.length) {
					initState(PROCESS_FLOW_CONTENT, cloneItems, ACTION.CLONE);
				}
				// ModalClone 닫기
				toggleModalClone(false);
			};

			openModalConfirmBy(
				ACTION.CLONE,
				PROCESS_FLOW_CONTENT,
				[{}],
				okCloneData,
			);
		}

		return {
			// Common
			TABLE,
			FLOW_ID,
			formRef,

			// Delete
			openModalDelete,

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
