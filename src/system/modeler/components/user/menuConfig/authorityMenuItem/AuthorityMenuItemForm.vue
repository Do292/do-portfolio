<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<GridForm
						:checkbox="false"
						:condition="selectedSystem"
						menuId="AuthorityMenuItem"
						tableId="Authority"
						@onSelectionChanged="selectAuthority"
					>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</GridForm>
				</template>
				<template v-slot:right>
					<GridForm
						ref="itemRef"
						:condition="selectedSystem"
						menuId="AuthorityMenuItem"
						tableId="MenuItem"
						@onAfterBindData="selectAuthorityItems"
						@onSelectionChanged="setInformation"
					>
						<template v-slot:grid-path>
							<BreadcrumbTemplate
								:isSelectable="false"
								:items="authorityPaths"
							/>
						</template>
						<template v-slot:grid-button>
							<div class="btn-group">
								<ButtonText
									:needsAuthority="true"
									type="apply"
									@onClick="applyAuthorityItems"
								/>
							</div>
						</template>
					</GridForm>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";

import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import GridForm from "~/system/modeler/components/common/form/GridForm";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";

import { ref, computed } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";

import {
	ID,
	TABLE,
	FLAG,
} from "~/system/modeler/constants/modeler_constants.js";
import * as COMMON from "~/system/modeler/api/modeler-common";

export default {
	name: "AuthorityMenuItemForm",
	components: {
		BreadcrumbTemplate,
		HeaderSystem,
		GridForm,
		ButtonText,
	},
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const paneConfigs = [
			{ key: "left", size: 45 },
			{ key: "right", size: 55 },
		];
		const itemRef = ref(null);

		//==================== System
		const { SYSTEM_ID, AUTHORITY_ID, MENU_ID, ITEM_ID, ACCESS_FLAG } = ID;
		const selectedSystem = ref({ [SYSTEM_ID]: "" });

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		function selectSystemId(systemId) {
			// 기존 선택된 시스템과 다를 경우만
			if (selectedSystem.value[SYSTEM_ID] !== systemId) {
				selectedSystem.value = { [SYSTEM_ID]: systemId };
			}
		}

		//==================== Authority
		const { executeWithSpinner } = useSpinner();
		const { checkItemsEqual } = useItem();
		const { fetchList } = useFetchData();
		const { createList, modifyList } = useUpdateData();

		const selectedAuthority = ref({});
		const authorityPaths = computed(() =>
			Object.values(selectedAuthority.value),
		);
		const authorityItems = ref([]);

		/**
		 * Authority 선택
		 */
		async function selectAuthority({ tableId, columns, row = {} }) {
			selectedAuthority.value = {
				[SYSTEM_ID]: selectedSystem.value[SYSTEM_ID],
				[AUTHORITY_ID]: row[AUTHORITY_ID] ?? "",
			};
			setInformation({ tableId, columns, row });
			fetchAuthorityItems();
		}

		/**
		 * @param {Object}
		 * @returns {String|null} flag
		 */
		function getAuthorityItemFlag(item) {
			const authorityItem = authorityItems.value.find(
				authorityItem =>
					authorityItem[MENU_ID] === item[MENU_ID] &&
					authorityItem[ITEM_ID] === item[ITEM_ID],
			);
			return authorityItem?.[ACCESS_FLAG];
		}

		/**
		 * 선택된 권한 기준으로 MenuItem 할당
		 */
		async function fetchAuthorityItems() {
			await executeWithSpinner(async () => {
				authorityItems.value = await fetchList(() =>
					COMMON.getBy(
						TABLE.AUTHORITY_MENU_ITEM,
						selectedAuthority.value,
					),
				);
			}, 300);

			// 1페이지 체크 설정
			selectAuthorityItems();
		}

		/**
		 * 현재 페이지 기준 체크 상태 업데이트
		 */
		function selectAuthorityItems() {
			executeWithSpinner(() => {
				const currentItems = itemRef.value.cloneCurrentItems();
				const selectedIndexes = currentItems
					.map((item, index) => ({ ...item, index }))
					.filter(item => getAuthorityItemFlag(item) === FLAG.Y)
					.map(({ index }) => index)
					.sort((a, b) => b - a); // 하단 -> 상단 데이터 순으로 체크돼서 스크롤이 상단으로 감.

				itemRef.value.selectRows(selectedIndexes);
			});
		}

		/**
		 * 현재 페이지 기준으로 데이터를 Create 또는 Update
		 */
		async function applyAuthorityItems() {
			const { Y, N } = FLAG;
			const createItems = [];
			const updateItems = [];

			// 현재 페이지의 데이터와 체크 데이터를 정의
			const currentItems = itemRef.value.cloneCurrentItems();
			const checkItems = itemRef.value.cloneCheckItems();
			const isTargetIncluded = (items, target) =>
				items.some(item => checkItemsEqual(item, target));

			for (const item of currentItems) {
				// 체크 데이터 해당 여부에 따라 accessFlag 지정
				const accessFlag = isTargetIncluded(checkItems, item) ? Y : N;
				const oldFlag = getAuthorityItemFlag(item);

				if (accessFlag === oldFlag || (accessFlag === N && !oldFlag)) {
					continue;
				}

				const authorityItem = {
					[ACCESS_FLAG]: accessFlag,
					[MENU_ID]: item[MENU_ID],
					[ITEM_ID]: item[ITEM_ID],
					...selectedAuthority.value,
				};

				if (oldFlag) {
					updateItems.push(authorityItem);
				} else {
					createItems.push(authorityItem);
				}
			}

			await executeWithSpinner(async () => {
				if (createItems.length) {
					await createList(TABLE.AUTHORITY_MENU_ITEM, createItems);
				}
				if (updateItems.length) {
					await modifyList(TABLE.AUTHORITY_MENU_ITEM, updateItems);
				}
			});

			fetchAuthorityItems();
		}

		return {
			// Config
			itemRef,
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// System
			selectedSystem,
			selectSystemId,

			// Authority
			selectedAuthority,
			authorityPaths,
			selectAuthority,
			selectAuthorityItems,
			applyAuthorityItems,
		};
	},
};
</script>
<style scoped>
/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 340px) !important;
}

/* Filter */
:deep(.modal-dialog-top.setting) {
	transform: translateX(-52px) !important;
}
</style>
