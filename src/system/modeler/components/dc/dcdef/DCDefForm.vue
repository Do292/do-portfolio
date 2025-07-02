<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="horizontalConfigs">
				<template v-slot:left>
					<GridForm
						:tableId="TABLE.DC_DEF"
						@clone="openModalCloneDef"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectDCDef"
					></GridForm>
				</template>
				<template v-slot:right>
					<Splitter
						:paneConfigs="verticalConfigs"
						orientation="Vertical"
					>
						<template v-slot:top>
							<GridForm
								:condition="selectedDCDef"
								:needsComboButton="false"
								:needsDefaultFactory="false"
								:tableId="TABLE.DC_DEF_CONDITION"
								@create="openModalCreateCondition"
								@delete="$emit('delete', $event)"
								@modify="$emit('modify', $event)"
								@onSelectionChanged="setInformation"
							></GridForm>
						</template>
						<template v-slot:middle>
							<GridForm
								:condition="selectedDCDef"
								:needsComboButton="false"
								:tableId="TABLE.DC_DEF_ITEM"
								@create="openModalCreateItem"
								@delete="$emit('delete', $event)"
								@modify="$emit('modify', $event)"
								@onSelectionChanged="selectDCDefItem"
							></GridForm>
						</template>
						<template v-slot:bottom>
							<DCSiteForm
								:defaultConfig="selectedDCDefItem"
								:isDisabled="!isDCDefItemValid"
								@apply="openModalConfirmAndModify"
							></DCSiteForm>
						</template>
					</Splitter>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
//import SplitterTemplate from "~/system/modeler/components/common/template/SplitterTemplate";
import GridForm from "~/system/modeler/components/common/form/GridForm";
import DCSiteForm from "~/system/modeler/components/dc/dcdef/DCSiteForm";

import { ref, computed } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useItem,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useModalAlert,
	useModalConfirm,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

import { TABLE, ACTION } from "~/system/modeler/constants/modeler_constants.js";
import {
	DC_DEF,
	DC_DEF_ITEM,
} from "~/system/modeler/constants/table_constants.js";

export default {
	name: "DCDefForm",
	components: {
		//SplitterTemplate,
		GridForm,
		DCSiteForm,
	},
	setup(_, { emit }) {
		//==================== Config
		// Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		// Splitter
		const horizontalConfigs = [
			{ key: "left", size: 40 },
			{ key: "right", size: 70 },
		];
		const verticalConfigs = [
			{ key: "top" },
			{ key: "middle" },
			{ key: "bottom" },
		];

		//==================== DCDef
		const { ID: DC_DEF_ID } = DC_DEF;
		const selectedDCDef = ref({ [DC_DEF_ID]: "" });
		const isDCDefValid = computed(() => !!selectedDCDef.value[DC_DEF_ID]);
		/**
		 * @param {Object} config
		 * @param {Object} config.row
		 */
		function selectDCDef(config) {
			selectedDCDef.value = { [DC_DEF_ID]: config.row[DC_DEF_ID] };
			setInformation(config);
		}

		/**
		 * Def 하위 Condition, Item을 source를 지정해 복제하기 위함.
		 * @param {Object[]} items
		 */
		function openModalCloneDef(items) {
			if (items.length !== 1) {
				openModalWarning("warning.selectOneData");
				return;
			}
			if (!isDCDefValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.DC_DEF,
				});
				return;
			}
			// Target 정의
			emit("clone", selectedDCDef.value);
		}

		//==================== DCDefCondition
		/**
		 * @param {Object} config
		 */
		function openModalCreateCondition(config) {
			if (!isDCDefValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.DC_DEF,
				});
				return;
			}
			const readOnlySetting = { ...selectedDCDef.value };
			emit("create", config, readOnlySetting);
		}

		//==================== DCDefItem
		const { filterItem } = useItem();
		const { DEF_ID, ITEM_ID, SITE_COUNT, SITE_IDS } = DC_DEF_ITEM;
		const selectedDCDefItem = ref(defineDCDefItem({}));
		const isDCDefItemValid = computed(
			() =>
				!!selectedDCDefItem.value[DEF_ID] &&
				!!selectedDCDefItem.value[ITEM_ID],
		);

		/**
		 * @param {Object} config
		 * @param {Object} config.row
		 */
		function selectDCDefItem(config) {
			selectedDCDefItem.value = defineDCDefItem(config.row);
			setInformation(config);
		}

		/**
		 * @param {Object|null} item
		 * @returns {Object}
		 */
		function defineDCDefItem(item = {}) {
			return filterItem(item, [DEF_ID, ITEM_ID, SITE_COUNT, SITE_IDS]);
		}

		/**
		 * @param {Object} config
		 */
		function openModalCreateItem(config) {
			if (!isDCDefValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.DC_DEF,
				});
				return;
			}
			const readOnlySetting = { ...selectedDCDef.value, [SITE_IDS]: "" };
			emit("create", config, readOnlySetting);
		}

		const { modifyList } = useUpdateData();
		const { openModalConfirmBy } = useModalConfirm();
		const { openModalWarning } = useModalAlert();

		function openModalConfirmAndModify(config) {
			if (!selectedDCDefItem.value[DC_DEF_ID]) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.DC_DEF_ITEM,
				});
				return;
			}

			// Confirm 모달 활성화
			openModalConfirmBy(
				ACTION.MODIFY,
				TABLE.DC_DEF_ITEM,
				[config],

				// Apply function
				comment => modifyList(TABLE.DC_DEF_ITEM, [config], comment),
			);
		}

		return {
			// Config
			TABLE,
			isShowInformation,
			infoConfig,
			setInformation,
			horizontalConfigs,
			verticalConfigs,

			// DCDef
			selectedDCDef,
			selectDCDef,
			openModalCloneDef,

			// DCDefCondition
			openModalCreateCondition,

			// DCDefItem
			selectDCDefItem,
			selectedDCDefItem,
			isDCDefItemValid,
			openModalCreateItem,
			openModalConfirmAndModify,
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(.e-pane-vertical.e-scrollable.e-resizable .e-grid) {
	height: calc(100% - 48px) !important;
}
:deep(#right-pane .e-gridcontent) {
	height: calc(100% - 86px) !important;
}
:deep(.e-pane-vertical.e-scrollable.e-resizable .grid-form) {
	height: 100%;
}

/*:deep(.e-pane-vertical.e-scrollable.e-resizable .e-gridcontent) {
	height: calc(100% - 82px) !important;
}*/ /*dylee*/
</style>
