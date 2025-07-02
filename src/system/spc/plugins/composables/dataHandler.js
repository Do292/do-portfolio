import { readonly, ref } from "vue";

const uiFieldList = readonly({
	spec: ["upperSpecLimit", "lowerSpecLimit", "target", "alarmId"],
	control: [
		"upperControlLimit",
		"lowerControlLimit",
		"centerLine",
		"alarmId",
	],
	custom: [
		"upperCustomLimit",
		"lowerCustomLimit",
		"customCenterLine",
		"alarmId",
	],
});
export function useControlChart() {
	const enumList = ref([]);
	const uiControlChartType = ref("Mean");
	const selectedCCN = ref([]);
	function setControlChartType(chartNameList, controlChartType, chartType) {
		enumList.value = chartNameList[chartType];
		selectedCCN.value = [];
		uiControlChartType.value = chartType;
		if (chartType == "Count") {
			selectedCCN.value.push(controlChartType);
		} else {
			for (let { enumValue } of chartNameList[chartType]) {
				if (enumValue === "R") {
					let index = controlChartType.indexOf(enumValue);
					if (
						index != -1 &&
						controlChartType.charAt(index - 1) !== "m"
					) {
						selectedCCN.value.push(enumValue);
					}
				} else {
					if (controlChartType.includes(enumValue)) {
						selectedCCN.value.push(enumValue);
					}
				}
			}
		}
	}
	const defaultMap = ref({
		spec: {
			upperSpecLimit: null,
			lowerSpecLimit: null,
			target: null,
			alarmId: null,
		},
		control: {
			upperControlLimit: null,
			lowerControlLimit: null,
			centerLine: null,
			alarmId: null,
		},
		custom: {
			upperCustomLimit: null,
			lowerCustomLimit: null,
			customCenterLine: null,
			alarmId: null,
		},
	});

	const originData = ref({
		spec: {},
		control: {},
		custom: {},
	});

	function initMapData(type) {
		if (uiControlChartType.value == "Count") {
			return [{ chartName: "NP", ...defaultMap.value[type] }];
		} else if (uiControlChartType.value == "Single") {
			return [{ chartName: "I", ...defaultMap.value[type] }];
		} else {
			return [
				{ chartName: "Raw", ...defaultMap.value[type] },
				{ chartName: "Xbar", ...defaultMap.value[type] },
			];
		}
	}

	function createMapData(chartName, type) {
		const data =
			originData.value[type][chartName] ?? defaultMap.value[type];
		return { [chartName]: data };
	}

	function createUIData(chartName, type) {
		return {
			name: chartName,
			seq: getSeq(chartName),
			fieldList: uiFieldList[type],
		};
	}

	function setMapData(orgData, type) {
		let data = orgData.length > 0 ? orgData : initMapData(type);
		if (type == "spec") {
			const specLimit = data.reduce((acc, cur) => {
				acc[cur["chartName"]] = {
					upperSpecLimit: cur.upperSpecLimit,
					lowerSpecLimit: cur.lowerSpecLimit,
					target: cur.target,
					alarmId: cur.alarmId,
				};
				return acc;
			}, {});
			originData.value.spec = JSON.parse(JSON.stringify(specLimit));
			return specLimit;
		} else if (type == "control") {
			const controlLimit = data.reduce((acc, cur) => {
				acc[cur["chartName"]] = {
					upperControlLimit: cur.upperControlLimit,
					lowerControlLimit: cur.lowerControlLimit,
					centerLine: cur.centerLine,
					alarmId: cur.alarmId,
				};
				return acc;
			}, {});
			originData.value.control = JSON.parse(JSON.stringify(controlLimit));
			return controlLimit;
		} else {
			// custom
			const customLimit = data.reduce((acc, cur) => {
				acc[cur["chartName"]] = {
					upperCustomLimit: cur.upperCustomLimit,
					lowerCustomLimit: cur.lowerCustomLimit,
					customCenterLine: cur.customCenterLine,
					alarmId: cur.alarmId,
				};
				return acc;
			}, {});
			originData.value.custom = JSON.parse(JSON.stringify(customLimit));
			return customLimit;
		}
	}
	function convertData(orgData, type) {
		const list = [];
		if (orgData.length > 0) {
			for (let d of orgData) {
				list.push({
					name: d.chartName,
					seq: getSeq(d.chartName),
					fieldList: uiFieldList[type],
				});
			}
			list.sort((a, b) => a["seq"] - b["seq"]);
		} else {
			if (uiControlChartType.value == "Count") {
				list.push({ name: "NP", seq: 0, fieldList: uiFieldList[type] });
			} else if (uiControlChartType.value == "Single") {
				list.push({ name: "I", seq: 0, fieldList: uiFieldList[type] });
			} else {
				list.push(
					{ name: "Raw", seq: 0, fieldList: uiFieldList[type] },
					{ name: "Xbar", seq: 1, fieldList: uiFieldList[type] },
				);
			}
		}

		return list;
	}

	function getSeq(chartName) {
		const enumData = enumList.value.find(f => f.enumValue === chartName);
		return enumData?.sequence ?? 0;
	}

	return {
		setControlChartType,
		setMapData,
		convertData,
		createMapData,
		createUIData,

		selectedCCN,
	};
}
