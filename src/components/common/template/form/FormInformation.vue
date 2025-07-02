<template>
	<div class="info-container02">
		<div class="info-btn2" title="Information" @click="toggleInformation">
			<i :class="arrowClass"></i>
		</div>
		<div v-show="isShowInformation" class="infor-box">
			<div id="info-container02">
				<div class="row info-header">
					<div class="col-9 p-0">
						<label class="info-label text-left">
							{{ $t("common.information") }}
						</label>
					</div>
					<div class="col-3 text-right">
						<ButtonPin
							v-model="isFixedPin"
							class="btn-pin btn-sm mb-2"
						/>
					</div>
				</div>
				<div>
					<Accordion :panelConfig="panelConfig">
						<template v-slot:item="{ field, headerText }">
							<div class="d-table-cell field">
								{{ headerText }}
							</div>
							<div class="d-table-cell input">
								<span>{{ item[field] }}</span>
							</div>
						</template>
					</Accordion>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, watch, computed } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { useFieldColumn } from "~/plugins/composables/tableHandler";

export default {
	name: "FormInformation",
	components: {},
	props: { config: { type: Object } },
	setup(props) {
		//==================== Layout
		const { isShowInformation, isFixedPin, toggleInformation } =
			useInformation();
		const { checkColumnVisible } = useFieldColumn();

		const arrowClass = computed(() => {
			const direction = isShowInformation.value ? "right" : "left";
			return `aim aimcons_arrow_${direction}`;
		});

		//==================== Config
		const item = computed(() => props.config.row);
		const panelConfig = ref({});

		watch(
			() => props.config.gridId || props.config.tableId,
			key => {
				panelConfig.value = {
					[key]: props.config.columns.filter(f =>
						checkColumnVisible(f),
					),
				};
			},
		);

		return {
			// Layout
			isShowInformation,
			isFixedPin,
			toggleInformation,
			arrowClass,

			// Config
			panelConfig,
			item,
		};
	},
};
</script>
<style scoped></style>
