<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header alert-dark">
					<h6 class="modal-title">
						<span>{{ $t("Clone") }}</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body">
					<div class="container-fluid p-0">
						<div class="row mb-2">
							<div class="col-12 message-box">
								<i
									class="icons aimcons_info_plus text-dark"
								></i>
								<span>
									<h5 class="text-dark mt-3 pt-1 pl-2">
										{{ message }}
									</h5>
									<InputSearch
										:customItems="sources"
										:field="field"
										:readonly="!isEditable"
										:value="source[field]"
										@search="searchSource"
										@update="updateSource"
									/>
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer justify-content-between">
					<ButtonFooter type="close" @onClick="$emit('close')" />
					<ButtonFooter
						class="apply"
						type="ok"
						@onClick="$emit('apply', source)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";
import InputSearch from "~/system/modeler/components/common/input/InputSearch";

import { ref, computed } from "vue";

export default {
	name: "ModalClone",
	components: {
		ButtonClose,
		ButtonFooter,
		InputSearch,
	},
	props: {
		field: { type: String },
		metaDataId: { type: String },
		sources: { type: Array },
	},
	setup(props) {
		//==================== Config
		const message = computed(
			() =>
				`Please enter the source [${props.field}] to copy the ${props.metaDataId}.`,
		);

		//==================== Source
		const source = ref({});

		function searchSource([item]) {
			source.value = item;
		}

		function updateSource(value) {
			source.value[props.field] = value;
		}

		return {
			// Config
			message,

			// Source
			source,
			searchSource,
			updateSource,
		};
	},
};
</script>

<style scoped>
/* Layout */
.modal-title {
	padding-left: 20px;
}
.modal-body {
	max-height: 300px;
}

/* Icon */
.message-box i.text-dark {
	color: #32345b;
}

/* Title */
.message-box h5 {
	font-size: 0.9rem;
}

/* Input */
.message-box :deep(.e-input-group) {
	margin-left: 7px;
	width: calc(100% - 9px) !important;
}
.message-box .check-message {
	display: block;
	margin-left: 8px;
	margin-top: 8px;
}
</style>
