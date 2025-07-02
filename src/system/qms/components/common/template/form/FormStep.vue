<template>
	<div class="form-step-container">
		<div v-for="step of stepList" :key="step.index" class="step-config">
			<div :class="step.style" class="step-box" @click="step.select()">
				<div class="step-seq">
					{{ step.index }}
					<div class="step-id">
						{{ step.id }}
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="form-step">
		<div :key="currentRef">
			<div class="row">
				<div class="col-6 item-title">
					<label data-test="grid-title">
						{{ selectedStep.id }}
					</label>
				</div>
				<div class="col-6 text-right mt-2">
					<div v-if="isStepCurrent" class="item-box">
						<template v-if="!isApprovalSubmitted">
							<!-- Normal Mode -->
							<span v-if="!editing">
								<ButtonText
									:type="ACTION.EDIT"
									@onClick="toggleEditing"
								/>
							</span>
							<!-- Edit Mode -->
							<span v-else>
								<ButtonText
									:type="ACTION.CANCEL"
									@onClick="toggleEditing(false)"
								/>
								<ButtonText
									:type="ACTION.SAVE"
									@onClick="saveStep"
								/>
							</span>
						</template>
						<!-- Submit -->
						<span
							:class="{ 'border-left': !isApprovalSubmitted }"
							class="pl-2 ml-2"
						>
							<template v-if="isApprovalSelected">
								<template v-if="isApprovalDraft">
									<ButtonText
										:disabled="editing"
										:type="ACTION.RETURN"
										@onClick="returnStep"
									/>
									<ButtonText
										:disabled="editing"
										:type="ACTION.SUBMIT"
										@onClick="requestApproval"
									/>
								</template>
								<template v-else-if="isApprovalSubmitted">
									<ButtonText
										v-if="isApprovalRequester"
										:disabled="editing"
										:type="ACTION.CANCEL"
										@onClick="cancelApproval"
									/>
									<ButtonText
										v-if="isApprovalApprover"
										:disabled="editing"
										:type="ACTION.REJECT"
										@onClick="rejectApproval"
									/>
									<ButtonText
										v-if="isApprovalApprover"
										:disabled="editing"
										:type="ACTION.APPROVE"
										@onClick="approveApproval"
									/>
								</template>
							</template>
							<template v-else>
								<ButtonText
									v-if="!isStepFirst"
									:disabled="editing"
									:type="ACTION.RETURN"
									@onClick="returnStep"
								/>
								<ButtonText
									v-if="!isApprovalSelected"
									:disabled="editing"
									:type="ACTION.SUBMIT"
									@onClick="submitStep"
								/>
							</template>
						</span>
					</div>
				</div>
			</div>
			<component
				:is="formComponent"
				:key="detailCurrentRef"
				ref="stepRef"
				v-model:approvalConfig="approvalConfig"
				:config="typeConfig"
				:editing="editing"
				@complete="changeStep(STEP.COMPLETED)"
				@edit="editStep"
				@saveCompleted="updateConfig"
			/>
		</div>
	</div>
</template>

<script>
import FormTeam from "~/system/qms/components/common/template/form/FormTeam";
import FormStepDetail from "~/system/qms/components/common/template/form/FormStepDetail";
import FormApproval from "~/system/qms/components/common/template/form/FormApproval";
import FormAuditPlan from "~/system/qms/components/common/template/form/FormAuditPlan";
import FormAudit from "~/system/qms/components/common/template/form/FormAudit";
import FormAuditSummary from "~/system/qms/components/common/template/form/FormAuditSummary";

import { ref, reactive, computed, watch, onBeforeMount, provide } from "vue";
import { useFetchData, useItem } from "~/plugins/composables/dataHandler";
import { useSpinner } from "~/plugins/composables/uiControl";
import {
	useModalConfirm,
	useModalSuccess,
} from "~/plugins/composables/modalHandler";
import { useUserInfo } from "~/plugins/composables/authority";

import * as COMMON from "~/api/common.js";
import * as STRATEGY from "~/system/qms/api/strategy.js";

import {
	META,
	STRATEGY_MAP,
	STRATEGY_CONFIG,
	APPROVAL,
} from "~/system/qms/constants/qms_meta_constants.js";
import {
	STRATEGY_STEP as STEP,
	APPROVAL_STATE,
} from "~/system/qms/constants/qms_constants.js";
import { ACTION } from "~/plugins/wfb-constants.js";
import { USER } from "~/plugins/wfb-constants.js";

