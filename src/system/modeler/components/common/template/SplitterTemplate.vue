<template>
	<wfl-splitterbasic :id="orientation" :orientation="orientation">
		<wfl-panes>
			<wfl-pane v-for="pane in panes" :key="pane.getKey()" v-bind="pane">
			</wfl-pane>
		</wfl-panes>
	</wfl-splitterbasic>
	<div v-for="pane in panes" :id="pane.getId()" :key="pane.getKey()">
		<slot :name="pane.getKey()"></slot>
	</div>
</template>

<script>
import { computed } from "vue";

import { useTemplate } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";

export default {
	name: "SplitterTemplate",
	props: {
		paneConfigs: {
			type: Array,
			default() {
				return [];
			},
		},
		isCollapsible: { type: Boolean, default: true },
		orientation: { type: String, default: "Horizontal" },
	},
	setup(props) {
		//==================== Pane
		const { Base, getIdBy } = useTemplate("pane");

		class Pane extends Base {
			constructor({ key, size, min, max }) {
				super(key);

				const defaultSize = 100 / props.paneConfigs.length;
				this.size = formatSize(size ?? defaultSize);
				this.min = formatSize(min ?? defaultSize / 2);
				this.max = formatSize(max ?? defaultSize * 2);
				this.collapsible = props.isCollapsible;
			}
		}

		/**
		 * @param {Number|String} size
		 * @returns {String}
		 */
		function formatSize(size) {
			return typeof size === "number" ? `${size}%` : size;
		}

		const panes = computed(() =>
			props.paneConfigs.map(attr => new Pane(attr)),
		);

		return {
			// Pane
			panes,
			getIdBy,
		};
	},
};
</script>

<style scoped>
:deep(#Vertical) {
	height: calc(100vh - 140px) !important;
	overflow: hidden;
}
:deep(#Vertical .e-pane > div) {
	height: 100%;
}
:deep(.e-split-bar) {
	max-height: calc(100vh - 158px);
}
</style>
