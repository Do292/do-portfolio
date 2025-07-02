<template>
	<div
		:class="{ on: isShowModalSuccess }"
		class="modal-success"
		@click="closeModalSuccess()"
	>
		<span class="spinner">
			<i id="check" class="aimcons_circle-check"></i>
		</span>
		<b>{{ $t("info.applied") }}</b>
		<button @click="closeModalSuccess()">
			<i id="close" class="aimcons_close"></i>
		</button>
	</div>
</template>

<script>
import { onBeforeUnmount } from "vue";
import { useModalSuccess } from "~/plugins/composables/modalHandler";
export default {
	name: "ModalSuccess",
	setup() {
		const { isShowModalSuccess, closeModalSuccess } = useModalSuccess();

		onBeforeUnmount(() => closeModalSuccess());

		return { isShowModalSuccess, closeModalSuccess };
	},
};
</script>

<style scoped></style>
