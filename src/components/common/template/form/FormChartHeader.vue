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
							<div class="d-table-cell">
								<div class="item-box">
									<div class="btn btn-md btn-default">
										x-bar
									</div>
									<div class="btn btn-md btn-default">S</div>
									<div class="btn btn-md btn-default">R</div>
									<div class="btn btn-md btn-default">
										Uni
									</div>
									<div class="btn btn-md btn-default">mR</div>
								</div>
							</div>
						</div>
						<div
							class="d-table-cell"
							style="border-left: 1px red solid"
						>
							<div class="d-table-cell field pl-4">Point</div>
							<div class="d-table-cell input">
								<span
									class="e-input-group e-control-wrapper e-ddl"
									><input
										id="combobox"
										placeholder="none" /><span
										class="e-input-group-icon e-ddl-icon e-search-icon"
									></span
								></span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="col-12">
		<div class="d-table table-item float-right">
			<div class="d-table-row">
				<div class="d-table-cell">
					<div class="d-table-cell field">X-Axis</div>
					<div
						class="d-table-cell"
						style="padding-right: 0px !important"
					>
						<div class="item-box">
							<div class="btn-group">
								<div class="btn btn-md btn-default">
									<i class="aim aimcons_refresh"></i>
								</div>
								<div class="btn btn-md btn-default">
									<i class="aim aimcons_refresh"></i>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import * as COMMON from "~/api/system-common.js";
import { ref, computed, onMounted } from "vue";
export default {
	name: "FormChartHeader",
	components: {},
	props: {
		chartTitle: { type: String, default: "Chart List" },
		xAxisRadioItmes: { type: Array },
		chartTypeEnabled: { type: Boolean, default: true },
	},
	setup(props) {
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
			if (!props.chartTypeEnabled || idx == 0) {
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

		return {
			expression,
			controlChartType,
			selectedChartType,
			chartNameList,
			getComponentEnable,
			setControlChartType,
		};
	},
	created() {},
	mounted() {},
	methods: {
		radioButtonClicked(field, type) {
			this.$emit("xAxisRadioButtonClicked", { field: field, type: type });
		},
	},
};
</script>
