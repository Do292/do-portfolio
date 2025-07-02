<template>
	<div v-show="!isPanelCollapsed" class="form-panel">
		<Accordion :panelConfig="panelConfig">
			<template v-slot:item="item">
				<div class="d-table-cell field">
					{{ item.headerText }}
				</div>
				<div class="d-table-cell input">
					<FormInput
						ref="inputRef"
						v-model="detailConfig[item.field]"
						:fieldConfig="item"
						:hasLabel="false"
						:isDisabled="checkColumnDisabled(item)"
						:target="detailConfig"
						floatLabelType="Never"
						@click="initGenerator"
						@keyup.enter="nextGenerator"
					/>
				</div>
			</template>
		</Accordion>
		<div class="item-box-button">
			<ButtonBasic
				class="btn-con-dblue"
				type="reset"
				@onClick="resetDetailConfig"
			>
				Reset
			</ButtonBasic>
			<ButtonBasic type="addData" @onClick="applyDetailConfig">
				Add Data
			</ButtonBasic>
		</div>
	</div>
	<ButtonCollapse v-model="isPanelCollapsed" />
</template>

<script>
import { ref, computed, watch, watchPostEffect } from "vue";
import { useItem } from "~/plugins/composables/dataHandler";
import { useColumnDef } from "~/plugins/composables/tableHandler";
import { useInputFocusGenerator } from "~/plugins/composables/eventHandler";
import { useSpinner } from "~/plugins/composables/uiControl";

import { COLUMN_TYPE } from "~/constants/common_constants.js";
import { INPUT_TYPE } from "~/plugins/wfb-constants.js";

export default {
	name: "FormDetail",
	props: {
		metaDataId: { type: String },
		details: { type: Array },
	},
	setup(props, { emit }) {
		//==================== Field Panel
		const { ID } = useColumnDef();
		const { groupByItems } = useItem();
		const isPanelCollapsed = ref(false);

		// type 별로 field 데이터를 분류한 패널 객체
		const panelConfig = computed(() =>
			groupByItems(ID.COLUMN_TYPE, props.details, COLUMN_TYPE.STANDARD),
		);

		// Panel 열리면 Input 포커싱
		watch(
			() => isPanelCollapsed.value,
			collapsed => {
				if (!collapsed) {
					setTimeout(initAndFocusGenerator);
				}
			},
		);

		/**
		 * InputType이 never인 경우 비활성화
		 * @param {Object} column
		 */
		function checkColumnDisabled(column) {
			return column[ID.INPUT_TYPE] === INPUT_TYPE.NEVER;
		}

		//==================== Input
		const { executeWithSpinner } = useSpinner();
		const { initGenerator, nextGenerator, initAndFocusGenerator } =
			useInputFocusGenerator();
		const inputRef = ref(null);

		// 마지막 Input이 랜더링 확인되면 첫 번째 Input으로 포커싱한다.
		const unwatch = watchPostEffect(() => {
			if (inputRef.value) {
				setTimeout(() => {
					initAndFocusGenerator();
					unwatch(); // 포커싱은 랜더링 후 단 한 번 실행
				}, 300); // Accordion 펼쳐지는 시간 고려
			}
		});

		/**
		 * @param {Function} callback
		 */
		async function focusInputAfterExecute(callback) {
			await executeWithSpinner(callback);
			// 스피너 끝나고 300ms 후에 포커싱되는 게 자연스러움.
			setTimeout(initAndFocusGenerator, 300);
		}

		//==================== Detail Config
		const detailConfig = ref({});

		/**
		 * Detail Config 리셋
		 */
		function resetDetailConfig() {
			focusInputAfterExecute(() => {
				detailConfig.value = {};
			});
		}

		/**
		 * 상위 컴포넌트로 config 복사본 전송 후 초기화
		 */
		function applyDetailConfig() {
			emit("apply", { ...detailConfig.value });
			resetDetailConfig();
		}

		return {
			// Field Panel
			panelConfig,
			isPanelCollapsed,
			checkColumnDisabled,

			// Input
			inputRef,
			initGenerator,
			nextGenerator,

			// Detail Config
			detailConfig,
			resetDetailConfig,
			applyDetailConfig,
		};
	},
};
</script>
