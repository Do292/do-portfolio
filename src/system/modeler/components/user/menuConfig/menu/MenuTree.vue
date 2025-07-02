<template>
	<TreeTemplate
		ref="templateRef"
		:treeItems="treeItems"
		class="mt-2"
		@clickItem="$emit('clickMenu', $event)"
		@refresh="fetchTreeItems"
	/>
</template>

<script>
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";

import { ref, watch, onMounted } from "vue";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useTree } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";

import * as TREE from "~/system/modeler/api/tree.js";
import { MENU } from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "MenuTree",
	components: { TreeTemplate },
	props: {
		condition: {
			type: Object,
			default() {
				return {};
			},
		},
	},
	setup({ condition }) {
		//==================== Tree Items
		const treeItems = ref([]);
		const { fetchList } = useFetchData();
		const { formatTreeDTO, groupIntoTreeNodes } = useTree();

		/**
		 * 메뉴 트리를 system id 기준으로 그룹핑
		 */
		async function fetchTreeItems() {
			const dto = formatTreeDTO(MENU);
			const data = await fetchList(() => TREE.getBy(dto));
			treeItems.value = groupIntoTreeNodes(MENU.SYSTEM_ID, data);
		}

		onMounted(fetchTreeItems);

		//==================== Tree Focus
		const templateRef = ref(null);

		watch(
			() => condition.SUPERMENUNAME,
			nodeId => {
				const { selectedNode, focusNode } = templateRef.value;
				// 선행 조건 검증
				if (!nodeId || nodeId !== selectedNode) focusNode(nodeId);
			},
		);

		return { templateRef, treeItems, fetchTreeItems };
	},
};
</script>

<style scoped></style>
