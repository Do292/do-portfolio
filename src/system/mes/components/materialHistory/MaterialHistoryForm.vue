<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<FormGrid
						ref="gridRef"
						:checkbox="false"
						:customApi="getMaterialHistoryList"
						:gridId="gridId"
						:menuId="menuId"
						:searchCondition="searchCondition"
						class="mb-3"
						gridTitle="Material History"
					>
					</FormGrid>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref } from "vue";
import * as MATERIAL from "../../api/material.js";

export default {
	name: "MaterialHistoryForm",
	props: {
		searchCondition: { type: Array, default: () => [] },
		gridId: { type: String },
		menuId: { type: String },
	},
	setup(props) {
		const gridRef = ref(null);
		const gridItems = ref([]);
		const getMaterialHistoryList = () =>
			MATERIAL.getListByMap(props.searchCondition);

		return {
			// Grid
			gridRef,
			gridItems,
			getMaterialHistoryList,
		};
	},
	methods: {},
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(50vh);
}
</style>
