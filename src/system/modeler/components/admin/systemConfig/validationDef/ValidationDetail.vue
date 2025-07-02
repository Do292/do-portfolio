<template>
	<div class="row">
		<div class="col-9 item-title">
			<label>Validation Detail</label>
			<BreadcrumbTemplate :isSelectable="false" :items="path" />
		</div>
		<div class="col-3 text-right mt-2">
			<div class="item-box right-space">
				<ButtonBasic type="refresh" @onClick="initConfig(true)" />
				<ButtonText
					:needsAuthority="true"
					type="apply"
					@onClick="applyConfig"
				/>
			</div>
		</div>
	</div>
	<div :key="configKey" class="hcalc detail-box">
		<div class="row item-box-title">Configuration</div>
		<div class="row line-bottom pt-1 pb-2">
			<div class="col-12">
				<div class="row">
					<div class="col-6 input">
						<InputText
							v-model="config[ID.TABLE_ID]"
							:enabled="false"
							:placeholder="$t(ID.TABLE_ID)"
							floatLabelType="Always"
						/>
					</div>
					<div class="col-6 input">
						<InputText
							v-model="config[VALIDATION.EVENT]"
							:enabled="false"
							:placeholder="$t(ID.EVENT)"
							floatLabelType="Always"
						/>
					</div>
				</div>
				<div class="row">
					<div class="col-6 input required">
						<ComboBasic
							:items="validationTypes"
							:modelValue="config[VALIDATION.TYPE]"
							:placeholder="$t(VALIDATION.TYPE)"
							@update:modelValue="updateValidationType"
						/>
					</div>
					<div class="col-6 input">
						<ComboBasic
							v-model="config[VALIDATION.OPERATOR]"
							:items="operations"
							:placeholder="$t(VALIDATION.OPERATOR)"
						/>
					</div>
				</div>
				<div class="row">
					<div class="col input">
						<InputText
							v-model="config[ID.DESCRIPTION]"
							:placeholder="$t(ID.DESCRIPTION)"
							floatLabelType="Always"
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="row item-box-title mt-2">Source</div>
		<div class="row line-bottom pt-1 pb-2 setting">
			<div class="col-12">
				<div class="row">
					<div class="col-6 input">
						<InputText
							v-model="config[SOURCE_TABLE_ID]"
							:enabled="isSourceQuery"
							:placeholder="$t(ID.TABLE_ID)"
							floatLabelType="Always"
						/>
					</div>
					<div
						:class="{ required: !isSourceQuery }"
						class="col-6 input"
					>
						<InputText
							v-model="config[SOURCE_COLUMN_ID]"
							:placeholder="$t(ID.COLUMN_ID)"
							floatLabelType="Always"
						/>
					</div>
				</div>
				<div class="row">
					<div :class="{ required: isSourceQuery }" class="col input">
						<InputQuery
							v-model="config[SOURCE_INPUT_QUERY]"
							:isDisabled="!isSourceQuery"
							:placeholder="$t(ID.INPUT_QUERY)"
							:resizing="true"
							:tableId="config[ID.TABLE_ID]"
							floatLabelType="Always"
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="row item-box-title mt-2">Target</div>
		<div class="row pt-1 setting">
			<div class="col-12">
				<div class="row">
					<div class="col-6 input">
						<InputText
							v-model="config[TARGET_TABLE_ID]"
							:enabled="isTargetQuery"
							:placeholder="$t(ID.TABLE_ID)"
							floatLabelType="Always"
						/>
					</div>
					<div class="col-6 input">
						<InputText
							v-model="config[TARGET_COLUMN_ID]"
							:enabled="isTargetQuery"
							:placeholder="$t(ID.COLUMN_ID)"
							floatLabelType="Always"
						/>
					</div>
				</div>
				<div class="row">
					<div class="col input required">
						<InputQuery
							v-model="config[TARGET_INPUT_QUERY]"
							:placeholder="$t(ID.INPUT_QUERY)"
							:resizing="true"
							:tableId="config[ID.TABLE_ID]"
							floatLabelType="Always"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic";
import InputQuery from "~/system/modeler/components/common/input/InputQuery";
import InputText from "~/system/modeler/components/common/input/InputText";

import { ref, watch, computed, onMounted } from "vue";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useFieldColumn } from "~/system/modeler/plugins/composables/modeler-tableHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import { TABLE, ID } from "~/system/modeler/constants/modeler_constants.js";
import {
	VALIDATION,
	VALIDATION_TYPE,
} from "~/system/modeler/constants/table_constants.js";
import {
	ENUM_KEY,
	ENUM_FIELD,
	OPERATION_TYPE_FIELD,
} from "~/system/modeler/constants/enum_constants.js";

