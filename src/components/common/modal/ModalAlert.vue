<template>
	<div class="modal-mask alert">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div :class="alertClass" class="modal-header">
					<h6 class="modal-title">
						<span>{{ $t(type) }}</span>
					</h6>
					<button class="close" @click="$emit('close')">
						<i class="aim aimcons_close"></i>
					</button>
				</div>
				<div class="modal-body confirm">
					<div class="container-fluid">
						<div class="row mb-2">
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
import { computed, onBeforeMount } from "vue";
import { useModalAlert } from "~/plugins/composables/modalHandler";

export default {
	name: "ModalAlert",
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
<style scoped></style>
