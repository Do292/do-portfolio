<template>
	<ButtonText
		:disabled="disabled"
		:type="SETTING"
		@onClick="toggleModalAddUser"
	/>
	<ModalAddUser
		v-if="isShowModalAddUser"
		:steps="steps"
		:userMap="userMap"
		@apply="applyUserMap"
		@close="toggleModalAddUser(false)"
	/>
</template>

<script>
import ModalAddUser from "~/system/qms/components/common/modal/ModalAddUser";

import { useModalConfig } from "~/plugins/composables/modalHandler";
import { useButton } from "~/plugins/composables/uiControl";

import { ACTION } from "~/plugins/wfb-constants.js";

export default {
	name: "ButtonApprovalRoute",
	components: { ModalAddUser },
	props: {
		// Config
		steps: { type: Array },
		userMap: { type: Object },

		// disabled force
		disabled: { type: Boolean, default: false },
	},
	emits: ["apply"],
	setup(props, { emit }) {
		//==================== Config
		const { SETTING } = ACTION;
		const { iconClass } = useButton(SETTING);

		//==================== Modal
		const {
			isShowModal: isShowModalAddUser,
			toggleModal: toggleModalAddUser,
		} = useModalConfig();

		function applyUserMap(userMapByStep) {
			emit("apply", userMapByStep);
			toggleModalAddUser(false);
		}

		return {
			// Config
			SETTING,
			iconClass,

			// Modal
			isShowModalAddUser,
			toggleModalAddUser,
			applyUserMap,
		};
	},
};
</script>

<style scoped></style>
