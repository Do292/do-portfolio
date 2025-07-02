<template>
	<div class="row">
		<div class="col-7 item-title">
			<label> {{ chartTitle }} </label>
		</div>
		<div class="col-5 text-right mt-2">
			<div class="item-box">
				<div class="btn-group">
					<button class="btn btn-md btn-default">
						<i class="aim aimcons_refresh"></i>
					</button>
				</div>
				<div class="btn-group">
					<button class="btn btn-md btn-default">
						<i class="aim aimcons_max-size"></i>
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="card-header pt-1">
		<div class="row fiter-box02">
			<div class="col-12">
				<div class="d-table table-item">
					<div class="d-table-row">
						<div class="d-table-cell">
							<div class="d-table-cell field">ChartType</div>
							<div class="d-table-cell input">
								<ComboQuery
									:id="'controlChartType'"
									:defaultValue="'Mean'"
									:dependency="{}"
									:enabled="chartTypeEnabled"
									:expression="expression"
									:floatLabelType="null"
									:inputMethod="'ChooseOnlyD'"
									:modelValue="controlChartType"
									@update:modelValue="
										setControlChartType($event)
									"
								/>
							</div>
							<div class="d-table-cell input">
								<div v-if="selectedChartType == 'Count'">
									<div
										v-for="(
											{ enumValue }, idx
										) in chartNameList[selectedChartType]"
										:key="idx + '_' + selectedChartType"
										class="d-table-cell ml-2"
									>
										<wfl-radiobutton
											:id="'radio_' + enumValue"
											:ref="'radio_' + enumValue"
											:checked="idx == 0 ? true : false"
											:disabled="!chartNameEnabled"
											:label="enumValue"
											:name="'radio'"
										>
										</wfl-radiobutton>
										<!-- @click="countItemClicked(enumValue)" -->
									</div>
								</div>
								<div v-else>
									<div
										v-for="(
											{ enumValue }, idx
										) in chartNameList[selectedChartType]"
										:key="idx + '_' + selectedChartType"
										class="d-table-cell ml-2"
									>
										<Checkbox
											:disabled="getComponentEnable(idx)"
											:field="enumValue"
											:header="enumValue"
											:modelValue="
												idx == 0 ? true : false
											"
										/>
										<!-- @update:modelValue="checkboxClicked($event, enumValue)" -->
									</div>
								</div>
							</div>
						</div>
						<div
							class="d-table-cell"
							style="border-left: 1px #e0e0e0 solid"
						>
							<slot name="chart-header-button">
								<label> Custom Button 영역 </label>
							</slot>
						</div>
						<div class="d-table-cell right">
							<div class="d-table-cell field">X-Axis</div>
							<div class="d-table-cell input">
								<div class="item-box">
									<div class="btn-group">
										<ButtonBasic
											:class="{ current: isAxisTime }"
											class="btn btn-md btn-chart"
											@onClick="clickXAxis('processTime')"
										>
											<i
												class="aim aimcons_sortbytime"
											></i>
										</ButtonBasic>
										<ButtonBasic
											:class="{ current: !isAxisTime }"
											class="btn btn-md btn-chart"
											@onClick="
												clickXAxis('materialName')
											"
										>
											<i
												class="aim aimcons_sortbyname"
											></i>
										</ButtonBasic>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- <div class="row">
		<div class="col-12">
			<div class="d-table table-item float-right">
				<div class="d-table-row">
					<div class="d-table-cell">
						<div class="d-table-cell field">X-Axis</div>
						<div class="d-table-cell input">
							<div class="item-box">
								<div class="btn-group">
									<ButtonBasic
										:class="{ current: isAxisTime }"
										class="btn btn-md btn-chart"
										@onClick="clickXAxis('processTime')"
									>
										<i class="aim aimcons_sortbytime"></i>
									</ButtonBasic>
									<ButtonBasic
										:class="{ current: !isAxisTime }"
										class="btn btn-md btn-chart"
										@onClick="clickXAxis('materialName')"
									>
										<i class="aim aimcons_sortbyname"></i>
									</ButtonBasic>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div> -->
</template>

<script>
import { ref, computed, onMounted } from "vue";
import * as COMMON from "~/api/system-common.js";

export default {
	name: "FormSpcChartHeader",
	components: {},
	props: {
		chartTitle: { type: String, default: "Chart List" },
		chartTypeEnabled: { type: Boolean, default: true },
		chartNameEnabled: { type: Boolean, default: true },
	},
	emits: ["changeXAxis"],
	setup(props, { emit }) {
		const controlChartType = ref("Mean");
		const expression =
			"SELECT ENUMVALUE as controlChartType FROM ENUMVALUE WHERE ENUMNAME = 'ControlChartType'";
		const chartNameList = ref({ Mean: [], Single: [], Count: [] });

		onMounted(async () => {
			await fetchChartNameList();
		});

		function setControlChartType(ccType) {
			controlChartType.value = ccType;
		}

		function getComponentEnable(idx) {
			if (!props.chartNameEnabled || idx == 0) {
				return true;
			} else {
				return false;
			}
		}

		async function fetchChartNameList() {
			let enumNameList = Object.keys(chartNameList.value);
			for (let enumName of enumNameList) {
				const { data } = await COMMON.getEnumValueList(
					"ControlChartType_" + enumName,
				);
				chartNameList.value[enumName] = data.data;
			}
		}

		const selectedChartType = computed(() => controlChartType.value);

		const isAxisTime = ref(true);
		function clickXAxis(type) {
			if (type === "processTime") {
				isAxisTime.value = true;
			} else {
				isAxisTime.value = false;
			}
			emit("changeXAxis", type);
		}

		return {
			expression,
			controlChartType,
			selectedChartType,
			chartNameList,
			getComponentEnable,
			setControlChartType,

			isAxisTime,
			clickXAxis,
		};
	},
	created() {},
	mounted() {},
	methods: {},
};
</script>