export default {
	name: "ValidationDetail",
	components: {
		BreadcrumbTemplate,
		ButtonBasic,
		ButtonText,
		ComboBasic,
		InputQuery,
		InputText,
	},
	props: {
		defaultConfig: { type: Object },
	},
	emits: ["apply"],
	setup(props, { emit }) {
		//==================== Config
		const {
			SOURCE_TABLE_ID,
			SOURCE_COLUMN_ID,
			SOURCE_INPUT_QUERY,
			TARGET_TABLE_ID,
			TARGET_COLUMN_ID,
			TARGET_INPUT_QUERY,
		} = VALIDATION;
		const { executeWithSpinner } = useSpinner();
		const { defineDependency } = useFieldColumn();

		// Path
		const path = computed(() => [
			props.defaultConfig[ID.SYSTEM_ID],
			props.defaultConfig[VALIDATION.ID],
		]);

		// Config
		const config = ref({});
		const configKey = computed(() => config.value[VALIDATION.ID]);
		watch(
			() => props.defaultConfig,
			() => initConfig(),
		);

		/**
		 * Config를 초기값으로 원복
		 */
		function initConfig() {
			executeWithSpinner(() => {
				config.value = { ...props.defaultConfig };
				updateValidationType(selectedType.value);
			}, 200);
		}

		/**
		 * Dependency를 정의 후 이벤트 전송
		 */
		function applyConfig() {
			const query = config.value[SOURCE_INPUT_QUERY] + " ";
			config.value[TARGET_INPUT_QUERY];

			const configWithDependency = Object.assign(config.value, {
				[ID.DEPENDENT_COLUMN_ID]: defineDependency(query),
			});

			emit("apply", configWithDependency);
		}

		//==================== Validtion Type
		const validationTypes = computed(() => Object.values(VALIDATION_TYPE));

		// 선택된 타입
		const selectedType = computed({
			get() {
				return config.value[VALIDATION.TYPE] ?? VALIDATION_TYPE.SELF_C;
			},
			set(newType) {
				config.value[VALIDATION.TYPE] = newType;
			},
		});

		/**
		 * 선택된 타입에 따라 Config 초기화
		 * @param {String} type
		 */
		function updateValidationType(type) {
			selectedType.value = type;

			// Self type인 경우 source tableId 초기화
			if (!isSourceQuery.value) {
				config.value[SOURCE_TABLE_ID] = config.value[ID.TABLE_ID];
			}

			// Constant type인 경우 target table, column 초기화
			if (!isTargetQuery.value) {
				config.value[TARGET_TABLE_ID] = "";
				config.value[TARGET_COLUMN_ID] = "";
			}
		}

		// Source
		const isSourceQuery = computed(() =>
			/related/i.test(selectedType.value),
		);

		// Target
		const isTargetQuery = computed(() => /data/i.test(selectedType.value));

		//==================== Operation
		const { fetchList } = useFetchData();
		const operations = ref([]);

		async function initOperations() {
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.ENUM_VALUE, {
					[ENUM_FIELD.KEY]: ENUM_KEY.OPERATION_TYPE,
				}),
			);
			operations.value = data.map(item => ({
				value: item[OPERATION_TYPE_FIELD.VALUE],
				text: item[OPERATION_TYPE_FIELD.TEXT],
			}));
		}

		onMounted(initOperations);

		return {
			// Constant
			ID,
			VALIDATION,
			SOURCE_TABLE_ID,
			SOURCE_COLUMN_ID,
			SOURCE_INPUT_QUERY,
			TARGET_TABLE_ID,
			TARGET_COLUMN_ID,
			TARGET_INPUT_QUERY,

			// Config
			path,
			config,
			configKey,
			initConfig,
			applyConfig,

			// Validation Type
			validationTypes,
			selectedType,
			updateValidationType,

			// Source
			isSourceQuery,

			// Target
			isTargetQuery,

			// Operation
			operations,
		};
	},
};
</script>
<style scoped>
/* Header */
.item-title label {
	white-space: nowrap !important;
}

/* Detail Box */
.detail-box {
	padding: 3px 10px;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	background-color: #fafafa;
	height: calc(100vh - 192px) !important;
	overflow: auto;
}
.detail-box .item-box-title {
	margin-top: 5px;
	height: 25px;
}
.detail-box .item-box-title.required-field::after {
	position: relative;
}
.detail-box .setting {
	position: relative;
	max-height: calc(50vh - 120px);
	min-height: 100px;
	overflow: auto;
}
.detail-box .input {
	padding-right: 10px !important;
	padding-left: 10px !important;
}
.detail-box .input :deep(.e-input-group:not(.e-disabled)) {
	background: white !important;
}

/* Float */
:deep(.e-float-text.e-label-top) {
	top: -13px !important;
}
:deep(.e-multi-line-input .e-float-text.e-label-top) {
	top: -25px !important;
}
:deep(.required .e-float-text::after) {
	position: relative;
	content: "\ea07";
	font-family: aimcons;
	color: #fd7e14;
	padding-left: 4px;
	font-size: 12px;
}
:deep(.required .e-disabled .e-float-text.e-label-top::after) {
	background: none;
	-webkit-text-fill-color: #fd7e14 !important;
}

/* Input Query */
.detail-box .setting :deep(.e-input-group.e-multi-line-input) {
	padding-top: 0px !important;
	padding-bottom: 4px !important;
	padding-right: 0 !important;
	min-height: 38px !important;
	height: calc(50vh - 340px) !important;
	max-height: calc(50vh - 100px) !important;
}
.detail-box .setting :deep(.e-input-group.e-multi-line-input textarea) {
	height: calc(100% - 8px) !important;
}
.detail-box .setting :deep(.e-input-group.e-multi-line-input + .btn-simple) {
	top: 17px;
	right: 4px;
}
</style>
