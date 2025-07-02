<template>
	<div class="info-container scroll-auto">
		<wfl-accordion>
			<wfl-accordionitems>
				<wfl-accordionitem
					v-for="panel in panels"
					:key="panel.getKey()"
					v-bind="panel"
				>
					<template v-slot:[panel.content]>
						<div class="d-table table-item w100">
							<div
								v-for="(item, index) in panel.getItems()"
								:key="index"
								:class="{ required: checkColumnRequired(item) }"
								class="d-table-row"
								@click="selectItem(item)"
							>
								<slot name="item" v-bind="item"></slot>
							</div>
						</div>
					</template>
				</wfl-accordionitem>
			</wfl-accordionitems>
		</wfl-accordion>
	</div>
	<div class="between description-box">
		<div>
			<label>
				{{ selectedItem.title }}
			</label>
		</div>
		<div class="text-area">
			{{ selectedItem.description }}
		</div>
	</div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useTemplate } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";
import { useFieldColumn } from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "PanelTemplate",
	props: {
		panelConfig: { type: Object },

		// content(=template slot) name과 혼선 주의
		getHeader: {
			type: Function,
			default(key) {
				return key;
			},
		},
	},
	setup(props) {
		//==================== Panel
		const { Base } = useTemplate("panel");

		class Panel extends Base {
			constructor(key) {
				super(key);

				this.header = props.getHeader(key);
				this.expanded = true;
			}

			/**
			 * @returns {Object[]}
			 */
			getItems() {
				return props.panelConfig[this.getKey()];
			}
		}

		const panels = computed(() =>
			Object.keys(props.panelConfig).map(key => new Panel(key)),
		);

		//==================== Etc
		const selectedItem = ref({ title: "", description: "" });
		const { checkColumnRequired } = useFieldColumn();

		/**
		 * @param {Object|null} item
		 */
		function selectItem(item = {}) {
			selectedItem.value.title = item.headerText ?? item.field ?? "";
			selectedItem.value.description = item[ID.DESCRIPTION] ?? "";
		}

		watch(
			() => props.panelConfig,
			() => selectItem(),
		);

		return {
			// Panel
			panels,

			// Etc
			selectedItem,
			selectItem,
			checkColumnRequired,
		};
	},
};
</script>
<style scoped>
/* Layout */

/* Input */

:deep(.required .item-field::after),
:deep(.required .e-float-text::after) {
	position: relative;
	content: "\ea07";
	font-family: aimcons;
	color: #fd7e14;
	padding-left: 4px;
	font-size: 12px;
}
:deep(.required .e-float-text.e-label-top::after) {
	padding-left: 3px;
}
:deep(.required .e-disabled .e-float-text.e-label-top::after) {
	background: none;
	-webkit-text-fill-color: #fd7e14 !important;
}
</style>
