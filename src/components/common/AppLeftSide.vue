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
					<wfl-tooltip :content="id" :position="'TopRight'"
						><span>
							<i
								:class="getFolderIcon(id)"
								style="font-size: 1.4rem; z-index: 10000"
							></i>
						</span>
					</wfl-tooltip>
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
		<FormTree
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
		</FormTree>
	</div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useSystem, useMenu, useTab } from "~/plugins/composables/authority";
import { useTree } from "~/plugins/composables/syncfusionHelper";
import { MENU_ICON } from "~/plugins/wfb-constants.js";

export default {
	name: "AppLeftSide",
	components: {},
	setup() {
		const { systemId } = useSystem();
		const {
			// Folder
			folderList,
			mainFolderIds,
			getSubFolderList,
			checkMenuInFolder,

			// Menu
			MENU,
			menuList,
			currentMenuId,
			checkMenuAction,
		} = useMenu();
		const treeRef = ref(null);
		const { currentTab, addOrSelectTab } = useTab();
		const { formatTreeNodeByParent } = useTree();

		const { ID, PARENT_ID, NAME } = MENU;
		// Menu 고정 여부
		const isFixed = ref(false);

		// Select
		const selectedFolderId = ref("");
		const subFolderList = computed(() =>
			getSubFolderList(selectedFolderId.value, systemId.value),
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

		// Tree에서 Folder Node는 선택할 수 없다.
		const formatFolderNode = item =>
			formatTreeNodeByParent(item[ID], { selectable: false, ...item });

		// Action Menu Node는 하위 메뉴를 가질 수 없다.
		const formatMenuNode = item =>
			formatTreeNodeByParent(item[ID], { hasChildren: false, ...item });

		const menuListByFolder = computed(() => [
			formatFolderNode({ [ID]: selectedFolderId.value }),
			...subFolderList.value.map(formatFolderNode),
			...menuList.value.map(formatMenuNode),
		]);

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
			PARENT_ID,
			ID,
			NAME,
			isFixed,

			// Menu Folder
			folderList,
			mainFolderIds,
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
