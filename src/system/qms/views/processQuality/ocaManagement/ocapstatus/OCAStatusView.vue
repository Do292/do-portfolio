<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">OCAStatusView</div>
			</div>
		</div>
		<form :config="infoConfig" />
	</div>
</template>

<script>
import { useInformation } from "~/plugins/composables/uiControl";
export default {
	name: "OCAStatusView",
	components: {},
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		return {
			// Config
			isShowInformation,
			infoConfig,
			setInformation,
		};
	},

	mounted() {},
	methods: {},
};
</script>
<style scoped></style>
