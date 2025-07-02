<template>
	<div class="breadcrumb-box">
		<i
			v-if="isUseRootBtn"
			class="aimcons_home selectable breadcrumb"
			@click="clickRoot"
		></i>
		<span
			v-for="(item, index) in validItems"
			:key="index"
			:class="{ selectable: isSelectable }"
			class="breadcrumb"
			@click="beforeClickItem(item)"
		>
			{{ item }}
		</span>
	</div>
</template>

<script>
import { computed } from "vue";
export default {
	name: "Breadcrumb",
	props: {
		items: { type: Array },
		isSelectable: { type: Boolean, default: true },
		isUseRootBtn: { type: Boolean, default: false },
	},
	emits: ["clickItem", "clickRoot"],
	setup(props, { emit }) {
		const validItems = computed(() => props.items.filter(item => item));

		/**
		 * 마지막 요소가 아니면 이벤트 전송
		 * @param {Object} item
		 */
		function beforeClickItem(item) {
			if (props.items.at(-1) !== item) {
				emit("clickItem", item);
			}
		}

		function clickRoot() {
			if (validItems.value.length >= 1) {
				emit("clickRoot");
			}
		}

		return { validItems, beforeClickItem, clickRoot };
	},
};
</script>
