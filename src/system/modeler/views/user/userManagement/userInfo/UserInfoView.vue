<template>
	<div>
		<CreateForm
			v-if="isShowModalCreate"
			v-bind="createConfig"
			:shouldDelegate="true"
			@close="closeModalCreate"
			@create="openModalConfirmAndCreate"
		/>
		<ModifyForm
			v-else-if="isShowModalModify"
			v-bind="modifyConfig"
			@close="closeModalModify"
		/>
		<div :class="{ infor: isShowInformation }" class="card">
			<div class="card-body">
				<GridForm
					:menuId="USER_INFO"
					:needsDefaultFactory="false"
					:tableId="USER_INFO"
					@create="openModalCreateUser"
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
import CreateForm from "~/system/modeler/components/common/form/CreateForm";
import ModifyForm from "~/system/modeler/components/common/form/ModifyForm";
import GridForm from "~/system/modeler/components/common/form/GridForm";

import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useModalCreate,
	useModalModify,
	useModalDelete,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useEncryt } from "~/system/modeler/plugins/composables/modeler-authority";
import { useUpdateData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";

import * as USER_SETTING from "~/system/modeler/api/user.js";
import { TABLE, USER } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "UserInfoView",
	components: {
		CreateForm,
		ModifyForm,
		GridForm,
	},
	setup() {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { executeWithSpinner } = useSpinner();
		const { USER_INFO } = TABLE;
		const { PASSWORD, IMAGE } = USER;

		//==================== Modal
		// Create
		const {
			isShowModalCreate,
			createConfig,
			openModalCreateAndSetReadOnly,
			closeModalCreate,
		} = useModalCreate();

		/**
		 * @param {Object} config
		 * @param {String} tableId
		 * @param {Object[]} items
		 */
		function openModalCreateUser({ tableId, items }) {
			const config = {
				tableId,
				items: items.map(item => ({ ...item, [PASSWORD]: "" })),
			};

			openModalCreateAndSetReadOnly(config, { [IMAGE]: "" });
		}

		// Confirm
		const { openModalConfirmBy } = useModalConfirm();
		const { encryptValue } = useEncryt();
		const { ACTION, initState, handleAction, formatDTO } = useUpdateData();

		/**
		 * @param {Object[]} dataList
		 */
		function openModalConfirmAndCreate(dataList) {
			dataList.forEach(item => {
				item[PASSWORD] = encryptValue(item[PASSWORD]);
			});

			// Confirm Apply시, 함수 매핑
			const executeData = comment =>
				executeWithSpinner(async () => {
					const items = await handleAction(USER_INFO, () =>
						USER_SETTING[ACTION.CREATE](
							formatDTO({ dataList }, comment),
						),
					);
					if (items.length) {
						initState(USER_INFO, items, ACTION.CREATE);
						closeModalCreate();
					}
				});

			openModalConfirmBy(ACTION.CREATE, USER_INFO, dataList, executeData);
		}

		// Modify
		const {
			isShowModalModify,
			modifyConfig,
			openModalModify,
			closeModalModify,
		} = useModalModify();

		// Delete
		const { openModalDelete } = useModalDelete();

		return {
			// Information
			USER_INFO,
			isShowInformation,
			infoConfig,
			setInformation,

			// Create
			isShowModalCreate,
			createConfig,
			openModalCreateUser,
			closeModalCreate,
			openModalConfirmAndCreate,

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
