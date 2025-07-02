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
								v-for="(item, index) of panel.getItems()"
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
	<div v-if="isShowDescription" class="between description-box">
		<div class="mb-1">
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
import { useTemplate } from "~/plugins/composables/syncfusionHelper";
import { useFieldColumn } from "~/plugins/composables/tableHandler";
import { useSystem } from "~/plugins/composables/authority.js";
import { UPPER_ID, CAMEL_ID } from "~/constants/common_constants.js";

export default {
	name: "Accordion",
	props: {
		panelConfig: { type: Object },
		isShowDescription: { type: Boolean, default: true },

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
		const { systemInfo } = useSystem();
		const ID = systemInfo.commonFlag ? CAMEL_ID : UPPER_ID;

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
<style scoped></style>
