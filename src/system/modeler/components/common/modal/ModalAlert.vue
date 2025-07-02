<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div :class="alertClass" class="modal-header">
					<h6 class="modal-title">
						<span>{{ $t(type) }}</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body confirm">
					<div class="container-fluid">
						<div class="row">
							<div class="col-12 message-box">
								<i :class="textClass" class="icons"></i>
								<span>
									<div
										v-if="title"
										:class="textClass"
										class="h-message"
									>
										<label>{{ title }}</label>
									</div>
									<div
										:class="textClass"
										class="text-secondary"
									>
										<label>{{ $t(message, param) }}</label>
									</div>
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<ButtonFooter type="close" @onClick="$emit('close')" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import { computed, onBeforeMount } from "vue";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "ModalAlert",
	components: { ButtonClose, ButtonFooter },
	setup() {
		//==================== Config
		const { type, title, message, param } = useModalAlert();

		// CSS Style
		const alertClass = computed(() => createClass("alert"));
		const textClass = computed(() => createClass("text"));

		/**
		 * @param {String} prefix
		 * @returns {String}
		 */
		function createClass(prefix) {
			return `${prefix}-${type.value.toLowerCase()}`;
		}

		onBeforeMount(() => {
			// 현재 포커스된 요소에 블러 처리
			document.activeElement?.blur();
		});

		return {
			type,
			title,
			message,
			param,

			alertClass,
			textClass,
		};
	},
};
</script>

<style scoped>
.modal-mask {
	z-index: 10000000000000;
}

/* Header */
.alert-error {
	background-color: #dc3545;
	color: white;
}

/* Icon */

/* Text */
</style>
