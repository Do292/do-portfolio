<template>
	<div class="modal-mask">
		<div class="modal-dialog">
			<div class="modal-content setting-container">
				<div class="modal-header setting-header">
					<h6 class="modal-title">
						<span>{{ $t(modalTitle) }}</span>
					</h6>
					<ButtonBasic @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark">
					<Splitter :paneConfigs="horizontalConfigs">
						<template v-slot:user-tree>
							<FormTree
								:treeItems="treeItems"
								@clickItem="selectUser"
								@refresh="fetchTreeItems"
							></FormTree>
						</template>
						<template v-slot:user-grid>
							<div class="step-container">
								<Splitter
									:paneConfigs="verticalConfigs"
									orientation="Vertical"
								>
									<template
										v-for="{ key } in verticalConfigs"
										:key="key"
										v-slot:[key]
									>
										<div class="arrow-area">
											<ButtonBasic
												type="request"
												@onClick="addUserToStep(key)"
											/>
										</div>
										<Grid
											ref="gridRef"
											:checkbox="false"
											:columns="metaColumns"
											:deleting="true"
											:exporting="false"
											:freezing="true"
											:gridId="key"
											:gridItems="userListByStep[key]"
											:gridName="key"
											:paging="false"
											@afterDelete="
												deleteUserFromStep(key, $event)
											"
										></Grid>
									</template>
								</Splitter>
							</div>
						</template>
					</Splitter>
				</div>
				<div class="justify-content modal-footer">
					<ButtonFooter
						class="apply"
						type="apply"
						@onClick="applyUserList"
					/>
					<ButtonFooter type="close" @onClick="$emit('close')" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useColumnDef } from "~/plugins/composables/tableHandler";
import { useFetchData, useItem } from "~/plugins/composables/dataHandler";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import { useSpinner } from "~/plugins/composables/uiControl";
import { useTree, NODE_FIELD } from "~/plugins/composables/syncfusionHelper";

import * as COMMON from "~/api/common.js";
import { META, USER_INFO } from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "ModalAddUser",
	props: {
		modalTitle: { type: String, default: "modal.addUser.title" },
		steps: { type: Array },
		userMap: { type: Object },
	},
	emits: ["apply", "close"],
	setup(props, { emit }) {
		//==================== Splitter
		const horizontalConfigs = [
			{ key: "user-tree", size: 30, min: "200px" },
			{ key: "user-grid", size: 70, min: "600px" },
		];

		const verticalConfigs = computed(() =>
			props.steps.map(key => ({ key, min: "150px" })),
		);

		//==================== Columns
		const { metaColumns, fetchMetaColumns } = useColumnDef();

		onMounted(async () => {
			await fetchMetaColumns(META.USER);
			await fetchTreeItems();
		});

		//==================== Tree
		const { fetchList } = useFetchData();
		const { deepCloneItems, createItem } = useItem();
		const { groupIntoTreeNodes } = useTree();
		const { executeWithSpinner } = useSpinner();

		const treeItems = ref([]);
		const { ID: USER_ID, DEPARTMENT } = USER_INFO;

		/**
		 * User 트리를 department 기준으로 그룹핑
		 */
		async function fetchTreeItems() {
			await executeWithSpinner(async () => {
				const data = await fetchList(() =>
					COMMON.getByParam(META.USER),
				);
				const userList = data.filter(user => user[DEPARTMENT]);
				userList.forEach(item => {
					item[NODE_FIELD.ID] = item[USER_ID] || item[DEPARTMENT];
				});
				treeItems.value = groupIntoTreeNodes(DEPARTMENT, userList);
				treeItems.value.forEach(item => (item.selectable = false));
			});
		}

		//==================== User
		const userListByStep = ref(createItem(props.steps, () => []));
		const selectedUser = ref({});

		const { openModalWarning } = useModalAlert();

		/**
		 * Step별로 User 리스트 초기화
		 */
		function initUserListByStep() {
			userListByStep.value = props.steps.reduce((acc, step) => {
				acc[step] = props.userMap
					? deepCloneItems(props.userMap[step])
					: [];
				return acc;
			}, {});
		}

		onMounted(() => {
			initUserListByStep();
		});

		/**
		 * @param {Object} config
		 * @param {Object} config.item
		 */
		function selectUser({ item }) {
			// Item 정보 복사하여 할당
			selectedUser.value = { ...item };
		}

		const gridRef = ref(null);

		/**
		 * @param {String} step
		 */
		function addUserToStep(step) {
			const selectedUserId = selectedUser.value[USER_ID];
			if (!selectedUserId) return;

			const stepUsers = userListByStep.value[step] || [];
			if (stepUsers.find(user => user[USER_ID] == selectedUserId)) {
				openModalWarning("modal.create.existData");
				return;
			}

			userListByStep.value[step] = [...stepUsers, selectedUser.value];
		}

		/**
		 * @param {String} step
		 * @param {Object} rowData
		 */
		function deleteUserFromStep(step, rowData) {
			userListByStep.value[step] = userListByStep.value[step].filter(
				user => user[USER_ID] !== rowData[USER_ID],
			);
		}

		function applyUserList() {
			emit("apply", userListByStep.value);
		}

		return {
			horizontalConfigs,
			verticalConfigs,

			metaColumns,

			gridRef,

			// Tree
			treeItems,
			fetchTreeItems,

			// User
			initUserListByStep,
			userListByStep,
			selectUser,
			addUserToStep,
			applyUserList,
			deleteUserFromStep,
		};
	},
};
</script>
<style scoped>
/* Modal */
.modal-body {
	overflow: hidden;
}

/* Splitter */
.modal-body :deep(#Vertical) {
	height: calc(100vh - 160px) !important;
}
:deep(#Vertical .e-pane > div) {
	height: 100%;
}
.step-container :deep(.e-splitter-vertical) {
	height: calc(100vh - 170px) !important;
}
.step-container :deep(.e-splitter-vertical .e-pane) {
	position: relative;
	height: 100%;
	overflow: hidden;
}

/* Tree */
:deep(#user-tree-pane #tree-container > .tree-header) {
	margin-top: 10px !important;
}
:deep(#user-tree-pane #tree-container > .tree-body) {
	height: calc(100% - 70px);
}

/* Grid */
:deep(.e-pane-vertical.e-scrollable .grid-form) {
	height: 100%;
}
:deep(.e-pane-vertical.e-scrollable .grid-form .e-gridcontent) {
	height: calc(100% - 45px) !important;
}
:deep(.e-pane-vertical.e-scrollable .e-grid) {
	height: calc(100% - 37px) !important;
}
:deep(.e-pane-vertical.e-scrollable .e-gridcontent) {
	height: calc(100% - 103px) !important;
}
:deep(.e-grid) {
	padding-left: 40px !important;
}

/* Grid Title */
:deep(.e-pane-vertical.e-scrollable .grid-form .item-title) {
	height: 32px;
	transform: translateY(5px);
}

/* Button */
.arrow-area {
	top: 0px;
	left: 1px;
	position: absolute;
	width: 40px;
	background-color: #f7f7f7;
}
.arrow-area {
	height: calc(100% - 37px);
	transform: translateY(32px);
	z-index: 1;
	border: 1px solid #e0e0e0;
}
.arrow-area > .btn {
	margin-left: 0px !important;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	position: absolute;
}
</style>
