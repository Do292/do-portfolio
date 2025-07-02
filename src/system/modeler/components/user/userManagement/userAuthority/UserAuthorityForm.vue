<template>
	<HeaderSystem @select="selectSystemId" />
	<GridTemplate
		ref="templateRef"
		:checkbox="false"
		:columns="gridColumns"
		:filtering="false"
		:freezing="true"
		:gridItems="userAuthConfigs"
		:reordering="false"
		:selecting="false"
		:sorting="false"
		gridName="UserAuthority"
		@afterBindData="resetUserAuthConfigs"
		@onQueryCellInfo="customizeCell"
	>
		<template v-slot:header-content>
			<div class="btn-group">
				<ButtonFilter @onFilter="initUserAuthority" />
			</div>
			<div class="btn-group">
				<ButtonBasic type="refresh" @onClick="initUserAuthority" />
			</div>
			<ButtonText
				:needsAuthority="true"
				type="apply"
				@onClick="updateUserAuthority"
			/>
		</template>
		<template v-slot:[HEADER_TEMPLATE.CHECKBOX]="config">
			<CheckboxHeader
				:columnConfig="config"
				:configs="getCurrentConfigs()"
				@onChange="toggleHeaderCheckbox"
			/>
		</template>
		<template v-slot:[COLUMN_TEMPLATE.CHECKBOX]="config">
			<CheckboxColumn
				:columnConfig="config"
				:configs="getCurrentConfigs()"
				@onChange="toggleCheckbox"
			/>
		</template>
	</GridTemplate>
</template>

<script>
import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import GridTemplate from "~/system/modeler/components/common/template/GridTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import ButtonFilter from "~/system/modeler/components/common/button/ButtonFilter";
// import CheckboxTemplate from "~/system/modeler/components/common/template/CheckboxTemplate.vue";
import CheckboxHeader from "~/system/modeler/components/common/checkbox/CheckboxHeader.vue";
import CheckboxColumn from "~/system/modeler/components/common/checkbox/CheckboxColumn.vue";

import { ref, computed, onBeforeMount, onMounted, nextTick } from "vue";
import {
	useSpinner,
	useImage,
} from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useColumnDef,
	useFiltering,
} from "~/system/modeler/plugins/composables/modeler-tableHandler";
import {
	useCustomization,
	useGrid,
} from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useKeyEvent } from "~/system/modeler/plugins/composables/modeler-eventHandler";

import {
	TABLE,
	ID,
	USER,
} from "~/system/modeler/constants/modeler_constants.js";

import * as COMMON from "~/system/modeler/api/modeler-common";

