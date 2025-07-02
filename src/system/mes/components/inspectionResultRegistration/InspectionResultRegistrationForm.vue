<template>
	<div class="card-body">
		<GridForm
			id="lotGridForm"
			ref="lotGridForm"
			:checkbox="false"
			:customItems="lotItems"
			:paging="false"
			class="mb-3"
			gridTitle="Lot Info"
			tableId="Material"
		/>
		<Splitter :paneConfigs="horizontalConfigs">
			<template v-slot:left
				><GridForm
					id="specGridForm"
					ref="specGridForm"
					:checkbox="false"
					:customItems="specItems"
					class="mr-3"
					gridTitle="Spec"
					tableId="Material"
				/>
			</template>
			<template v-slot:right
				><GridForm
					id="specDataGridForm"
					ref="specDataGridForm"
					:checkbox="false"
					:customItems="specDataItems"
					class="ml-3"
					gridTitle="Spec Data"
					tableId="Material"
					@onSelectionChanged="selectRow"
				/>
			</template>
		</Splitter>
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
	name: "InspectionResultRegistrationForm",
	data() {
		return {
			MATERIAL,
			isShowConfirmModal: false,
		};
	},
	components: {},
	setup() {
		// const { proxy } = getCurrentInstance();
		//==================== Config
		const horizontalConfigs = [
			{ key: "left", size: 50, min: 25 },
			{ key: "right", size: 50, min: 25 },
		];

		// const { openModalConfirmBy } = useModalConfirm();
		// const { openModalWarning } = useModalAlert();

		const { fetchList } = useFetchData();
		const lotItems = ref([]);
		const specItems = ref([]);
		const specDataItems = ref([]);

		function selectRow() {}

		async function getLotItems(materialId) {
			const { data } = await fetchList(() =>
				MATERIAL.getListByMaterialId(materialId),
			);
			lotItems.value = data;
		}
		// todo  API연결
		async function getSpecItems(materialId) {
			console.log(materialId);
		}
		function getSpecDataItems() {}

		return {
			horizontalConfigs,

			getLotItems,
			getSpecItems,
			getSpecDataItems,
			selectRow,

			lotItems,
			specItems,
			specDataItems,
		};
	},
	methods: {},
};
</script>
<style scoped>
#lotGridForm:deep(.e-gridcontent) {
	height: calc(50vh - 415px);
}
:deep(.e-gridcontent) {
	height: calc(50vh - 50px);
}
:deep(.e-grid .e-unboundcelldiv) {
	margin: 0 -17.5px !important;
}
</style>
