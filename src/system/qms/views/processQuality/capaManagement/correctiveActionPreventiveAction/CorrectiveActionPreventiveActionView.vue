<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">CorrectiveActionPreventiveActionView</div>
			</div>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import { useInformation } from "~/plugins/composables/uiControl";
export default {
	name: "CorrectiveActionPreventiveActionView",
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
