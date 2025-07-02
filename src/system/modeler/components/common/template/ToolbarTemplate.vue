<template>
	<ejs-toolbar id="toolbar" ref="toolbarRef" overflowMode="Scrollable">
		<e-items>
			<template v-for="item in toolbarItems" :key="item.getKey()">
				<slot :name="item.getKey()" v-bind="item">
					<e-item v-bind="item"></e-item>
				</slot>
			</template>
		</e-items>
	</ejs-toolbar>
</template>

<script>
import {
	ToolbarComponent,
	ItemsDirective,
	ItemDirective,
} from "@syncfusion/ej2-vue-navigations";

import { ref, computed } from "vue";
import {
	useTemplate,
	useIcon,
} from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useNaming } from "~/system/modeler/plugins/composables/modeler-locale";

export default {
	name: "ToolbarTemplate",
	components: {
		"ejs-toolbar": ToolbarComponent,
		"e-items": ItemsDirective,
		"e-item": ItemDirective,
	},
	props: {
		itemGroups: { type: Array },
	},
	setup(props) {
		//==================== Toolbar Item
		const toolbarRef = ref(null);
		const { Base } = useTemplate();
		const { getIconStyle } = useIcon();
		const { snakeToPascal } = useNaming();

		class ToolbarItem extends Base {
			constructor(key) {
				super(key);

				this.prefixIcon = getIconStyle(key);
				this.text = snakeToPascal(key);
			}

			/**
			 * @param {Boolean} active
			 */
			activate(active) {
				toolbarRef.value.enableItems(this.index, active);
			}
		}

		const SEPARATOR = "Separator";

		class ToolbarSeparator extends Base {
			constructor(index) {
				const key = `${SEPARATOR}-${index}`;
				super(key);

				this.type = SEPARATOR;
			}
		}

		const toolbarItems = computed(() =>
			props.itemGroups.flatMap((group, index) => [
				...group.map(type => new ToolbarItem(type)),
				new ToolbarSeparator(index),
			]),
		);

		return {
			toolbarRef,
			toolbarItems,
		};
	},
};
</script>

<style scoped>
#toolbar :deep(.e-toolbar-items),
#toolbar :deep(.e-toolbar-items .e-tbar-btn) {
	background: white !important;
}
</style>
