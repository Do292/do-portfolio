<template>
	<div
		ref="modalFilterRef"
		aria-modal="true"
		class="modal-dialog-top setting"
	>
		<div class="modal-small-content setting-container alert-content">
			<div class="row modal-header setting-header">
				<h6 class="modal-title">
					<span>Filter</span>
					<ButtonSimple
						class="pb-1"
						type="reset"
						@onClick="resetConfig"
					/>
				</h6>
				<ButtonClose @onClick="$emit('close')" />
			</div>
			<div class="modal-body setting-body">
				<div class="container-fluid">
					<div
						v-for="(filter, index) in filters"
						:key="index"
						class="between filter-box text-left text-dark"
					>
						<InputField
							v-model="fieldConfig[filter.field]"
							:fieldConfig="filter"
							:target="fieldConfig"
						/>
					</div>
				</div>
			</div>
			<div class="modal-footer float-right">
				<div class="case-switch">
					<SwitchTemplate
						v-model="isCaseSensitive"
						:enabled="canToggleCaseSensitivity"
						label="Case Sensitive"
					/>
				</div>
				<ButtonFooter
					:isDisabled="!isApplicable"
					class="apply"
					type="apply"
					@onClick="applyConfig()"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import SwitchTemplate from "~/system/modeler/components/common/template/SwitchTemplate";
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonSimple from "~/system/modeler/components/common/button/ButtonSimple";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";
import InputField from "~/system/modeler/components/common/input/InputField";

import { ref, inject, computed, watch } from "vue";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useKeyEvent } from "~/system/modeler/plugins/composables/modeler-eventHandler";

export default {
	name: "ModalFilter",
	components: {
		SwitchTemplate,
		ButtonClose,
		ButtonSimple,
		ButtonFooter,
		InputField,
	},
	emits: ["apply", "close"],
	setup(_, { emit }) {
		//==================== Config
		const modalFilterRef = ref(null);
		const currentRef = ref(0);
		const { filters, filterConfig, caseSensitive } = inject("filter"); //GridForm
		const fieldConfig = ref({ ...filterConfig.value });

		// Case Sensitive
		const isCaseSensitive = ref(caseSensitive.value);
		const canToggleCaseSensitivity = computed(() => {
			const { length } = Object.keys(fieldConfig.value).filter(
				key => fieldConfig.value[key],
			);
			return length > 0;
		});

		watch(
			() => canToggleCaseSensitivity.value,
			enabled => {
				if (!enabled) {
					isCaseSensitive.value = false;
				}
			},
		);

		const { checkItemsEqual } = useItem();
		const isApplicable = computed(
			() =>
				caseSensitive.value !== isCaseSensitive.value ||
				!checkItemsEqual(filterConfig.value, fieldConfig.value),
		);

		/**
		 * fieldConfig만 초기화한다. filterConfig는 유지
		 */
		function resetConfig() {
			for (const key in fieldConfig.value) {
				fieldConfig.value[key] = "";
			}
		}

		/**
		 * apply 가능한 경우만 이벤트 전송
		 */
		function applyConfig() {
			if (isApplicable.value) {
				caseSensitive.value = isCaseSensitive.value;
				emit("apply", fieldConfig.value);
			}
		}

		//==================== Event
		const { activateApplyEvent, activateResetEvent } = useKeyEvent();

		// F2로 config apply 수행
		activateApplyEvent(modalFilterRef, applyConfig);

		// ESC키로 리셋
		activateResetEvent(modalFilterRef, resetConfig);

		return {
			// Config
			modalFilterRef,
			currentRef,
			filters,
			fieldConfig,
			isApplicable,
			resetConfig,
			applyConfig,

			// Case Sensitive
			isCaseSensitive,
			canToggleCaseSensitivity,
		};
	},
};
</script>

<style scoped>
/* Layout */
.modal-dialog-top.setting {
	z-index: 10;
	top: 28px;
	right: -169px !important;
}

/* Modal Body */
.filter-box {
	padding: 2px 0px;
}
.filter-box:last-child {
	border-color: transparent !important;
}
.filter-box .field {
	font-size: 14px;
}
.filter-box .input {
	height: 30px;
}

/* Button */
.modal-title button {
	transform: translateY(-1px) !important;
}
.modal-title :deep(button.close i) {
	position: relative;
}
:deep(.btn.apply:disabled) {
	pointer-events: auto !important;
	border: 1px #00000023 solid !important;
	cursor: default !important;
	background: rgba(0, 0, 0, 0.3) !important;
}
:deep(.btn.apply:disabled:hover) {
	background: rgba(0, 0, 0, 0.3) !important;
}

/* Switch */
.case-switch {
	height: 5px;
	position: relative;
	display: inline-block;
}
.case-switch .switch-box {
	transform: translate(-75px, -8px);
}

/* Input */
:deep(.e-input-group.e-float-input) {
	margin-bottom: 10px !important;
}
</style>
