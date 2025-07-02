<template>
	<nav>
		<div class="container-fluid">
			<div class="row">
				<div
					v-for="system of systemList"
					:key="system.id"
					class="col-3 pt-5"
					style="text-align: center !important"
				>
					<wfl-button
						:id="system.id"
						:content="system.content"
						@click="systemClicked(system)"
					></wfl-button>
				</div>
			</div>
		</div>
	</nav>
</template>

<script>
import { useRouter } from "vue-router";
import { useSystem } from "~/plugins/composables/authority";
export default {
	name: "MainView",
	components: {},
	data() {
		return {
			systemList: [
				{ id: "mes", name: "Mes", content: "MES", commonFlag: true },
				{ id: "spc", name: "Spc", content: "SPC", commonFlag: true },
				{ id: "qms", name: "Qms", content: "QMS", commonFlag: true },
				{
					id: "modeler",
					name: "Modeler",
					content: "Modeler",
					commonFlag: false,
				},
				{
					id: "wms",
					name: "WMS",
					content: "WMS",
					commonFlag: false,
					url: "http://192.168.101.117/login",
				},
				{
					id: "rms",
					name: "RMS",
					content: "RMS",
					commonFlag: false,
					url: "http://192.168.101.15/login",
				},
				{
					id: "fmb",
					name: "FMB",
					content: "FMB",
					commonFlag: false,
					url: "http://211.60.157.220:8087/#/login",
				},
				{
					id: "pms",
					name: "PMS",
					content: "PMS",
					commonFlag: false,
				},
				{ id: "fdc", name: "FDC", content: "FDC", commonFlag: true },
				{
					id: "mcs",
					name: "MCS",
					content: "MCS",
					commonFlag: false,
					url: "http://192.168.200.178:3001/login",
				},
				{
					id: "eas",
					name: "EAS",
					content: "EAS",
					commonFlag: false,
					url: "http://192.168.100.16:8088/eas-web/login",
				},
			],
		};
	},
	setup() {
		const router = useRouter();
		const { setSystemInfo } = useSystem();

		function systemClicked(system) {
			if (system.url) {
				window.open(system.url, "_blank");
			} else {
				setSystemInfo({
					id: system.id,
					name: system.name,
					commonFlag: system.commonFlag,
				});
				const path = "/" + system.id.toLowerCase() + "/main";
				router.push({ path });
			}
		}

		return {
			systemClicked,
		};
	},
};
</script>
<style scoped></style>
