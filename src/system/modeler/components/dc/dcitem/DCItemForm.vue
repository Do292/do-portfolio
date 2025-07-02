<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="horizontalConfigs">
				<template v-slot:left>
					<div class="row">
						<div class="col-8 pt-2 item-title">
							<label>Equipment</label>
							<BreadcrumbTemplate
								:isSelectable="false"
								:items="[userFactory]"
							/>
						</div>
						<div class="col-4 text-right mt-2">
							<div class="item-box right-space">
								<ButtonCombo
									:items="[ACTION.CLONE]"
									:needsAuthority="true"
									@onSelect="openModalCloneItem"
								/>
							</div>
						</div>
					</div>
					<TreeTemplate
						ref="treeRef"
						:treeItems="treeItems"
						@clickItem="selectEquipment"
						@refresh="fetchTreeItems"
					/>
				</template>
				<template v-slot:right>
					<GridForm
						:condition="selectedEquipment"
						:tableId="TABLE.DC_ITEM"
						@create="openModalCreateItem"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="setInformation"
					/>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import TreeTemplate from "~/system/modeler/components/common/template/TreeTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import ButtonCombo from "~/system/modeler/components/common/button/ButtonCombo";

import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref, computed, watch, onMounted } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useUserInfo } from "~/system/modeler/plugins/composables/modeler-authority";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import * as TREE from "~/system/modeler/api/tree.js";

import { DC_ITEM } from "~/system/modeler/constants/table_constants.js";
import {
	ID,
	TABLE,
	ACTION,
} from "~/system/modeler/constants/modeler_constants.js";

import {
	FACTORY,
	FACTORY_TABLE,
	FACTORY_ID_CONFIG,
} from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "DCItemForm",
	components: {
		TreeTemplate,
		BreadcrumbTemplate,
		GridForm,
		ButtonCombo,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		// Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		// Splitter
		const horizontalConfigs = [
			{ key: "left", size: 20, min: "280px" },
			{ key: "right", size: 80, min: 50 },
		];

		// Tab
		// TODO DC Virtual Item 추가
		const tabNames = [TABLE.DC_ITEM];

		// Modal Alert
		const { openModalWarning } = useModalAlert();

		//==================== Factory Tree
		const treeRef = ref(null);
		const treeItems = ref([]);

		const { EQUIPMENT } = FACTORY_TABLE;
		const { EQUIPMENT_ID } = FACTORY_ID_CONFIG;
		const { userFactory } = useUserInfo();
		const { assignDataState, fetchList } = useFetchData();
		const { filterItem } = useItem();

		// default factory 변경 시 초기화
		watch(
			() => userFactory.value,
			() => {
				fetchTreeItems();
				selectedEquipment.value = defineEquipment({});
			},
		);

		/**
		 * 머신 트리 데이터 할당
		 */
		async function fetchTreeItems() {
			const param = assignDataState({
				[ID.FACTORY_ID]: userFactory.value,
			});
			const data = await fetchList(() => TREE.getFactory(param));
			treeItems.value = data.map(item =>
				Object.assign({ expanded: true }, item),
			);
			formatTreeItem(treeItems.value);
		}

		/**
		 * 재귀적으로 트리 데이터를 변환한다.
		 * @param {Object} items
		 */
		function formatTreeItem(items) {
			for (const item of items) {
				if (item[FACTORY.TYPE] !== EQUIPMENT.toUpperCase()) {
					item.selectable = false;
				}
				formatTreeItem(item.CHILD_NODE);
			}
		}

		const selectedEquipment = ref(defineEquipment({}));
		const isEquipmentValid = computed(
			() => !!selectedEquipment.value[EQUIPMENT_ID],
		);

		/**
		 * @param {Object} config
		 * @param {Object} config.item
		 */
		function selectEquipment({ item }) {
			selectedEquipment.value = defineEquipment(item);
		}

		function defineEquipment(item) {
			return filterItem(item, [EQUIPMENT_ID]);
		}

		onMounted(async () => {
			await fetchTreeItems();
		});

		//==================== DC Item
		const { CONDITION_ID } = DC_ITEM;

		/**
		 * @param {Object} config
		 */
		function openModalCreateItem(config) {
			if (!isEquipmentValid.value) {
				openModalWarning("warning.selectRowData", {
					param: EQUIPMENT,
				});
				return;
			}

			const readOnlySetting = {
				...selectedEquipment.value,
				[CONDITION_ID]: selectedEquipment.value[EQUIPMENT_ID],
			};

			emit("create", config, readOnlySetting);
		}

		function openModalCloneItem() {
			if (!isEquipmentValid.value) {
				openModalWarning("warning.selectRowData", {
					param: EQUIPMENT,
				});
				return;
			}
			// Target 정의
			emit("clone", selectedEquipment.value);
		}

		return {
			// Config
			TABLE,
			ACTION,
			isShowInformation,
			infoConfig,
			setInformation,
			horizontalConfigs,
			userFactory,
			tabNames,

			// Factory Tree
			treeRef,
			treeItems,
			fetchTreeItems,
			selectEquipment,
			selectedEquipment,
			defineEquipment,

			// DC Item
			openModalCreateItem,
			openModalCloneItem,
		};
	},
};
</script>
<style scoped>
/* Treeview */
:deep(.e-treeview .e-prevent > .e-text-content) {
	cursor: default;
}
:deep(.e-treeview .e-prevent > .e-text-content .e-icons) {
	cursor: pointer;
}
:deep(#tree-container),
:deep(#tree-container > .tree-header) {
	margin-top: 6px !important;
}
:deep(#tree-container > .tree-body) {
	height: calc(100vh - 225px);
}
</style>
