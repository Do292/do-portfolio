<template>
	<div>
		<CreateForm
			v-if="isShowModalCreate"
			ref="createRef"
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
			:field="DC_DEF.ID"
			:metaDataId="TABLE.DC_DEF"
			:sources="cloneSources"
			@apply="cloneData"
			@close="toggleModalClone(false)"
		/>
		<DCDefForm
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
import DCDefForm from "~/system/modeler/components/dc/dcdef/DCDefForm";

import { ref, reactive, watch } from "vue";
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
import * as DC from "~/system/modeler/api/modeler-dc.js";
import {
	TABLE,
	CLONE_DTO,
	ACTION,
} from "~/system/modeler/constants/modeler_constants.js";
import {
	DC_DEF,
	DC_DEF_ITEM,
} from "~/system/modeler/constants/table_constants.js";

export default {
	name: "DCDefView",
	components: {
		CreateForm,
		ModifyForm,
		ModalClone,
		DCDefForm,
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

		// Site Ids Customization
		const { SITE_COUNT, SITE_IDS } = DC_DEF_ITEM;
		watch(
			() => createRef.value?.newItem[SITE_COUNT],
			count => {
				if (count) {
					createRef.value.newItem[SITE_IDS] = generateSiteIds(+count);
				}
			},
		);

		watch(
			() => createRef.value?.gridItems,
			(items = []) => {
				for (const item of items) {
					const { [SITE_COUNT]: count } = createConfig.readOnlyConfig;
					if (item[SITE_COUNT] === count) {
						item[SITE_IDS] = generateSiteIds(+count);
					}
				}
			},
		);

		/**
		 * count에 따른 SiteIds 생성
		 * @param {Number} count
		 * @return {String}
		 */
		function generateSiteIds(count) {
			const siteNameList = [];
			for (let i = 0; i < count; i++) {
				siteNameList.push(`S${String(i + 1).padStart(2, "0")}`);
			}
			return siteNameList.join("^");
		}

		//==================== Modify
		const {
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,
		} = useModalModify();

		//==================== Delete
		const { openModalDelete } = useModalDelete();

		//==================== Clone
		const { isShowModal: isShowModalClone, toggleModal: toggleModalClone } =
			useModalConfig();
		const { openModalConfirmBy } = useModalConfirm();
		const { formatDTO, handleAction, initState } = useUpdateData();
		const { assignDataState, fetchList } = useFetchData();
		const { filterItem } = useItem();

		// CloneDTO
		const { SOURCE, TARGET, FLAG } = CLONE_DTO;
		const cloneDTO = reactive({ [TARGET]: {}, [SOURCE]: {}, [FLAG]: true });
		const cloneSources = ref([]);

		async function openModalClone(target) {
			cloneDTO[TARGET] = target;

			// Source 지정
			const defs = await fetchList(() =>
				COMMON.getBy(TABLE.DC_DEF, assignDataState()),
			);

			cloneSources.value = defs
				.filter(def => def[DC_DEF.ID] !== target[DC_DEF.ID])
				.map(def => filterItem(def, Object.values(DC_DEF)));

			toggleModalClone(true);
		}

		/**
		 * @todo 서버 API 확인 후 코드 전면 수정 필요!!!
		 */
		function cloneData(source) {
			cloneDTO[SOURCE] = filterItem(source, [DC_DEF.ID]);

			openModalConfirmBy(
				ACTION.CLONE,
				TABLE.DC_DEF,
				[{}],
				async comment => {
					const cloneDatas = await handleAction(TABLE.DC_DEF, () =>
						DC.cloneDCDefAll(formatDTO(cloneDTO, comment)),
					);
					if (cloneDatas.length) {
						initState(TABLE.DC_DEF, cloneDatas, ACTION.CLONE);
					}
					// ModalClone 닫기
					toggleModalClone(false);
				},
			);
		}
		return {
			// Create
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

			// Clone
			TABLE,
			DC_DEF,
			cloneSources,
			isShowModalClone,
			toggleModalClone,
			openModalClone,
			cloneData,
		};
	},
};
</script>
