<template>
	<div class="breadcrumb-box">
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
	name: "BreadcrumbTemplate",
	props: {
		items: { type: Array },
		isSelectable: { type: Boolean, default: true },
	},
	emits: ["clickItem"],
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

		return { validItems, beforeClickItem };
	},
};
</script>
