<template>
	<div class="card-header pt-1">
		<div class="row fiter-box02">
			<div class="col-12">
				<div class="d-table table-item">
					<div class="d-table-row">
						<div
							v-for="column in configs"
							:key="column[FIELD]"
							class="d-table-cell"
						>
							<div class="d-table-cell field">
								{{ $t(column[FIELD]) }}
							</div>
							<div class="d-table-cell input">
								<slot :name="column[FIELD]">
									<InputText
										ref="inputRefs"
										v-model="condition[column[FIELD]]"
										floatLabelType="Never"
										@keydown.enter="
											$emit('search', condition)
										"
									/>
								</slot>
							</div>
						</div>
						<div class="btn-area">
							<button
								class="btn btn-search"
								@click="$emit('search', condition)"
							>
								<i class="aim aimcons_search"> </i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import InputText from "~/system/modeler/components/common/input/InputText";

import { ref, watch } from "vue";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useFields } from "~/system/modeler/plugins/composables/modeler-tableHandler";
import { ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "HeaderTemplate",
	components: {
		InputText,
	},
	props: {
		configs: {
			type: Array,
			default() {
				return [];
			},
		},

		// Label
		floatLabelType: { type: String, default: "Always" },
	},
	emits: ["search"],
	setup(props) {
		const { FIELD, LABEL } = ID;
		const { extractFields } = useFields();
		const { createItem } = useItem();
		const condition = ref({});
		const inputRefs = ref([]);

		watch(
			() => props.configs,
			() => {
				condition.value = createItem(extractFields(props.configs));
			},
		);

		return { FIELD, LABEL, condition, inputRefs };
	},
};
</script>
