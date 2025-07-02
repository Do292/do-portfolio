<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered password">
			<div class="modal-content">
				<div class="modal-header alert-dark">
					<h6 class="modal-title">
						<span>Image Editor</span>
					</h6>
					<ButtonBasic type="close" @onClick="$emit('close')" />
				</div>
				<div class="modal-body">
					<div class="container-fluid p-0">
						<div class="row">
							<ToolbarTemplate
								ref="toolbarRef"
								:itemGroups="toolbarGroups"
								@clicked="handleToolbar"
							/>
							<wfl-imageeditor
								ref="imageRef"
								:toolbar="[]"
								height="300px"
								width="300px"
								@fileOpened="afterOpenImage"
							></wfl-imageeditor>
						</div>
					</div>
				</div>
				<div class="modal-footer justify-content-between">
					<ButtonFooter type="close" @onClick="$emit('close')" />
					<ButtonFooter
						class="apply"
						type="ok"
						@onClick="applyImage"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ToolbarTemplate from "~/system/modeler/components/common/template/ToolbarTemplate";
import { ref, onMounted } from "vue";
import { useIcon } from "~/plugins/composables/syncfusionHelper";

export default {
	name: "ModalPassword",
	components: {
		ToolbarTemplate,
	},
	props: {
		imageData: { type: String },
	},
	emits: ["apply", "close"],
	setup(props, { emit }) {
		//==================== Image
		const imageRef = ref(null);
		const zoomRef = ref(1);

		function afterOpenImage() {
			imageRef.value.select("circle");
		}

		/**
		 * @param {Number} factor
		 */
		function zoomImage(factor) {
			zoomRef.value += factor;

			// default max value: 10
			if (zoomRef.value > 0 && zoomRef.value < 10) {
				imageRef.value.zoom(zoomRef.value);
			} else {
				zoomRef.value -= factor;
			}
		}

		function applyImage() {
			imageRef.value.crop();

			const imageData = imageRef.value.getImageData();
			emit("apply", imageData);
		}

		onMounted(() => {
			imageRef.value.open(props.imageData);
		});

		//==================== Toolbar
		const { ICON_TYPE } = useIcon();
		const { ZOOM_IN, ZOOM_OUT, RESET } = ICON_TYPE;

		const toolbarGroups = [[ZOOM_IN, ZOOM_OUT], [RESET]];

		/**
		 * 클릭한 아이템의 key 값을 기준으로 로직 수행
		 * @param {Object} config
		 * @param {ItemDirective} config.item
		 * @param {String} config.item.key
		 */
		function handleToolbar({ item: { key } }) {
			switch (key) {
				case ZOOM_IN:
					zoomImage(1);
					break;
				case ZOOM_OUT:
					zoomImage(-1);
					break;
				case RESET:
					zoomRef.value = 1;
					imageRef.value.reset();
					break;
			}
		}

		return {
			// Image
			imageRef,
			toolbar: ["Transform", "ZoomIn", "ZoomOut", "Reset"],
			afterOpenImage,
			applyImage,

			// Toolbar
			toolbarGroups,
			handleToolbar,
		};
	},
};
</script>

<style scoped>
/* Layout */
.modal-content {
	width: 308px !important;
}
.modal-body {
	padding: 4px !important;
}

:deep(.input-group) {
	padding-left: 10%;
}
:deep(.e-image-upload),
:deep(.e-image-upload > .e-upload) {
	display: none !important;
}
</style>
