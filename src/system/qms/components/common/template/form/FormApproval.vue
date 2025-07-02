<template>
	<div class="approval-container scroll-auto">
		<div class="row approval-header">
			<div class="col-12">
				<div class="float-right">
					<div v-if="editing" class="btn-area">
						<ButtonAddUser
							v-if="!isCreated || isDraft"
							:steps="steps"
							:userMap="routeMap"
							@apply="applyRouteList"
						/>
					</div>
				</div>
			</div>
		</div>
		<template v-for="(item, index) in displayRouteList" :key="index">
			<div :class="item[ROUTE.STATUS]" class="row between approver-box">
				<div class="col-5">
					<div class="d-table inherit">
						<div class="d-table-row">
							<div class="d-table-cell v-middle">
								<div class="user-icon">
									<i class="aim aimcons_user2"></i>
								</div>
							</div>
							<div class="d-table-cell v-middle p-2">
								<div class="user-name">
									{{ getUserNameBy(item) }}
								</div>
								<div class="user-group">
									{{ getDepartmentBy(item) }}
								</div>
								<div class="user-type">
									{{ getApprovalStepBy(item) }}
									<span class="event-name">
										{{ item[ROUTE.STATUS] }}
									</span>
									<span
										v-if="getEventTimeBy(item)"
										class="event-time"
									>
										{{ getEventTimeBy(item) }}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="col-7">
					<div v-if="item[ROUTE.OPINION]" class="opinion-box">
						{{ item[ROUTE.OPINION] }}
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import ButtonAddUser from "~/system/qms/components/common/button/ButtonAddUser";

