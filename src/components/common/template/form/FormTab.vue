<template>
	<div class="row">
		<div class="col-12">
			<slot name="searchCondition"></slot>
		</div>
		<div class="col-12">
			<wfl-tab
				:id="id"
				:ref="id"
				:isMinimumCheck="false"
				:isUseMenu="false"
				:items="tabItems"
				:selectedItem="selectedIndex"
				@clickTab="onClickTab"
				@selected="onSelectedTab"
			>
			</wfl-tab>
		</div>
	</div>
	<slot name="tabContent"></slot>
</template>

<script>
import { computed } from "vue";
export default {
	name: "FormTab",
	props: {
		id: { type: String },
		items: { type: Array },
		selectedIndex: { type: Number, default: 0 },
	},
	emits: ["selectTab", "clickTab"],
	setup(props, { emit }) {
		const tabItems = computed(() => {
			return props.items?.map(item => ({
				header: { text: item },
				content: `#tab-${item}`,
			}));
		});
		function onClickTab({ path }) {
			emit("clickTab", path);
		}
		function onSelectedTab({ selectedIndex: index }) {
			emit("selectTab", { index });
		}

		return {
			tabItems,
			onSelectedTab,
			onClickTab,
		};
	},
};
</script>

<style scoped></style>
