<template>
	<footer class="main-footer">
		<div class="copyright">
			<b>aim Web UI Framework v1.0.0</b>
			<p>&copy;1997 aim Systems,Inc.</p>
		</div>
		<div v-if="hasMenuRelation" class="footer-btn ml-auto">
			<button
				v-for="menu in menuRelations"
				:key="menu"
				class="btn btn-sm btn-con-fix"
				@click="addOrSelectTab(menu)"
			>
				{{ menu }}
			</button>
		</div>
	</footer>
</template>

<script>
import { computed } from "vue";
import {
	useMenu,
	useTab,
} from "~/system/modeler/plugins/composables/modeler-authority";

export default {
	name: "AppFooter",
	setup() {
		const { menuRelations } = useMenu();
		const { addOrSelectTab } = useTab();

		const hasMenuRelation = computed(() => menuRelations.value?.length > 0);

		return {
			menuRelations,
			hasMenuRelation,
			addOrSelectTab,
		};
	},
};
</script>

<style>
/* Menu Relation */
.footer-btn > .btn + .btn {
	margin-left: 2px;
}
</style>
