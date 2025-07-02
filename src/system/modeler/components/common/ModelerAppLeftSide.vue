<template>
	<div class="main-sidebar close">
		<div class="sidebar3">
			<div class="btn btn-md btn-hamburger">
				<i class="aim aimcons_menu"></i>
			</div>
			<div class="btn btn-md btn-favorite ml-0">
				<i class="aim aimcons_favorite_menu_1"></i>
			</div>
		</div>
		<div class="sidebar text-center p-2">
			<div
				v-for="id in mainFolderIds"
				:key="id"
				:class="getFolderStyle(id)"
				class="main-menu text-center pt-3 pb-3"
				@click="selectfolder(id)"
			>
				<span>
					<i :class="getFolderIcon(id)"></i>
				</span>
			</div>
		</div>
	</div>
	<div
		v-show="selectedFolderId"
		:class="{ on: selectedFolderId }"
		class="sub-menu"
	>
		<ButtonPin v-model="isFixed" />
		<TreeTemplate
			ref="treeRef"
			:hasHeader="false"
			:parentID="PARENT_ID"
			:treeItems="menuListByFolder"
			sortOrder="None"
			@clickItem="selectMenu"
		>
			<template v-slot:tree-node="data">
				<div class="tree-node">
					<span class="tree-node-id">
						{{ $t(data[NAME] ?? data[ID]) }}
					</span>
				</div>
			</template>
		</TreeTemplate>
	</div>
</template>

<script>
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";
import ButtonPin from "~/system/modeler/components/common/button/ButtonPin";

import { readonly, ref, computed, watch } from "vue";
import {
	useMenu,
	useTab,
} from "~/system/modeler/plugins/composables/modeler-authority";
import { useTree } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { MENU } from "~/system/modeler/constants/modeler_constants.js";
import {
	MENU as MENU_FIELD,
	NODE_FIELD,
} from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "AppLeftSide",
	components: {
		TreeTemplate,
		ButtonPin,
	},
	setup() {
		//==================== Main Menu
		const { ID, PARENT_ID, NAME, POSITION } = MENU_FIELD;
		// Menu 고정 여부
		const isFixed = ref(false);

		const {
			// Folder
			folderList,
			mainFolderIds,
			getSubFolderList,
			checkMenuInFolder,

			// Menu
			menuList,
			currentMenuId,
			checkMenuAction,
		} = useMenu();
		const { currentTab, addOrSelectTab } = useTab();

		// Select
		const selectedFolderId = ref("");
		const subFolderList = computed(() =>
			getSubFolderList(selectedFolderId.value),
		);

		// Current
		const currentFolderId = computed(() =>
			mainFolderIds.value.find(folderId =>
				checkMenuInFolder(folderId, currentTab.value),
			),
		);
		const getFolderStyle = computed(() => id => {
			return {
				current: currentFolderId.value === id,
				selected: selectedFolderId.value === id,
			};
		});

		// Menu Icon
		const MENU_ICON = readonly({
			[MENU.ADMIN]: "security1",
			[MENU.ALARM]: "notification",
			[MENU.DC]: "Alternate-Storage",
			[MENU.FACTORY]: "fab2",
			[MENU.MATERIAL]: "fab_item",
			[MENU.POLICY]: "label_setting",
			[MENU.PROCESS]: "line",
			[MENU.SYSTEM]: "check-setting",
			[MENU.USER]: "cir_user2",
		});

		/**
		 * 아이콘 스타일 반환
		 * @param {String} id
		 * @returns {String}
		 */
		function getFolderIcon(id) {
			return `aim aimcons_${MENU_ICON[id]}`;
		}

		/**
		 * Main Folder Icon 선택
		 * @param {String} id
		 */
		function selectfolder(id) {
			if (selectedFolderId.value === id && !isFixed.value) {
				selectedFolderId.value = "";
			} else {
				selectedFolderId.value = id;
			}
		}

		//==================== Menu Tree
		const treeRef = ref(null);
		const { formatTreeNodeByParent } = useTree();
		const { sortItemsByPosition } = useItem();

		// Tree에서 Folder Node는 선택할 수 없다.
		const formatFolderNode = item =>
			formatTreeNodeByParent(item[ID], { selectable: false, ...item });

		// Action Menu Node는 하위 메뉴를 가질 수 없다.
		const formatMenuNode = item =>
			formatTreeNodeByParent(item[ID], { hasChildren: false, ...item });

		const menuListByFolder = computed(() => {
			const nodes = [
				formatFolderNode({ [ID]: selectedFolderId.value }),
				...subFolderList.value.map(formatFolderNode),
				...menuList.value.map(formatMenuNode),
			];
			return sortItemsByPosition(nodes, POSITION); // menuSeq 기준 정렬
		});

		/**
		 * @param {Object} e
		 * @param {Object} e.item
		 */
		function selectMenu({ item }) {
			// Action 메뉴인 경우만 메뉴 선택으로
			if (checkMenuAction(item)) {
				addOrSelectTab(item[ID]);
			}
		}

		// Tab 클릭으로 인해 선택된 메뉴가 변경된 경우, Tree와 동기화
		watch(
			() => currentMenuId.value,
			menuId => {
				treeRef.value.selectedNode = menuId;

				if (!isFixed.value) {
					selectedFolderId.value = "";
				}
			},
		);

		return {
			// Config
			MENU_FIELD,
			NODE_FIELD,
			PARENT_ID,
			ID,
			NAME,
			isFixed,

			// Menu Folder
			folderList,
			mainFolderIds,
			currentFolderId,
			selectedFolderId,
			selectfolder,
			getFolderStyle,
			getFolderIcon,

			// Menu Tree
			treeRef,
			menuListByFolder,
			selectMenu,
		};
	},
};
</script>
