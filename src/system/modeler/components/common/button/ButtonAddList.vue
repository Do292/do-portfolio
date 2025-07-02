<template>
	<button
		v-if="isVisible"
		:disabled="isDisabled"
		class="btn btn-md btn-default text-green"
		@click="toggleModalAddList()"
	>
		<i :class="iconClass"></i>
	</button>
	<ModalAddList
		v-if="isShowModalAddList"
		:gridId="targetId"
		:items="items"
		@apply="applyAddList"
		@close="toggleModalAddList(false)"
	/>
</template>

<script>
import ModalAddList from "~/system/modeler/components/common/modal/ModalAddList";

import { computed } from "vue";
import {
	useModalConfig,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useButton } from "~/system/modeler/plugins/composables/modeler-uiControl";

import { ACTION } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "ButtonAddList",
	components: { ModalAddList },
	props: {
		// Config
		tableId: { type: String },
		gridId: { type: String },
		items: { type: Array },
	},
	emits: ["apply"],
	setup(props, { emit }) {
		//==================== Config
		const { ADD_LIST, CREATE } = ACTION;
		const { isVisible, isDisabled } = useButton(CREATE, true);
		const { iconClass } = useButton(ADD_LIST);

		//==================== Modal
		const {
			isShowModal: isShowModalAddList,
			toggleModal: toggleModalAddList,
		} = useModalConfig();

		const targetId = computed(() => props.gridId ?? props.tableId);
		const { openModalConfirmBy } = useModalConfirm();

		/**
		 * Check된 데이터를 기준으로 Confirm 모달을 활성화. 이후 로직은 버튼의 상위컴포넌트에서 정의
		 */
		function applyAddList(items) {
			openModalConfirmBy(ACTION.CREATE, props.tableId, items, comment => {
				emit("apply", items, comment);
				toggleModalAddList(false);
			});
		}

		return {
			// Config
			isVisible,
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

<style scoped>
button {
	width: 35px;
}
button i {
	position: absolute;
	font-size: 20px;
	top: -1.5px;
	left: 8px;
}
</style>
