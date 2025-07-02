<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<!-- <HeaderTemplate
						:headerTitle="'MaterialInventoryStatus'"
					></HeaderTemplate> -->
					<FormSearchCondition
						:conditionId="conditionId"
						:customConditionList="customConditionList"
						@searchClicked="searchClicked"
					></FormSearchCondition>
					<MaterialInventoryStatusForm
						ref="MaterialInventoryStatusForm"
						:gridId="gridId"
						:menuId="menuId"
						:searchCondition="searchCondition"
					></MaterialInventoryStatusForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import * as COMMON from "../../../../api/common";
import { useTableDef } from "~/plugins/composables/tableHandler";

import MaterialInventoryStatusForm from "../../../../components/materialInventoryStatus/MaterialInventoryStatusForm.vue";
// import HeaderTemplate from "../../../../components/common/HeaderTemplate.vue";

export default {
	name: "MaterialInventoryStatusView",
	components: { MaterialInventoryStatusForm },
	data() {
		return {
			customConditionList: [],
		};
	},
	setup() {
		const { fetchGridTableDef, gridTableDef } = useTableDef();
		const gridId = "Material";
		const menuId = "MaterialInventoryStatus";
		const searchCondition = ref([]);

		function searchClicked(condition) {
			searchCondition.value = condition;
		}

		onMounted(async () => {
			await fetchGridTableDef(menuId, gridId);
		});

		const conditionId = computed(
			() => gridTableDef.value.searchConditionId,
		);
		const objectTypeId = computed(() => gridTableDef.value.objectTypeId);

		return {
			searchCondition,
			conditionId,
			objectTypeId,
			gridId,
			menuId,
			searchClicked,
		};
	},
	mounted() {},
	methods: {},
};
</script>
<style scoped></style>
