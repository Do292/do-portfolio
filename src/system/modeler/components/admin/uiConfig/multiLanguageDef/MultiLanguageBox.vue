<template>
	<div class="locale-value">
		<div class="row">
			<div class="col-8 item-title">
				<label>{{ $t(header) }}</label>
				<BreadcrumbTemplate
					v-if="breadcrumbs"
					:isSelectable="false"
					:items="breadcrumbs"
				/>
				<ButtonBasic
					class="btn-copy"
					type="copy"
					@onClick="copyValue()"
				/>
			</div>
			<div class="col-4 text-right">
				<div class="btn-area">
					<ButtonBasic type="refresh" @onClick="initValue()" />
					<ButtonText
						:needsAuthority="true"
						type="apply"
						@onClick="updateValue()"
					/>
				</div>
			</div>
		</div>
		<div class="text-box">
			<textarea ref="textRef" v-model="textValue"></textarea>
		</div>
	</div>
</template>

<script>
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";

import { ref, computed, watch, onMounted } from "vue";
import { useUnicode } from "~/system/modeler/plugins/composables/modeler-locale";
import {
	useAction,
	useKeyEvent,
} from "~/system/modeler/plugins/composables/modeler-eventHandler";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import { NLS } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "MultiLanguageBox",
	components: { BreadcrumbTemplate, ButtonBasic, ButtonText },
	props: {
		language: { type: String },
		header: { type: String },
		config: {
			type: Object,
			default() {
				return {};
			},
		},
	},
	emits: ["update"],
	setup(props, { emit }) {
		//==================== Config
		const {
			KEY,
			defineButtonConfig,
			activateButtonEvent,
			activateCopyEvent,
		} = useKeyEvent();
		const { ID, SYSTEM_ID } = NLS;
		const currentRef = ref(0);
		const textRef = ref(null);

		const isNlsValid = computed(() => !!props.config[ID]);
		const breadcrumbs = computed(() => {
			const { [SYSTEM_ID]: systemId, [ID]: nlsId } = props.config;
			return isNlsValid.value ? [systemId, nlsId] : null;
		});

		onMounted(() => {
			const buttonConfigs = [
				defineButtonConfig(KEY.APPLY, updateValue),
				defineButtonConfig(KEY.RESET, initValue),
			];

			// 버튼 이벤트 활성화
			activateButtonEvent(textRef, buttonConfigs);

			// 복사 이벤트 활성화
			activateCopyEvent(textRef, () => textRef.value?.value);
		});

		//==================== NLS
		const { openModalWarning } = useModalAlert();
		const { decode, encode } = useUnicode();
		const { copyText } = useAction();
		const textValue = ref("");

		/**
		 * text value 초기화
		 */
		function initValue() {
			const value = props.config[props.language];
			textValue.value = decode(value);
		}

		/**
		 * textValue를 클립보드에 복사한다.
		 */
		function copyValue() {
			const { value } = textRef.value ?? {};
			if (value) {
				copyText(value);
			}
		}

		/**
		 * value를 인코딩 후 변경을 위한 이벤트 전송
		 */
		function updateValue() {
			if (!isNlsValid.value) {
				openModalWarning("warning.selectRowData", { param: "NLS" });
				return;
			}

			const encodedValue = encode(textRef.value?.value);
			emit("update", props.language, encodedValue);
		}

		watch(() => props.config, initValue);

		return {
			// Config
			textRef,
			currentRef,
			breadcrumbs,

			// NLS
			textValue,
			initValue,
			copyValue,
			updateValue,
		};
	},
};
</script>

<style scoped>
/* Layout */
.locale-value {
	height: 100%;
	overflow: hidden;
}
.breadcrumb-box {
	width: auto !important;
}
:deep(.breadcrumb-box .breadcrumb) {
	max-width: 100% !important;
}
:deep(.breadcrumb::before) {
	/* transform: translate(-13px, 1px) !important; */
}

/* button */
.item-title .btn-copy {
	background: none !important;
	border: none !important;
	color: #c1c1c1 !important;
	margin-bottom: 5px;
}
.item-title .btn-copy:hover {
	color: #f97203 !important;
}
.item-title .btn-copy :deep(i) {
	font-size: larger;
}
.btn-area {
	transform: translate(-6px, 6px);
}

/* textarea */
.text-box {
	height: calc(100% - 50px);
	transform: translateY(-2px);
	margin-bottom: 10px;
}
.text-box > textarea {
	width: calc(100% - 5px);
	height: 100%;
	outline: 0;
	border-color: #e0e0e0;
	resize: none;
	margin-left: 3px;
	padding: 3px 5px !important;
}
</style>
