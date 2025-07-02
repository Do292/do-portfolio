<template>
	<div class="filter-container">
		<div v-show="isShowFilter" class="filter-box">
			<div id="filter-container">
				<div class="row filter-header">
					<div class="col-7 p-0">
						<label class="filter-label text-left"
							>Search Condition</label
						>
					</div>
					<div class="col-5 text-right">
						<button class="btn btn-sm btn-refresh02">
							<i class="aim aimcons_refresh"></i>
						</button>
						<ButtonPin
							v-model="isFixedFilterPin"
							class="btn-pin btn-sm mb-2"
						/>
					</div>
				</div>

				<div class="filter-container02 scroll-auto">
					<div class="filter-card">
						<div class="row filter-content-header">
							<label>
								{{ panelConfig.menuId }} /
								{{ panelConfig.conditionId }}
							</label>
						</div>
						<div class="filter-content">
							<div class="d-table table-item w100">
								<div class="d-table-row">
									<div class="item-label required">
										Text 1
									</div>
									<Textbox
										:enabled="true"
										:field="'text1'"
										:floatLabelType="'Never'"
										:multiline="true"
									/>
								</div>
								<div class="d-table-row">
									<div class="item-label">Combo 1</div>
									<ComboQuery
										:expression="'N|Y'"
										:floatLabelType="'Never'"
										:inputMethod="'ChooseOnlyC'"
									/>
								</div>
								<div class="d-table-row">
									<div class="item-label">Numeric</div>
									<Numericbox :min="0" />
								</div>
								<div class="d-table-row">
									<div class="item-label">DateTime</div>
									<DatePicker
										:hasTime="true"
										:timeType="'Date'"
									/>
									<DatePicker
										:hasTime="true"
										:timeType="'Date'"
									/>
								</div>
								<div class="d-table-row">
									<div class="item-label">DateTime2</div>
									<div>
										<DatePicker
											:hasTime="false"
											:timeType="'Date'"
										/>
									</div>
								</div>

								<slot name="customSearchCondition"></slot>
							</div>
						</div>
					</div>
					<div class="filter-card">
						<div class="row filter-content-header">
							<label>
								{{ panelConfig.menuId }} /
								{{ panelConfig.conditionId }}
							</label>
						</div>
						<div class="filter-content">
							<div class="d-table table-item w100">
								<div class="d-table-row">
									<div class="item-label required">
										Text 1
									</div>
									<Textbox
										:enabled="true"
										:field="'text1'"
										:floatLabelType="'Never'"
										:multiline="true"
									/>
								</div>
								<div class="d-table-row">
									<div class="item-label">Combo 1</div>
									<ComboQuery
										:expression="'N|Y'"
										:floatLabelType="'Never'"
										:inputMethod="'ChooseOnlyC'"
									/>
								</div>
								<div class="d-table-row">
									<div class="item-label">Numeric</div>
									<Numericbox :min="0" />
								</div>
								<div class="d-table-row">
									<div class="item-label">DateTime</div>
									<DatePicker
										:hasTime="true"
										:timeType="'Date'"
									/>
									<DatePicker
										:hasTime="true"
										:timeType="'Date'"
									/>
								</div>
								<div class="d-table-row">
									<div class="item-label">DateTime2</div>
									<div>
										<DatePicker
											:hasTime="false"
											:timeType="'Date'"
										/>
									</div>
								</div>

								<slot name="customSearchCondition"></slot>
							</div>
						</div>
					</div>
				</div>
				<div class="item-box-button02">
					<button class="btn btn-md btn-bottom-search">Search</button>
				</div>
			</div>
		</div>
		<div class="filter-btn" title="Filter" @click="toggleFilter">
			<i class="aim aimcons_filter_1"></i>
		</div>
	</div>
</template>

<script>
import { watch, computed } from "vue";
import { useFilter } from "~/plugins/composables/uiControl";

export default {
	name: "FormFilter",
	components: {},
	props: { config: { type: Object } },
	setup(props) {
		//==================== Layout
		const { isShowFilter, isFixedFilterPin, toggleFilter } = useFilter();

		//==================== Config
		const panelConfig = computed(() => props.config);

		watch(
			() => props.config.conditionId,
			conditionId => {
				console.log(conditionId);
				console.log(props.config);
			},
		);

		return {
			// Layout
			isShowFilter,
			isFixedFilterPin,
			toggleFilter,

			panelConfig,
		};
	},
};
</script>
<style scoped></style>
