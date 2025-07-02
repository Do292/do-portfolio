<template>
	<ModalImage
		v-if="isShowModalImage"
		:imageData="imageData"
		@apply="applyImage"
		@close="toggleModalImage(false)"
	/>
	<div class="btn btn-sm btn-edit-image" @click="selectImage">
		<i class="aim aimcons_modify"></i>
	</div>
	<input ref="inputRef" type="file" @change="loadImage" />
</template>

<script>
import ModalImage from "~/system/modeler/components/common/modal/ModalImage";

import { ref } from "vue";
import {
	useModalConfig,
	useModalAlert,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "ButtonImage",
	components: {
		ModalImage,
	},
	emits: ["apply"],
	setup(_, { emit }) {
		//==================== Image
		const inputRef = ref(null);
		const imageData = ref("");

		function selectImage() {
			inputRef.value.click();
		}

		function loadImage({ target }) {
			const graphicPattern = /\.(png|jpg|jpeg|svg)$/i;
			const file = target.files[0];

			if (!graphicPattern.test(file.name)) {
				openModalWarning("PNG, JPEG, SVG 파일만 가능합니다.");
				return;
			}

			const reader = new FileReader();
			reader.onload = ({ target: { result } }) => {
				imageData.value = result;
				toggleModalImage(true);
			};
			reader.readAsDataURL(file);

			target.value = "";
		}

		function applyImage(imageData) {
			toggleModalImage(false);

			const canvas = document.createElement("canvas");
			canvas.width = imageData.width;
			canvas.height = imageData.height;

			const ctx = canvas.getContext("2d");
			ctx.putImageData(imageData, 0, 0);

			const dataURL = canvas.toDataURL();
			const base64 = dataURL.split(",")[1];
			emit("apply", base64);
		}

		//==================== Modal
		const { isShowModal: isShowModalImage, toggleModal: toggleModalImage } =
			useModalConfig();
		const { openModalWarning } = useModalAlert();

		return {
			// Image
			inputRef,
			imageData,
			selectImage,
			loadImage,
			applyImage,

			// Modal
			isShowModalImage,
			toggleModalImage,
		};
	},
};
</script>

<style scoped>
.btn-edit-image + input {
	display: none;
}
</style>
