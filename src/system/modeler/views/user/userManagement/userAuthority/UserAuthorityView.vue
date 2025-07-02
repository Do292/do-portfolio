<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<UserAuthorityForm @setInformation="setInformation" />
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import UserAuthorityForm from "~/system/modeler/components/user/userManagement/userAuthority/UserAuthorityForm";

import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";

export default {
	name: "UserAuthorityView",
	components: { UserAuthorityForm },
	setup() {
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		return {
			isShowInformation,
			infoConfig,
			setInformation,
		};
	},
};
</script>
<style></style>
