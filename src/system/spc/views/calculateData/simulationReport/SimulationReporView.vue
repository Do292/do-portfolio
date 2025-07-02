<template>
	<div>
		<ModalReport
			v-if="isShowModalReport"
			:item="item"
			@close="isShowModalReport = false"
		></ModalReport>
		<SimulationReportForm @report="openReportModal"></SimulationReportForm>
	</div>
</template>

<script>
import SimulationReportForm from "#/spc/components/calculateData/simulationReport/SimulationReportForm.vue";
import ModalReport from "#/spc/components/calculateData/simulationReport/ModalReport.vue";
import { ref } from "vue";

export default {
	name: "SimulationReporView",
	components: { SimulationReportForm, ModalReport },
	mounted() {},
	setup() {
		const isShowModalReport = ref(false);
		const item = ref({});

		function openReportModal(data) {
			item.value = data;
			isShowModalReport.value = true;
		}

		return {
			isShowModalReport,
			item,

			openReportModal,
		};
	},
};
</script>
<style scoped></style>
