<template>
	<div>
		<MenuForm></MenuForm>
		<!-- @create="openModalCreateAndSetReadOnly"
		@delete="openModalDelete"
		@modify="openModalModify" -->
	</div>
</template>

<script>
import MenuForm from "#/common/components/system/menuConfig/menu/MenuForm";

export default {
	name: "MenuView",
	components: {
		MenuForm,
	},
	setup() {
		return {};
	},
};
</script>
