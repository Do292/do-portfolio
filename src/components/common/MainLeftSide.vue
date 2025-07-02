<template>
	<div class="main-sidebar close">
		<div class="sidebar text-center p-2">
			<div
				v-for="{ MENUNAME } of menuList"
				:key="MENUNAME"
				:class="{ selected: selectedMainMenu === MENUNAME }"
				class="main-menu text-center pt-3 pb-3"
				@click="selectMainMenu(MENUNAME)"
			>
				<span>
					<img :src="getIconPath(MENUNAME)" />
				</span>
			</div>
		</div>
	</div>
	<div v-show="hasTree" :class="{ on: hasTree }" class="sub-menu">
		<FormTree
			ref="treeRef"
			:hasHeader="false"
			:treeItems="subMenuTree"
			sortOrder="None"
			@clickItem="selectMenu"
		/>
	</div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useMenu, useTab } from "~/plugins/composables/authority";
import { UPPER_ID } from "~/constants/common_constants.js";

export default {
	name: "MainLeftSide",
	components: {},
	setup() {
		//==================== Menu Tree
		const sideRef = ref(null);
		const treeRef = ref(null);
		const { menuList, currentMenuId, checkMenuAction } = useMenu();
		const { addOrSelectTab } = useTab();

		function selectMenu({ item }) {
			// Action 메뉴인 경우만 메뉴 선택으로
			if (checkMenuAction(item)) {
				addOrSelectTab(item[UPPER_ID.MENUNAME]);
			}
		}

		watch(
			() => currentMenuId.value,
			menuId => {
				treeRef.value.selectedNode = menuId;
			},
		);

		//==================== Main Menu
		const selectedMainMenu = ref("");
		const subMenuTree = computed(() =>
			menuList.value
				.filter(({ MENUNAME }) => MENUNAME === selectedMainMenu.value)
				.map(menu => ({ ...menu, selectable: false, expanded: true })),
		);
		const hasTree = computed(() => subMenuTree.value.length > 0);

		function getIconPath(name) {
			return `/assets/images/menu/main/${name}.svg`;
		}

		function selectMainMenu(name) {
			if (selectedMainMenu.value === name) {
				selectedMainMenu.value = "";
			} else {
				selectedMainMenu.value = name;
			}
		}

		return {
			sideRef,
			treeRef,
			menuList,
			selectMenu,
			subMenuTree,
			hasTree,
			selectedMainMenu,
			selectMainMenu,
			getIconPath,
		};
	},
};
</script>

<style></style>