export default {
	name: "UserAuthorityForm",
	components: {
		HeaderSystem,
		GridTemplate,
		ButtonBasic,
		ButtonText,
		ButtonFilter,
		CheckboxHeader,
		CheckboxColumn,
	},
	emits: ["setInformation"],
	setup(_, { emit }) {
		//==================== Config
		const MENU_ID = "UserAuthority";
		const ALL = "ALL";

		const templateRef = ref(null);
		const checkboxRefs = ref([]);

		const selectedSystem = ref({});
		const users = ref([]);
		const authorities = ref([]);
		const userAuthorities = ref([]);
		const standardConfigs = ref([]); // 기준 Configs
		const userAuthConfigs = ref([]); // 조작할 Configs

		const { executeWithSpinner } = useSpinner();
		const { assignDataState, fetchList } = useFetchData();
		const { applyList } = useUpdateData();
		const { deepCloneItems } = useItem();
		const { columns, fetchColumns, createColumn } = useColumnDef();
		const { COLUMN_TEMPLATE, HEADER_TEMPLATE } = useGrid();

		const {
			filterConfig,
			toggleModalFilter,
			highlightFilterHeader,
			highlightFilterCell,
		} = useFiltering(columns);

		const authorityIds = computed(() =>
			authorities.value.map(({ [ID.AUTHORITY_ID]: id }) => id),
		);

		function selectSystemId(systemId) {
			selectedSystem.value = { [ID.SYSTEM_ID]: systemId };
			initUserAuthority();
		}

		function setUserAuthConfigs(configs) {
			standardConfigs.value = configs;
			userAuthConfigs.value = deepCloneItems(configs);
		}

		function initUserAuthority() {
			setUserAuthConfigs([]);

			executeWithSpinner(async () => {
				await fetchUserAuthority();
				initUserAuthConfigs();
				nextTick(() => highlightFilterHeader(templateRef));
			});
		}

		async function fetchUserAuthority() {
			users.value = await fetchList(() =>
				COMMON.filterBy(
					TABLE.USER_INFO,
					assignDataState(filterConfig.value),
				),
			);
			authorities.value = await fetchList(() =>
				COMMON.getBy(
					TABLE.AUTHORITY,
					assignDataState(selectedSystem.value),
				),
			);
			userAuthorities.value = await fetchList(() =>
				COMMON.getBy(TABLE.USER_AUTHORITY),
			);
		}

		/**
		 * 컨피그 데이터 초기화
		 */
		function initUserAuthConfigs() {
			const configs = deepCloneItems(users.value);
			configs.forEach(defineUserAuthConfig);

			setUserAuthConfigs(configs);
		}

		/**
		 * 컨피그 데이터 리셋
		 */
		function resetUserAuthConfigs() {
			executeWithSpinner(() => {
				for (const config of userAuthConfigs.value) {
					defineUserAuthConfig(config);
				}
			}, 100);

			templateRef.value.refreshHeader();
		}

		/**
		 * 컨피그 정의
		 * @param {Object} config
		 */
		function defineUserAuthConfig(config) {
			const idSet = new Set(
				userAuthorities.value
					.filter(item => item[USER.ID] === config[USER.ID])
					.filter(item =>
						authorityIds.value.includes(item[ID.AUTHORITY_ID]),
					)
					.map(item => item[ID.AUTHORITY_ID]),
			);

			// AuthorityId 순회하며 해당 유저의 권한 여부 설정
			authorityIds.value.forEach(id => (config[id] = idSet.has(id)));

			config[ALL] = authorityIds.value.length === idSet.size;
		}

		/**
		 * 현재 페이지 유저의 권한 반환
		 * @returns {Object[]}
		 */
		function getCurrentConfigs() {
			const ids = getCurrentUserIds();
			return userAuthConfigs.value.filter(config =>
				ids.includes(config[USER.ID]),
			);
		}

		/**
		 * 현재 페이지의 유저 아이디 반환
		 * @returns {String[]}
		 */
		function getCurrentUserIds() {
			const items = templateRef.value?.getCurrentItems() || [];
			return items.map(item => item[USER.ID]);
		}

		//==================== Column
		const { validateBadgeToCell } = useCustomization();
		const { CHECKBOX } = COLUMN_TEMPLATE;
		const { CHECKBOX: HEADER_CHECKBOX } = HEADER_TEMPLATE;

		// 체크박스 칼럼 생성
		const createColumnWithCheckbox = field =>
			createColumn({
				field,
				textAlign: "Center",
				headerTemplate: HEADER_CHECKBOX,
				template: CHECKBOX,
			});

		const columnsForCheckbox = computed(() => [
			createColumnWithCheckbox(ALL),
			...authorityIds.value.map(id => createColumnWithCheckbox(id)),
		]);

		const gridColumns = computed(() => [
			...columns.value,
			...columnsForCheckbox.value,
		]);

		// 그리드 칼럼 바인딩
		onBeforeMount(() => {
			fetchColumns(TABLE.USER_INFO, MENU_ID, MENU_ID);
		});

		//==================== Row
		const { prependImage } = useImage();

		// 행 전체 체크 여부 판단
		const isRowCheckedAll = index =>
			authorityIds.value.every(id => getCurrentConfigs()[index][id]);

		/**
		 * 셀 클릭 이벤트를 정의하고 체크박스를 초기화한다.
		 * @param {Object} event
		 * @param {Object} event.column
		 * @param {Object} event.data
		 * @param {HTMLTableCellElement} event.cell
		 */
		function customizeCell({ column, data, cell }) {
			const { template, field } = column;
			if (template !== CHECKBOX) {
				cell.addEventListener(EVENT.CLICK, () =>
					selectUser(data[USER.ID]),
				);

				// Badge 변경
				if (validateBadgeToCell(cell, field, data[field])) {
					cell.style.width = "100px";
					return;
				}

				highlightFilterCell(cell, field, data[field]);

				if (field === USER.ID) {
					prependImage(cell, data[USER.IMAGE]);
					cell.style.width = "110px";
				}
				return;
			}

			// 셀 스타일 조정
			cell.style.width = "170px";
		}

		/**
		 * config를 업데이트하고 체크박스 토글한다.
		 * @param {Number} index 현재 페이지의 rowIndex
		 * @param {String} field
		 * @param {Boolean} checked
		 */
		function toggleCheckbox(index, field, checked) {
			if (field == ALL) {
				toggleCheckboxesAllByRow(index, checked);
			} else {
				const config = getCurrentConfigs()[index];
				config[field] = checked;
				// row 전체 선택 여부 확인 후 토글
				toggleCheckboxForRow(index);
			}
		}

		/**
		 * 헤더 체크박스 토글
		 * @param {String} field
		 * @param {Boolean} checked
		 */
		function toggleHeaderCheckbox(field, checked) {
			toggleCheckboxesAllByColumn(field, checked);

			const userIds = getCurrentUserIds();
			userIds.forEach((_, index) => {
				if (field == ALL) {
					toggleCheckboxesAllByRow(index, checked);
				} else {
					toggleCheckboxForRow(index);
				}
			});
		}

		/**
		 * 칼럼 기준 체크박스 토글
		 * @param {String} field
		 * @param {Boolean} checked
		 */
		function toggleCheckboxesAllByColumn(field, checked) {
			const configs = getCurrentConfigs();
			configs.forEach(config => (config[field] = checked));
		}

		/**
		 * 행 체크박스들 토글
		 * @param {Number} index 현재 페이지의 rowIndex
		 * @param {Boolean} checked
		 */
		function toggleCheckboxesAllByRow(index, checked) {
			const config = getCurrentConfigs()[index];
			const checkboxFields = [ALL, ...authorityIds.value];
			checkboxFields.forEach(id => (config[id] = checked));
		}

		/**
		 * 행 전체 체크 여부 업데이트
		 * @param {Number} index
		 */
		function toggleCheckboxForRow(index) {
			const checked = isRowCheckedAll(index);
			const config = getCurrentConfigs()[index];
			config[ALL] = checked;
		}

		//==================== Information
		const {
			fetchColumns: fetchUserColumns,
			mergeTableConfig: mergeUserConfig,
		} = useColumnDef();
		const {
			fetchColumns: fetchAuthorityColumns,
			mergeTableConfig: mergeAuthorityConfig,
		} = useColumnDef();

		/**
		 * Authority Information 바인딩
		 * @param {String} id
		 */
		function selectAuthority(id) {
			const row = authorities.value.find(
				authority => authority[ID.AUTHORITY_ID] === id,
			);
			const infoConfig = mergeAuthorityConfig({ row });
			emit("setInformation", infoConfig);
		}

		/**
		 * 사용자 데이터 Information 바인딩
		 * @param {String} id
		 */
		function selectUser(id) {
			const row = users.value.find(user => user[USER.ID] === id);
			const infoConfig = mergeUserConfig({ row });
			emit("setInformation", infoConfig);
		}

		onMounted(async () => {
			await fetchAuthorityColumns(TABLE.USER_AUTHORITY, TABLE.AUTHORITY);
			fetchUserColumns(TABLE.USER_INFO, TABLE.USER_INFO);
			selectAuthority();
		});

		//==================== Event
		const { EVENT, KEY, defineButtonConfig, activateButtonEvent } =
			useKeyEvent();

		onMounted(() => {
			const target = templateRef.value.gridTargetRef;
			const buttonConfigs = [
				defineButtonConfig(KEY.FILTER, toggleModalFilter),
				defineButtonConfig(KEY.RESET, initUserAuthority),
			];

			// 버튼 이벤트 활성화
			activateButtonEvent(target, buttonConfigs);
		});

		//==================== User Auth
		/**
		 * 변경된 authority 업데이트
		 */
		async function updateUserAuthority() {
			const { createAuthorities, deleteAuthorities } =
				generateAuthorities();

			await applyAuthorities(createAuthorities, deleteAuthorities);

			initUserAuthority();
		}

		/**
		 * 변경된 authority를 create, delete 구분하여 반환
		 * @return {Object}
		 */
		function generateAuthorities() {
			const createAuthorities = [];
			const deleteAuthorities = [];
			const currentConfigs = getCurrentConfigs();

			for (const config of currentConfigs) {
				const userId = config[USER.ID];
				const standardConfig = standardConfigs.value.find(
					standardConfig => standardConfig[USER.ID] == userId,
				);

				for (const id of authorityIds.value) {
					if (config[id] === standardConfig[id]) {
						continue;
					}

					const authority = {
						[USER.ID]: userId,
						[ID.AUTHORITY_ID]: id,
					};

					if (config[id]) {
						createAuthorities.push(authority);
					} else {
						deleteAuthorities.push(authority);
					}
				}
			}

			return { createAuthorities, deleteAuthorities };
		}

		/**
		 * @todo apply api 적용
		 */
		async function applyAuthorities(createAuthorities, deleteAuthorities) {
			await executeWithSpinner(async () => {
				if (createAuthorities.length || deleteAuthorities.length) {
					await applyList(
						TABLE.USER_AUTHORITY,
						createAuthorities,
						deleteAuthorities,
					);
				}
			});
		}

		return {
			// Config
			templateRef,
			checkboxRefs,
			userAuthConfigs,
			initUserAuthority,
			resetUserAuthConfigs,
			selectSystemId,
			getCurrentConfigs,

			// Column
			COLUMN_TEMPLATE,
			HEADER_TEMPLATE,
			gridColumns,

			// Row
			customizeCell,

			// Checkbox
			toggleCheckbox,
			toggleHeaderCheckbox,

			// User Auth
			updateUserAuthority,
		};
	},
};
</script>
<style scoped>
/* Grid */
:deep(.e-frozenscrollbar.e-frozen-left-scrollbar) {
	display: inline-block !important;
}
:deep(.e-gridcontent) {
	height: calc(100vh - 333px) !important;
}

/* Button */
:deep(.item-box) {
	padding-right: 8px !important;
}

/* Filter */
:deep(.modal-dialog-top.setting) {
	transform: translateX(-10px) !important;
}
</style>
