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
						:menuId="menuId"
						@searchClicked="searchClicked"
					></FormSearchCondition>
					<MaterialHistoryForm
						ref="MaterialHistoryForm"
						:gridId="gridId"
						:menuId="menuId"
						:searchCondition="searchCondition"
					></MaterialHistoryForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { computed, onMounted } from "vue";
import MaterialHistoryForm from "../../../../components/materialHistory/MaterialHistoryForm.vue";
import { useTableDef } from "~/plugins/composables/tableHandler";

export default {
	name: "MaterialHistoryView",
	components: { MaterialHistoryForm },
	setup() {
		const { fetchGridTableDef, gridTableDef } = useTableDef();
		const gridId = "MaterialHistory";
		const menuId = "MaterialHistory";

		onMounted(async () => {
			await fetchGridTableDef(menuId, gridId);
		});

		const conditionId = computed(
			() => gridTableDef.value.searchConditionId,
		);
		const objectTypeId = computed(() => gridTableDef.value.objectTypeId);

		return { conditionId, objectTypeId, gridId, menuId };
	},
	data() {
		return {
			searchCondition: [],
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		init() {},

		searchClicked(condition) {
			// condition 조건으로 searchAPI 후 grid 뿌리기 customItems
			this.searchCondition = condition;
		},
	},
};
</script>
<style scoped></style>
