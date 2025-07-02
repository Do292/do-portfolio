<template>
	<button
		:disabled="isDisabled || disabled"
		class="btn btn-md btn-default text-green"
		width="'35px'"
		@click="toggleModalAddList()"
	>
		<i :class="iconClass" class="button-add-list"></i>
	</button>
	<ModalAddList
		v-if="isShowModalAddList"
		:gridId="targetId"
		:items="items"
		:metaDataId="metaDataId"
		@apply="applyAddList"
		@close="toggleModalAddList(false)"
	/>
</template>

<script>
import ModalAddList from "~/components/common/modal/ModalAddList";

import { computed } from "vue";
import {
	useModalConfig,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";
import { useButton } from "~/plugins/composables/uiControl";

import { ACTION } from "~/plugins/wfb-constants.js";

export default {
	name: "ButtonAddList",
	components: { ModalAddList },
	props: {
		// Config
		metaDataId: { type: String },
		gridId: { type: String },
		items: { type: Array },

		// disabled force
		disabled: { type: Boolean, default: false },

		// Confirm 모달 활성화 여부
		shouldConfirm: { type: Boolean, default: true },
	},
	emits: ["apply"],
	setup(props, { emit }) {
		//==================== Config
		const { ADD_LIST, CREATE } = ACTION;
		const { isDisabled } = useButton(CREATE);
		const { iconClass } = useButton(ADD_LIST);

		//==================== Modal
		const {
			isShowModal: isShowModalAddList,
			toggleModal: toggleModalAddList,
		} = useModalConfig();

		const targetId = computed(() => props.gridId ?? props.metaDataId);
		const { openModalConfirmBy } = useModalConfirm();

		/**
		 * Check된 데이터를 기준으로 Confirm 모달을 활성화. 이후 로직은 버튼의 상위컴포넌트에서 정의
		 */
		function applyAddList(items) {
			const { metaDataId, shouldConfirm } = props;
			const applyAndClose = comment => {
				emit("apply", items, comment);
				toggleModalAddList(false);
			};

			// confirm하지 않으면 바로 전송함.
			if (!shouldConfirm) {
				return applyAndClose();
			}
			openModalConfirmBy(ACTION.CREATE, metaDataId, items, applyAndClose);
		}

		return {
			// Config
			isDisabled,
			iconClass,

			// Modal
			targetId,
			isShowModalAddList,
			toggleModalAddList,
			applyAddList,
		};
	},
};
</script>

<style scoped></style>
