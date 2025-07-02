<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>Label</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body">
					<Splitter :paneConfigs="paneConfigs">
						<template v-slot:left>
							<div :key="currentRef" class="config-box">
								<div class="row">
									<div class="col-6 config-title item-title">
										<label> Configuration </label>
									</div>
									<div class="col-6 text-right mt-2">
										<ButtonBasic
											type="refresh"
											@onClick="initLabelConfig"
										/>
										<ButtonText
											type="apply"
											@onClick="fetchLabelUrl()"
										/>
									</div>
								</div>
								<div class="box-title ml-1">
									<div class="item-box-title">
										<label> Spec </label>
									</div>
								</div>
								<div class="row config-row">
									<div class="col-4">
										<label class="pl-1">
											Print Density
										</label>
									</div>
									<div class="col-8">
										<ComboBasic
											v-model="labelConfig.dpmm"
											:items="dpmmList"
											floatLabelType="Never"
										/>
									</div>
								</div>
								<div
									class="row config-row label-size line-bottom"
								>
									<div class="col-4">
										<label class="pl-1"> Label Size </label>
									</div>
									<div class="col-8">
										<InputNumber
											v-model="labelConfig.width"
											:max="15"
											:min="1"
											format="###.0 inch"
											placeholder="width"
										/>
										<span>x</span>
										<InputNumber
											v-model="labelConfig.height"
											:max="15"
											:min="1"
											format="###.0 inch"
											placeholder="height"
										/>
									</div>
								</div>
								<div
									v-if="hasVariable"
									class="box-title mt-2 ml-1"
								>
									<div class="item-box-title">
										<label> Variable </label>
									</div>
								</div>
								<div
									v-for="(_, key) in variableConfig"
									:key="key"
									:class="getVariableClass(key)"
								>
									<div class="col-4">
										<label class="pl-1">
											{{ key }}
										</label>
									</div>
									<div class="col-8">
										<InputText
											v-model="variableConfig[key]"
										/>
									</div>
								</div>
								<div class="box-title mt-2 ml-1">
									<div class="item-box-title">
										<label> Code </label>
									</div>
								</div>
								<div
									:class="{ 'has-variable': hasVariable }"
									class="code-box ml-2"
								>
									{{ code }}
								</div>
							</div>
						</template>
						<template v-slot:right>
							<div class="label-box">
								<img :src="labelUrl" />
							</div>
						</template>
					</Splitter>
				</div>
				<div class="modal-footer">
					<ButtonFooter type="close" @onClick="$emit('close')" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic";
import InputText from "~/system/modeler/components/common/input/InputText";
import InputNumber from "~/system/modeler/components/common/input/InputNumber";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import axios from "axios";
import { ref, reactive, readonly, computed, onBeforeMount } from "vue";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";

