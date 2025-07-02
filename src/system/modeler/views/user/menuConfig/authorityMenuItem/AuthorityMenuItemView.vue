<template>
	<div>
		<AuthorityMenuItemForm />
	</div>
</template>

<script>
import AuthorityMenuItemForm from "~/system/modeler/components/user/menuConfig/authorityMenuItem/AuthorityMenuItemForm";

export default {
	name: "AuthorityMenuItemView",
	components: {
		AuthorityMenuItemForm,
	},
	setup() {
		return {};
	},
};
</script>
