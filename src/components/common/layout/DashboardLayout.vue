<template>
	<wfl-dashboardlayout
		:id="id"
		:ref="id"
		:allowDragging="dragging"
		:cellAspectRatio="cellAspectRatio"
		@change="onChangePanel"
	>
		<wfl-panels>
			<wfl-panel
				v-for="panel of panels"
				:key="panel.getKey()"
				v-bind="panel"
			>
			</wfl-panel>
		</wfl-panels>
	</wfl-dashboardlayout>
	<div v-for="panel of panels" :id="panel.getId()" :key="panel.getKey()">
		<slot :name="panel.getKey()"></slot>
	</div>
</template>

<script>
import { computed } from "vue";

import { useTemplate } from "~/plugins/composables/syncfusionHelper";

export default {
	name: "DashboardLayout",
	props: {
		// Dashboard Layout
		id: { type: String, default: "DashboardLayout" },
		cellAspectRatio: { type: Number }, // width / height
		dragging: { type: Boolean },

		// Panel
		panelConfigs: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	emits: ["onMouseover", "onChange"],
	setup(props, { emit }) {
		//==================== Panel
		const { Base } = useTemplate();

		class Panel extends Base {
			constructor({ key, panelId, row }) {
				super(key);

				this.panelId = panelId ?? key;
				// this.col = col;
				this.row = row;
			}
		}

		const panels = computed(() =>
			props.panelConfigs.map(attr => new Panel(attr)),
		);

		function onChangePanel({ changedPanels }) {
			const changes = changedPanels.map(({ panelId, row }) => ({
				id: panelId,
				row,
			}));
			emit("onChange", changes);
		}

		return {
			// Panel
			panels,
			onChangePanel,
		};
	},
};
</script>
