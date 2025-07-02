<template>
	<div>
		<Splitter :paneConfigs="paneConfigs">
			<template v-slot:left>
				<InnerScanForm
					ref="scanForm"
					:connectedField="connectedField"
					:modifyFieldList="modifyFieldList"
					:scanFieldList="scanFieldList"
					:useModifyFields="useModifyFields"
					@addDataTo="addDataTo"
					@changeData="changeData"
				></InnerScanForm>
			</template>
			<template v-slot:right>
				<FormGrid
					ref="Formgrid"
					:checkbox="false"
					:customItems="customItems"
					:deleting="true"
					class="ml-3"
					gridId="Material"
					gridTitle="Material Input"
					menuId="MaterialInput"
				>
					<template v-slot:grid-button>
						<ButtonBasic
							:isDisabled="!isApplicable"
							@onClick="openModalConfirm"
						>
							<slot>{{ $t("Apply") }}</slot>
						</ButtonBasic>
					</template>
				</FormGrid>
			</template>
		</Splitter>
	</div>
</template>

<script>
import { getCurrentInstance, ref, computed, onBeforeMount, watch } from "vue";
import { useFetchData } from "~/plugins/composables/dataHandler";
import {
	useModalAlert,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";

import * as MATERIAL from "../../api/material.js";
import * as SYSTEM_COMMON from "~/api/system-common.js";
import InnerScanForm from "../../components/common/InnerScanForm.vue";

export default {
	name: "MaterialInputForm",
	data() {
		return {
			MATERIAL,
			isShowConfirmModal: false,
		};
	},
	components: {
		InnerScanForm,
	},
	setup() {
		const { proxy } = getCurrentInstance();
		//==================== Config
		const paneConfigs = [
			{ key: "left", size: 25, min: 25 },
			{ key: "right", size: 75, min: 60 },
		];

		const { openModalConfirmBy } = useModalConfirm();
		const { openModalWarning } = useModalAlert();

		const { fetchList } = useFetchData();
		const customItems = ref([]);

		// 왼쪽 Fields(Scan, Modify)
		const scanId = ref("MaterialInput.Scan");
		const scanFieldList = ref([]);
		const scanItems = ref([]);
		const modifyId = ref("MaterialInput.Modify");
		const modifyFieldList = ref([]);
		const useModifyFields = ref(true);

		const Formgrid = ref(null);
		const scanForm = ref(null);

		const isApplicable = computed(
			() => Formgrid.value?.gridItems.length !== 0,
		);

		watch(
			() => scanItems.value,
			newValue => {
				customItems.value = newValue;
			},
		);

		async function getObjectField() {
			const data = await fetchList(() =>
				SYSTEM_COMMON.getMetaDataDetail(scanId.value),
			);
			scanFieldList.value = data;

			if (useModifyFields.value == true) {
				const modifyObj = await fetchList(() =>
					SYSTEM_COMMON.getMetaDataDetail(modifyId.value),
				);
				modifyFieldList.value = modifyObj;
			}
		}

		onBeforeMount(async () => {
			await getObjectField();
		});

		/**
		 * Action
		 * addDataTo: materialId/ invoiceNo입력 시 왼쪽 그리드로 추가됨
		 * changeData: target equipmentId를 지정하고 왼쪽 그리드 데이터 수정
		 */
		async function addDataTo() {
			const newItem = scanForm.value.newItem;
			const filteredData = Object.fromEntries(
				Object.entries(newItem).filter(([key, value]) => value !== ""),
			);

			if (Object.keys(filteredData).length === 0) {
				openModalWarning("field값을 입력하세요");
				return;
			}

			const { materialId } = filteredData;
			const { invoiceNo } = filteredData;

			const { data } = materialId
				? await MATERIAL.getListByMaterialId(materialId)
				: await MATERIAL.getListByInvoiceNo(invoiceNo);

			if (validateDuplicates(data.data)) {
				openModalWarning("중복값이 있습니다");
				scanForm.value.resetScanFields();
				return;
			}

			const gridItems = [...Formgrid.value.gridItems, ...data.data];
			scanItems.value = gridItems;

			scanForm.value.resetScanFields();
		}
		function changeData() {
			if (proxy.$isEmpty(customItems)) {
				openModalWarning("materialId를 입력하세요");
				return;
			}

			const modifyItem = scanForm.value.modifyItem;
			if (validateEmpty(modifyItem)) {
				openModalWarning("field값을 입력하세요");
				return;
			}

			customItems.value.every(item => {
				if (validateEmpty(item[Object.keys(modifyItem)])) {
					item[Object.keys(modifyItem)] =
						modifyItem[Object.keys(modifyItem)];

					Formgrid.value.setGridItems(customItems.value);
				}
				openModalWarning("equipmentId가 존재합니다.");
				return;
			});
		}
		function openModalConfirm() {
			if (!validateInputItem()) {
				openModalWarning("materialQuantity, equipmentId 확인하세요");
				return;
			}

			let params = { list: customItems.value };
			openModalConfirmBy("apply", "Material", customItems.value, () =>
				action(params),
			);
		}
		async function action(params) {
			let action = "input";
			const { data } = await MATERIAL.inputItems(params, action);
			if (data.result == "SUCCESS") {
				scanItems.value = [];
			}
		}

		/**
		 * Validation
		 * validateDuplicates: 중복검사
		 * validateEmpty: 빈값검사
		 * validateInputItem: apply시 검사
		 */
		const validateDuplicates = items => {
			const combinedArray = [...items, ...Formgrid.value.gridItems];
			const materialIdSet = new Set(
				combinedArray.map(item => item.materialId),
			);
			const hasDuplicates = combinedArray.length !== materialIdSet.size;
			return hasDuplicates;
		};
		function validateEmpty(data) {
			return proxy.$isEmpty(data);
		}
		function validateInputItem() {
			return customItems.value.every(
				item =>
					item.materialQuantity > 0 &&
					!proxy.$isEmpty(item.equipmentId),
			);
		}

		return {
			paneConfigs,
			customItems,
			scanFieldList,
			modifyFieldList,
			scanItems,
			isApplicable,
			useModifyFields,

			Formgrid,
			scanForm,

			openModalConfirm,
			addDataTo,
			changeData,
		};
	},
	methods: {},
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(100vh - 275px);
}
:deep(.e-grid .e-unboundcelldiv) {
	margin: 0 -17.5px !important;
}
</style>
