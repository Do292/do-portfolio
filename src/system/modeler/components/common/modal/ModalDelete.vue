<template>
	<ModalConfirm>
		<template v-slot:icon>
			<i class="icons aimcons_delete1_cancle text-info"></i>
		</template>
		<template v-slot:label>
			<label>
				{{
					$t("modal.confirm.delete", {
						count,
						name: tableId,
					})
				}}
			</label>
		</template>
	</ModalConfirm>
</template>

<script>
import ModalConfirm from "~/system/modeler/components/common/modal/ModalConfirm";

import { useModalConfirm } from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "ModalDelete",
	components: { ModalConfirm },
	props: {
		tableId: { type: String },
		items: { type: Array },
	},
	setup(props) {
		const { count, initConfirmState } = useModalConfirm("delete");

		initConfirmState(props.items);

		return { count };
	},
};
</script>

<style scoped></style>