import { ref, reactive, computed, watch, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import { useFetchData, useItem } from "~/plugins/composables/dataHandler";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import { useColumnDef } from "~/plugins/composables/tableHandler";
import { useUserInfo } from "~/plugins/composables/authority";

import * as COMMON from "~/api/common.js";
import * as SYSTEM from "~/api/system-common.js";
import * as APPROVAL_API from "~/system/qms/api/approval.js";
import {
	META,
	STRATEGY_CONFIG as STRATEGY,
	ENUM,
	APPROVAL,
	APPROVAL_ROUTE as ROUTE,
	USER_INFO,
} from "~/system/qms/constants/qms_meta_constants.js";
import {
	APPROVAL_STATE,
	APPROVAL_ROUTE_STATUS as ROUTE_STATUS,
} from "~/system/qms/constants/qms_constants.js";
import { ENUM_KEY } from "~/system/qms/constants/qms_enum_constants.js";
import { USER } from "~/plugins/wfb-constants.js";

export default {
	name: "FormApproval",
	components: {
		ButtonAddUser,
	},
	props: {
		config: {
			type: Object,
			default() {
				return {};
			},
		},
		editing: { type: Boolean },
	},
	setup(props, { emit }) {
		//==================== Common
		const { fetchList } = useFetchData();
		const { filterItem, groupByItems, sortItemsBySequence } = useItem();
		const { openModalWarning } = useModalAlert();
		const { t } = useI18n();
		const { ID } = useColumnDef();
		const { userInfo } = useUserInfo();

		const { ID: USER_ID, NAME: USER_NAME, DEPARTMENT } = USER_INFO;
		const { DRAFT } = APPROVAL_STATE;

		const categoryConfig = computed(() =>
			filterItem(props.config, [STRATEGY.ID, STRATEGY.TYPE]),
		);

		//==================== Approval
		const approval = reactive({
			[STRATEGY.ID]: null,
			[STRATEGY.TYPE]: "",
			[APPROVAL.ID]: "",
			[APPROVAL.STATE]: "",
			[APPROVAL.STEP]: "",
			[APPROVAL.APPROVER]: {},
			[APPROVAL.OPINION]: "",
			[APPROVAL.REQUEST_USER]: "",
			[APPROVAL.REQUEST_TIME]: "",
			[APPROVAL.ROUTES]: [],
		});

		const draftInfo = ref({ [ROUTE.APPROVER]: userInfo });
		const requestInfo = computed(() => ({
			[ROUTE.STEP]: "Draft",
			[ROUTE.STATUS]: "Request",
			[ID.EVENT_TIME]: approval[APPROVAL.REQUEST_TIME],
			[ROUTE.OPINION]: approval[APPROVAL.OPINION],
			[ROUTE.APPROVER]: {
				[USER_ID]: approval[APPROVAL.REQUEST_USER],
			},
		}));
		const initialRoute = computed(() =>
			isRequested.value ? requestInfo.value : draftInfo.value,
		);

		/**
		 * Approval 초기화.
		 */
		async function initApproval() {
			if (props.config[STRATEGY.ID]) {
				const data = await fetchList(() =>
					COMMON.getByParam(META.APPROVAL, categoryConfig.value),
				);

				for (const [key, value] of Object.entries(data)) {
					approval[key] = value;
				}

				// Route 초기화
				const sortedRoutes = sortItemsBySequence(
					approval[APPROVAL.ROUTES],
					ROUTE.SEQUENCE,
				);
				routeList.value = sortedRoutes;
			}
		}

		watch(
			() => ({ ...approval }),
			newValue => {
				emit("update:approvalConfig", newValue);
			},
		);

		const isCreated = computed(() => !!approval[APPROVAL.ID]);
		const isDraft = computed(() => approval[APPROVAL.STATE] === DRAFT);
		const isRequested = computed(
			() => !!approval[APPROVAL.REQUEST_USER] && !props.editing,
		);

		watch(
			() => props.editing,
			editing => {
				if (editing) {
					routeList.value = [];
				} else {
					initApproval();
				}
			},
		);

		/**
		 * Approval과 ApprovalRoute 생성
		 */
		async function saveApproval() {
			const routes = routeList.value.map(route => ({
				[ROUTE.ID]: route[ROUTE.ID],
				[ROUTE.STEP]: route[ROUTE.STEP],
				[ROUTE.APPROVER]: route[ROUTE.APPROVER][USER_ID],
				[ROUTE.SEQUENCE]: route[ROUTE.SEQUENCE],
			}));
			const approvalConfig = {
				[APPROVAL.ID]: approval[APPROVAL.ID],
				...categoryConfig.value,
				...{ [APPROVAL.ROUTES]: routes },
			};
			await fetchList(() => COMMON.create(META.APPROVAL, approvalConfig));
			await initApproval();
		}

		/**
		 * 결재 요청
		 */
		async function requestApproval(comment) {
			approval[APPROVAL.OPINION] = comment;
			approval[APPROVAL.REQUEST_USER] = userInfo.value[USER.ID];
			await fetchList(() => APPROVAL_API.request(approval));
			await initApproval();
		}

		/**
		 * 결재 요청 가능한지 확인.
		 * @return {Boolean}
		 */
		function checkRequestable() {
			const requestable = approval[APPROVAL.ROUTES].every(
				route => route[ROUTE.STATUS] === ROUTE_STATUS.DRAFT,
			);
			if (!requestable) {
				openModalWarning("결재 상신할 수 없습니다.");
			}
			return requestable;
		}

		/**
		 * 결재 요청 취소.
		 */
		async function cancelApproval() {
			await fetchList(() => APPROVAL_API.cancel(approval));
			await initApproval();
		}

		/**
		 * 결재 요청 취소 가능한지 확인.
		 * 하나라도 승인된 건이 있으면 취소 불가.
		 * @return {Boolean}
		 */
		function checkCancelable() {
			const cancelable = !approval[APPROVAL.ROUTES].some(
				route => route[ROUTE.STATUS] === ROUTE_STATUS.APPROVED,
			);
			if (!cancelable) {
				openModalWarning("결재 취소할 수 없습니다.");
			}
			return cancelable;
		}

		//==================== Approval Step
		const steps = ref([]);

		/**
		 * Enum에 정의된 Approval Step을 가져온 뒤, 할당.
		 */
		async function fetchApprovalStepList() {
			const data = await fetchList(() =>
				SYSTEM.getEnumValueList(ENUM_KEY.APPROVAL_STEP),
			);
			steps.value = data.map(item => item[ENUM.VALUE]);
		}

		//==================== Approval Route
		const routeList = ref([]);
		const displayRouteList = computed(() => [
			...[initialRoute.value],
			...routeList.value,
		]);

		/**
		 * Approval Route를 Step별로 그룹핑 후 반환
		 * @return {Object}
		 */
		const routeMap = computed(() => {
			const groupedItems = groupByItems(ROUTE.STEP, routeList.value);
			return Object.keys(groupedItems).reduce((acc, key) => {
				acc[key] = groupedItems[key].map(item => item[ROUTE.APPROVER]);
				return acc;
			}, {});
		});

		/**
		 * 결재 경로 설정
		 * @param {Object} usersByStep
		 */
		function applyRouteList(usersByStep) {
			let sequence = 0;
			routeList.value = Object.entries(usersByStep).reduce(
				(acc, [step, users]) => {
					if (users.length) {
						const approvers = users.map(user => ({
							[ROUTE.STEP]: step,
							[ROUTE.APPROVER]: user,
							[ROUTE.SEQUENCE]: sequence++,
						}));
						acc.push(...approvers);
					}
					return acc;
				},
				[],
			);
		}

		/**
		 * 현재 Approval의 Route 중 In_Progress인 단계를 찾아 결재 승인 혹은 반려.
		 * @param {String} action approve 또는 reject
		 * @param {String} opinion
		 */
		async function handleApprovalRoute(action, opinion) {
			const currentRoute = approval[APPROVAL.ROUTES].find(
				route => route[ROUTE.STATUS] === ROUTE_STATUS.IN_PROGRESS,
			);
			if (currentRoute[ROUTE.ID]) {
				const data = { [ROUTE.ID]: currentRoute[ROUTE.ID], opinion };
				await fetchList(() =>
					APPROVAL_API.executeRouteAction(action, data),
				);
			}
			await initApproval();
			checkApprovalCompleted();
		}

		function checkApprovalCompleted() {
			const isCompleted = approval[APPROVAL.ROUTES].every(
				route => route[ROUTE.STATUS] === ROUTE_STATUS.APPROVED,
			);
			if (isCompleted) {
				emit("complete");
			}
		}

		/**
		 * User 이름 추출
		 * @param {Object} item
		 * @return {String}
		 */
		function getUserNameBy(item) {
			const approver = item[ROUTE.APPROVER];
			return approver
				? approver[USER_NAME] ?? approver[USER_ID]
				: t("user.unknown");
		}

		/**
		 * User 부서 추출
		 * @param {Object} item
		 * @return {String}
		 */
		function getDepartmentBy(item) {
			const approver = item[ROUTE.APPROVER];
			return approver ? approver[DEPARTMENT] : "";
		}

		/**
		 * Approval Step 추출
		 * @param {Object} item
		 * @return {String}
		 */
		function getApprovalStepBy(item) {
			return item[ROUTE.STEP] ?? DRAFT;
		}

		/**
		 * Event Time 추출. Draft, In_Progress 단계의 경우 표시하지 않음
		 * @param {Object} item
		 * @return {String}
		 */
		function getEventTimeBy(item) {
			const { DRAFT, IN_PROGRESS } = ROUTE_STATUS;
			return ![DRAFT, IN_PROGRESS].includes(item[ROUTE.STATUS])
				? item[ID.EVENT_TIME]
				: "";
		}

		onBeforeMount(async () => {
			await initApproval();
			await fetchApprovalStepList();
		});

		return {
			ROUTE,
			ID,

			// Approval
			isCreated,
			isDraft,
			save: saveApproval,
			request: requestApproval,
			cancel: cancelApproval,
			checkCancelable,
			checkRequestable,

			// Approval Step
			steps,

			// Approval Route,
			displayRouteList,
			routeMap,
			applyRouteList,
			handleApprovalRoute,
			getUserNameBy,
			getDepartmentBy,
			getApprovalStepBy,
			getEventTimeBy,
		};
	},
};
</script>

<style scoped></style>
