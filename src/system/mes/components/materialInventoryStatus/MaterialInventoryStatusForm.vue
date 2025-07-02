<template>
	<div>
		<FormGrid
			ref="Formgrid"
			:customApi="getMaterialListAll"
			:gridId="gridId"
			:menuId="menuId"
			:searchCondition="searchCondition"
			class="mb-3"
			gridTitle="Material Inventory Status"
			@clickHoverCell="clickHoverCell"
			@initGridItems="fetchInitGridItems"
		>
			<template v-slot:grid-button>
				<wfl-dropdownbutton
					ref="dropdownbutton"
					:content="$t(content)"
					:items="actionItems"
					class="btn btn-md btn-default ml-1"
					@select="openModalConfirm"
				></wfl-dropdownbutton>
			</template>
		</FormGrid>
	</div>
</template>

<script>
import { getCurrentInstance, ref, onBeforeMount, computed } from "vue";
import { useFetchData } from "~/plugins/composables/dataHandler";
import { ENUM } from "~/system/mes/constants/mes_meta_constants.js";
import { DATA_STATE, ACTION } from "~/system/mes/constants/mes_constants.js";
import {
	useModalAlert,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";
import { useTab } from "~/plugins/composables/authority";

import * as MATERIAL from "../../api/material.js";
import * as SYSTEM_COMMON from "~/api/system-common.js";

export default {
	name: "MaterialInventoryStatusForm",
	props: {
		searchCondition: { type: Array, default: () => [] },
		gridId: { type: String },
		menuId: { type: String },
	},
	data() {
		return {
			content: "Action",
			MATERIAL,
		};
	},
	setup(props) {
		const { openModalConfirmBy } = useModalConfirm();
		const { openModalWarning } = useModalAlert();
		const { proxy } = getCurrentInstance();
		const { fetchList } = useFetchData();
		const { addOrSelectTab } = useTab();

		const Formgrid = ref(null);
		const actionItems = ref([]);
		const gridItems = ref([]);

		const getMaterialListAll = () =>
			MATERIAL.getListAll(props.searchCondition);

		const applyItems = computed(() => {
			return Formgrid.value.cloneCheckItems();
		});

		async function fetchInitGridItems() {
			const data = await fetchList(() => MATERIAL.getListAll());
			gridItems.value = data;
			Formgrid.value.setGridItems(gridItems.value);
		}
		async function getActionItems() {
			const data = await fetchList(() =>
				SYSTEM_COMMON.getEnumValueList("MaterialActionType"),
			);

			actionItems.value = data.map(item => ({
				text: item[ENUM.VALUE],
				id: item[ENUM.VALUE],
				click: () => clickOrderAction(item[ENUM.VALUE]),
			}));
		}

		async function clickOrderAction(enumValue) {
			let params = { list: applyItems.value };
			await MATERIAL.doAction(params, enumValue);
			await fetchInitGridItems();
		}
		function openModalConfirm(e) {
			let target = actionItems.value.find(i => i.id === e.item.id);
			if (target.id === ACTION.HOLD) {
				if (!validateHoldItems()) {
					openModalWarning("hold State를 확인하세요");
					return;
				}
			}
			if (target.id === ACTION.RELEASE) {
				if (!validateReleaseItems()) {
					openModalWarning("hold State를 확인하세요");
					return;
				}
			}

			if (target) {
				openModalConfirmBy("apply", "Material", applyItems.value, () =>
					target.click(),
				);
			}
		}
		function clickHoverCell(e) {
			addOrSelectTab("MaterialHistory", {
				materialId: e.data.materialId,
			});
		}

		// todo holdeState validation
		function validateHoldItems() {
			return applyItems.value.every(
				item => item.holdState === DATA_STATE.RELEASE,
			);
		}
		function validateReleaseItems() {
			return applyItems.value.every(
				item => item.holdState === DATA_STATE.HOLD,
			);
		}

		onBeforeMount(async () => {
			await getActionItems();
		});

		return {
			proxy,
			Formgrid,
			actionItems,
			fetchInitGridItems,

			clickHoverCell,

			openModalConfirm,
			getMaterialListAll,
		};
	},
	methods: {
		search(searchText) {
			// todo: condition 조건으로 search후 grid 데이터 뿌리기
			console.log(searchText);
		},
		onSelect(e) {
			let target = this.actionItems.find(i => i.id === e.item.id);
			if (target && target.click) {
				target.click();
			}
		},
	},
};
</script>
<style scoped>
:deep(.e-gridcontent) {
	height: calc(50vh + 65px);
}
</style>