export default {
	name: "ModalLabel",
	components: {
		ComboBasic,
		InputText,
		InputNumber,
		ButtonBasic,
		ButtonText,
		ButtonClose,
		ButtonFooter,
	},
	props: {
		code: { type: String },
		variables: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	setup(props) {
		//==================== Config
		const paneConfigs = [
			{ key: "left", size: 25, min: "250px" },
			{ key: "right", size: 75, min: 50 },
		];

		const { code } = props;
		const currentRef = ref(0);

		// Common
		const { openModalError } = useModalAlert();
		const { executeWithSpinner } = useSpinner();

		//==================== Variable
		const hasVariable = computed(() => props.variables.length > 0);

		// VariableConfig
		const { createItem } = useItem();
		const variableConfig = ref(createItem(props.variables));

		/**
		 * @param {String} variable
		 * @return {String}
		 */
		function getVariableClass(variable) {
			const defaultVariable = "row config-row variable-row ";

			return variable === props.variables.at(-1)
				? defaultVariable + "line-bottom"
				: defaultVariable;
		}

		/**
		 * 라벨코드 내부 변수를 변환 후 반환한다.
		 * @returns {String}
		 */
		function applyVariablesToZPL() {
			let zpl = code;
			for (const key of props.variables) {
				const value = variableConfig.value[key];
				if (value) {
					const pattern = new RegExp(`{${key}}`);
					zpl = zpl.replace(pattern, value);
				}
			}
			return zpl;
		}

		//==================== Dpmm
		const dpmmList = [
			{ text: "6 dpmm (152 dpi)", value: 6 },
			{ text: "8 dpmm (203 dpi)", value: 8 },
			{ text: "12 dpmm (300 dpi)", value: 12 },
			{ text: "24 dpmm (600 dpi)", value: 24 },
		];

		//==================== Label
		const DEFAULT_LABEL_CONFIG = readonly({
			DPMM: 8,
			WIDTH: 4,
			HEIGHT: 6,
		});
		const labelConfig = reactive({
			dpmm: DEFAULT_LABEL_CONFIG.DPMM,
			width: DEFAULT_LABEL_CONFIG.WIDTH,
			height: DEFAULT_LABEL_CONFIG.HEIGHT,
		});
		const labelUrl = ref("");

		/**
		 * 라벨 설정 초기화
		 */
		function initLabelConfig() {
			const { DPMM, WIDTH, HEIGHT } = DEFAULT_LABEL_CONFIG;
			variableConfig.value = createItem(props.variables);

			/**
			 * @param {RegExpr} pattern
			 * @param {Number} defaultValue
			 * @param {Function} transformValue
			 */
			const extractValue = (
				pattern,
				defaultValue,
				transformValue = value => value,
			) => {
				const match = code.match(pattern);
				return match ? transformValue(match[1]) : defaultValue;
			};

			/**
			 * @param {Number} dot
			 * @return {Number}
			 */
			const toInch = dot => {
				const inch = dot / (labelConfig.dpmm * 25.4);
				return Math.round(inch * 10) / 10;
			};

			// DPMM
			const dpmmPattern = /\^MU(\d+)/;
			labelConfig.dpmm = extractValue(dpmmPattern, DPMM);

			// Width
			const widthPattern = /\^PW(\d+)/;
			labelConfig.width = extractValue(widthPattern, WIDTH, toInch);

			// Height
			const heightPattern = /\^LL(\d+)/;
			labelConfig.height = extractValue(heightPattern, HEIGHT, toInch);

			fetchLabelUrl();
			currentRef.value++;
		}

		/**
		 * ZPL 이미지 불러오기
		 */

		function fetchLabelUrl() {
			const { dpmm, width, height } = labelConfig;
			const zpl = applyVariablesToZPL();
			const baseUrl = `http://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${width}x${height}/0/${zpl}`;

			// catch 문으로 에러처리 하지 않으므로 에러 발생 시, 에러를 reject하는 프로미스 반환함.
			executeWithSpinner(async () => {
				const { data } = await axios.get(baseUrl, {
					responseType: "blob",
				});
				labelUrl.value = URL.createObjectURL(data);
			}).catch(({ response: { data } }) => {
				const reader = new FileReader();
				// 파일 읽고 에러 모달 활성화
				reader.onloadend = () => openModalError(reader.result);
				reader.readAsText(data);
			});
		}

		onBeforeMount(() => {
			initLabelConfig();
		});

		return {
			// Config
			paneConfigs,
			currentRef,

			// Variable
			hasVariable,
			variableConfig,
			getVariableClass,

			// Dpmm
			dpmmList,

			// Config
			labelConfig,
			initLabelConfig,

			// Url
			labelUrl,
			fetchLabelUrl,
		};
	},
};
</script>
<style scoped>
/* Layout */
.modal-dialog-centered {
	min-width: 80vw !important;
}
.modal-dialog-centered .modal-content {
	height: 700px;
	max-height: 80vh !important;
}
.modal-dialog-centered .modal-content .modal-body {
	padding: 0.5rem 1rem !important;
	overflow: hidden;
}

/* Splitter */
:deep(#left-pane),
:deep(#right-pane) {
	height: 100%;
	overflow: hidden;
}

/* Title */
.config-title {
	transform: translate(-2px, 1px);
}
.config-title.item-title {
	height: 36px !important;
}
.box-title {
	height: 23px;
	opacity: 0.9;
}

/* Line */
.line-bottom {
	padding-bottom: 32px;
}

/* Config */
.config-box {
	position: relative;
	height: 100%;
}
.config-row {
	height: 28px;
}
.config-row label {
	transform: translateY(3.5px);
	min-width: 100px;
}
.config-row :deep(.e-input-group) {
	border: 1px solid #e0e0e0 !important;
	border-radius: 5px !important;
	height: 26px !important;
}
.config-row :deep(.e-input-group .e-input) {
	padding: 1px !important;
}

/* Variable  */
.variable-row :deep(.e-input-group) {
	width: 100% !important;
}

/* Label Size */
.label-size :deep(.e-input-group) {
	width: calc(50% - 20px) !important;
}
.label-size :deep(.e-input-group:not(.e-float-input) .e-clear-icon) {
	position: absolute;
	right: 15px;
	top: 3px;
}
.label-size span {
	display: inline-block;
	width: 40px;
	text-align: center;
}

/* Label Box */
.label-box {
	margin-top: 10px;
	width: 100%;
	height: calc(100% - 13px);
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	overflow: auto;
}

/* Input Number */
:deep(.e-numeric .e-input-group-icon.e-spin-up),
:deep(.e-numeric .e-input-group-icon.e-spin-down) {
	display: none !important;
}

/* Code box */
.code-box {
	padding: 3px 5px !important;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	background-color: rgba(239, 239, 239, 0.785) !important;
	white-space: pre-wrap;
	word-break: break-word;
	height: calc(100% - 153px);
	overflow: auto;
}
.code-box.has-variable {
	height: calc(100% - 245px);
}
</style>
