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
					><template v-slot:searchModify
						><div>
							<InputSearch></InputSearch>
						</div> </template
				></InnerScanForm>
			</template>
			<template v-slot:right>
				<GridForm
					ref="gridForm"
					:checkbox="false"
					:customItems="customItems"
					:deleting="true"
					class="ml-3"
					gridId="Material"
					gridTitle="Change Material Properties"
					menuId="ChangeMaterialProperties"
				>
					<template v-slot:grid-button>
						<ButtonBasic
							:isDisabled="!isApplicable"
							@onClick="openModalConfirm"
						>
							<slot>{{ $t("Apply") }}</slot>
						</ButtonBasic>
					</template>
				</GridForm>
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
	name: "ChangeMaterialPropertiesForm",
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
		const scanId = ref("ChangeMaterialProperties.Scan");
		const scanFieldList = ref([]);
		const scanItems = ref([]);
		const modifyId = ref("ChangeMaterialProperties.Modify");
		const modifyFieldList = ref([]);
		const useModifyFields = ref(true);

		const gridForm = ref(null);
		const scanForm = ref(null);

		const isApplicable = computed(
			() => gridForm.value?.gridItems.length !== 0,
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

			const gridItems = [...gridForm.value.gridItems, ...data.data];
			scanItems.value = gridItems;

			scanForm.value.resetScanFields();
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

		// Validation
		const validateDuplicates = items => {
			const combinedArray = [...items, ...gridForm.value.gridItems];
			const materialIdSet = new Set(
				combinedArray.map(item => item.materialId),
			);
			const hasDuplicates = combinedArray.length !== materialIdSet.size;
			return hasDuplicates;
		};
		function validateInputItem() {
			return customItems.value.every(
				item =>
					item.materialQuantity > 0 &&
					proxy.$isEmpty(item.equipmentId),
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

			gridForm,
			scanForm,

			openModalConfirm,
			addDataTo,
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
