<template>
	<wfl-splitterbasic
		:id="splitterId"
		:height="height"
		:orientation="orientation"
	>
		<wfl-panes>
			<wfl-pane v-for="pane of panes" :key="pane.getKey()" v-bind="pane">
			</wfl-pane>
		</wfl-panes>
	</wfl-splitterbasic>
	<div
		v-for="pane of panes"
		:id="pane.getId()"
		:key="pane.getKey()"
		style="height: 100%"
	>
		<slot :name="pane.getKey()"></slot>
	</div>
</template>

<script>
import { computed } from "vue";

import { useTemplate } from "~/plugins/composables/syncfusionHelper";

export default {
	name: "Splitter",
	components: {},
	props: {
		paneConfigs: {
			type: Array,
			default() {
				return [];
			},
		},
		id: { type: String, default: "Splitter" },
		isCollapsible: { type: Boolean, default: true },
		orientation: { type: String, default: "Horizontal" },
		height: { type: [Number, String] },
	},
	setup(props) {
		//==================== Pane
		const { Base, getIdBy } = useTemplate("pane");
		const splitterId = props.id ?? props.orientation;

		class Pane extends Base {
			constructor({ key, size, min, max }) {
				super(key);

				const defaultSize = 100 / props.paneConfigs.length;
				this.size = formatSize(size ?? defaultSize);
				this.min = formatSize(min ?? defaultSize / 2);
				this.max = formatSize(max ?? defaultSize * 2);
				this.height = "100%";
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
			splitterId,

			// Pane
			panes,
			getIdBy,
		};
	},
};
</script>

<style scoped></style>
