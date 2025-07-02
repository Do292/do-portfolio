<template>
	<ButtonSimple
		:disabled="isDisabled"
		type="setting"
		@onClick="toggleModalQueryBuilder()"
	/>
	<ModalQueryBuilder
		v-if="isShowModalQueryBuilder"
		:dependency="dependency"
		@apply="applyQueryBuilder"
		@close="toggleModalQueryBuilder(false)"
	/>
</template>

<script>
import ButtonSimple from "~/system/modeler/components/common/button/ButtonSimple";
import ModalQueryBuilder from "~/system/modeler/components/common/modal/ModalQueryBuilder";

import { useModalConfig } from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "ButtonQuery",
	components: { ButtonSimple, ModalQueryBuilder },
	props: {
		dependency: { type: String },
		isDisabled: { type: Boolean, default: false },
	},
	emits: ["apply"],
	setup(_, { emit }) {
		//==================== Modal
		const {
			isShowModal: isShowModalQueryBuilder,
			toggleModal: toggleModalQueryBuilder,
		} = useModalConfig();

		/**
		 * @param {String} query
		 */
		function applyQueryBuilder(query) {
			emit("apply", query);
			toggleModalQueryBuilder(false);
		}

		return {
			// Modal
			isShowModalQueryBuilder,
			toggleModalQueryBuilder,
			applyQueryBuilder,
		};
	},
};
</script>

<style scoped></style>