export default {
	name: "FormStep",
	components: {
		FormTeam,
		FormStepDetail,
		FormApproval,
		FormAuditPlan,
		FormAudit,
		FormAuditSummary,
	},
	props: {
		config: { type: Object },
		type: { type: String },
	},
	setup(props) {
		//==================== Common
		const { fetchList } = useFetchData();
		const { sortItemsBySequence } = useItem();
		const { executeWithSpinner } = useSpinner();
		const { openModalConfirmBy } = useModalConfirm();
		const { toggleModalSuccess } = useModalSuccess();
		const { userInfo } = useUserInfo();

		const currentRef = ref(0);
		const detailCurrentRef = ref(0);

		const userId = userInfo.value[USER.ID];

		// Type과 config 취합
		const typeConfig = computed(() => ({
			[STRATEGY_CONFIG.TYPE]: props.type,
			...props.config,
		}));

		/**
		 * @param {String} action
		 * @param {Function} callback
		 */
		function openModalConfirmAndExecute(action, callback) {
			openModalConfirmBy(action, props.type, [{}], comment =>
				executeWithSpinner(async () => {
					await callback(comment);
					toggleModalSuccess();
				}),
			);
		}

		//==================== Step
		const stepRef = ref(null);
		const stepList = ref([]);

		// Selected Step
		const selectedStep = reactive({ id: "", index: 0, metaDataId: "" });
		const isApprovalSelected = computed(
			() => selectedStep.id === STEP.APPROVAL,
		);

		const formComponent = computed(() => {
			const isCustomStep = Object.values(STEP).includes(selectedStep.id);
			return isCustomStep ? `Form${selectedStep.id}` : "FormStepDetail";
		});

		// Current Step
		const currentStep = computed(() => props.config[STRATEGY_CONFIG.STEP]);
		const currentStepIndex = computed(
			() =>
				stepList.value.findIndex(({ id }) => id === currentStep.value) +
				1,
		);

		// Step 비교
		const isStepFirst = computed(() => selectedStep.index <= 1);
		const isStepFinal = computed(
			() => selectedStep.index === StepConfig.length,
		);
		const isStepCurrent = computed(
			() => selectedStep.id === currentStep.value,
		);

		// Completed 확인
		const isStepCompleted = computed(
			() => currentStep.value === STEP.COMPLETED,
		);
		watch(
			() => [props.config[STRATEGY_CONFIG.ID], stepList.value.length],
			() => {
				if (isStepCompleted.value && stepList.value.length > 0) {
					const step = stepList.value[stepList.value.length - 1];
					step.select();
				}
			},
		);

		// 하위 컴포넌트에서 사용
		provide("step", { stepList, selectedStep });

		class StepConfig {
			// index를 static으로 관리해 seq 대체
			static length = 0;

			constructor(config) {
				this.id = config[STRATEGY_MAP.STEP_ID];
				this.metaDataId = config[STRATEGY_MAP.META_DATA_ID];
				this.index = ++StepConfig.length;

				// Selecting 여부
				this.selecting = computed(() => selectedStep.id === this.id);
				this.style = computed(() => ({
					selecting: selectedStep.id === this.id,
					submitted: this.index < currentStepIndex.value,
					current: this.index === currentStepIndex.value,
					completed: isStepCompleted.value,
				}));

				// default 선택
				if (this.id === currentStep.value) {
					this.select();
				}
			}

			// 인스턴스 기준으로 Step 지정
			select() {
				Object.keys(selectedStep).forEach(
					key => (selectedStep[key] = this[key]),
				);

				// 편집 비활성화
				toggleEditing(false);

				detailCurrentRef.value++;
			}
		}

		/**
		 * type 기준으로 StrategyMap 목록을 정렬 후 Step 인스턴스로 정의한다.
		 */
		async function fetchStepList() {
			const strategyList = await fetchList(() =>
				COMMON.getByParam(META.STRATEGY_MAP, {
					[STRATEGY_MAP.TYPE_ID]: props.type,
				}),
			);
			sortItemsBySequence(strategyList, STRATEGY_MAP.SEQUENCE);

			stepList.value = strategyList.map(
				strategy => new StepConfig(strategy),
			);
		}

		/**
		 * 현재 스탭일 경우만 편집 모드 전환
		 */
		function editStep() {
			if (isStepCurrent.value) {
				toggleEditing(true);
			}
		}

		/**
		 * 현재 Step Form의 save 함수 실행 후 편집 모드 종료
		 */
		function saveStep() {
			openModalConfirmAndExecute(ACTION.SAVE, async () => {
				await stepRef.value.save();
				toggleEditing(false);
			});
		}

		/**
		 * 이전 스텝으로 돌아간다.
		 */
		function returnStep() {
			openModalConfirmAndExecute(ACTION.RETURN, async () => {
				const id = props.config[STRATEGY_CONFIG.ID];
				await fetchList(() => STRATEGY.revert(props.type, id));
				moveStep(-1);
			});
		}

		/**
		 * 다음 스텝으로 넘어간다.
		 */
		function submitStep() {
			openModalConfirmAndExecute(ACTION.SUBMIT, async () => {
				const id = props.config[STRATEGY_CONFIG.ID];
				await fetchList(() => STRATEGY.submit(props.type, id));
				moveStep(1);
			});
		}

		/**
		 * @param {Number|null} increment
		 */
		function moveStep(increment = 1) {
			const index = selectedStep.index + increment;
			const step = stepList.value.find(step => step.index === index);

			// 자연스러운 이동을 위해 시간 지연
			setTimeout(() => {
				// props를 수정하고 있으므로 주의할 것
				Object.assign(props.config, {
					[STRATEGY_CONFIG.STEP]: step.id,
				});
				step.select();
			}, 200);
		}

		function changeStep(stepId) {
			// props를 수정하고 있으므로 주의할 것
			Object.assign(props.config, {
				[STRATEGY_CONFIG.STEP]: stepId,
			});
		}

		/**
		 * @param {Object} config
		 */
		function updateConfig(config) {
			// props를 수정하고 있으므로 주의할 것
			Object.assign(props.config, config);
		}

		// Step 변경 감지하여 선택
		watch(
			() => props.config,
			config => {
				executeWithSpinner(() => {
					// step 초기화
					toggleEditing(false);
					currentRef.value++;

					const step = stepList.value.find(
						step => step.id === config[STRATEGY_CONFIG.STEP],
					);
					// Step이 존재할 경우 선택한다.
					if (step) {
						step.select();
					}
				});
			},
		);

		onBeforeMount(fetchStepList);

		//==================== Button
		const editing = ref(false);

		/**
		 * 편집 상태 토글
		 * @param {Boolean|null} force
		 */
		function toggleEditing(force) {
			editing.value = force ?? !editing.value;
		}

		//==================== Approval
		const approvalConfig = ref({});
		const { DRAFT, SUBMITTED } = APPROVAL_STATE;

		const isApprovalDraft = computed(
			() => approvalConfig.value[APPROVAL.STATE] === DRAFT,
		);
		const isApprovalSubmitted = computed(
			() =>
				isApprovalSelected.value &&
				approvalConfig.value[APPROVAL.STATE] === SUBMITTED,
		);
		const isApprovalRequester = computed(
			() => approvalConfig.value[APPROVAL.REQUEST_USER] === userId,
		);
		const isApprovalApprover = computed(
			() => approvalConfig.value[APPROVAL.APPROVER] === userId,
		);

		/**
		 * 결재 요청. 모든 경로가 Draft 상태여야 결재 요청 가능.
		 */
		function requestApproval() {
			if (stepRef.value.checkRequestable()) {
				openModalConfirmAndExecute(ACTION.SUBMIT, async comment => {
					await stepRef.value.request(comment);
				});
			}
		}

		/**
		 * 결재 요청 취소. 하나라도 승인된 건이 있으면 취소 불가.
		 */
		function cancelApproval() {
			if (stepRef.value.checkCancelable()) {
				openModalConfirmAndExecute(ACTION.CANCEL, async () => {
					await stepRef.value.cancel();
				});
			}
		}

		/**
		 * 결재 승인
		 */
		function approveApproval() {
			openModalConfirmAndExecute(ACTION.APPROVE, async comment => {
				await stepRef.value.handleApprovalRoute(
					ACTION.APPROVE,
					comment,
				);
			});
		}

		/**
		 * 결재 반려
		 */
		function rejectApproval() {
			openModalConfirmAndExecute(ACTION.REJECT, async comment => {
				await stepRef.value.handleApprovalRoute(ACTION.REJECT, comment);
			});
		}

		return {
			// Constant
			ACTION,
			META,
			STEP,
			currentRef,
			detailCurrentRef,

			// Category
			typeConfig,

			// Step
			stepRef,
			stepList,
			editStep,
			saveStep,
			returnStep,
			submitStep,
			moveStep,
			changeStep,
			updateConfig,

			// Selected Step
			selectedStep,
			isApprovalSelected,
			isStepFirst,
			isStepFinal,
			isStepCurrent,
			isStepCompleted,

			// Edit
			editing,
			toggleEditing,

			// Approval
			approvalConfig,
			isApprovalDraft,
			isApprovalSubmitted,
			isApprovalRequester,
			isApprovalApprover,
			requestApproval,
			cancelApproval,
			approveApproval,
			rejectApproval,

			formComponent,
		};
	},
};
</script>
<style scoped></style>
