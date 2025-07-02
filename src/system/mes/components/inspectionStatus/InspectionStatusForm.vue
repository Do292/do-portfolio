<template>
	<div class="card-body">
		<FormGrid
			id="lotGridForm"
			ref="lotGridForm"
			:checkbox="false"
			:customItems="lotItems"
			class="mb-3"
			gridId="Material"
			gridTitle="Lot Info"
			menuId="InspectionStatus"
		/>
	</div>
</template>

<script>
import { ref, onBeforeMount } from "vue";
import { useFetchData } from "~/plugins/composables/dataHandler";
// import {
// 	useModalAlert,
// 	useModalConfirm,
// } from "~/plugins/composables/modalHandler";

import * as MATERIAL from "../../api/material.js";

export default {
	name: "InspectionStatusForm",
	data() {
		return {
			MATERIAL,
			isShowConfirmModal: false,
		};
	},
	components: {},
	setup() {
		// const { proxy } = getCurrentInstance();

		// const { openModalWarning } = useModalAlert();

		const { fetchList } = useFetchData();
		const lotItems = ref([]);

		async function getListAll() {
			const data = await fetchList(() => MATERIAL.getListAll());
			lotItems.value = data;
		}
		async function getListByMaterialId(materialId) {
			const data = await fetchList(() =>
				MATERIAL.getListByMaterialId(materialId),
			);
			lotItems.value = data;
		}

		onBeforeMount(async () => {
			await getListAll();
		});

		return { getListAll, getListByMaterialId, lotItems };
	},
	methods: {},
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(100vh - 360px);
}
:deep(.e-grid .e-unboundcelldiv) {
	margin: 0 -17.5px !important;
}
</style>
