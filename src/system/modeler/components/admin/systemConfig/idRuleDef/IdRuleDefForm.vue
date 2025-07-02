<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<GridForm
						:menuId="TABLE.ID_RULE_DEF"
						:tableId="TABLE.ID_RULE_DEF"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectIdRule"
					/>
				</template>
				<template v-slot:right>
					<GridForm
						ref="attrRef"
						:condition="idRuleConfig"
						:customPosition="ID_RULE.POSITION"
						:dragging="true"
						:menuId="TABLE.ID_RULE_DEF"
						:tableId="TABLE.ID_RULE_ATTR_DEF"
						@create="openModalCreateAttr"
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
import GridForm from "~/system/modeler/components/common/form/GridForm";

import { ref, computed } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	TABLE,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";
import { ID_RULE } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "IdRuleDefForm",
	components: {
		GridForm,
	},
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { openModalWarning } = useModalAlert();
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== IdRule
		const attrRef = ref(null);
		const selectedIdRule = ref({});
		const idRuleConfig = computed(() => ({
			[ID_RULE.ID]: selectedIdRule.value[ID_RULE.ID],
		}));
		const maxLength = ref(0);

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectIdRule({ tableId, columns, row = {} }) {
			selectedIdRule.value = row;
			setInformation({ tableId, columns, row });
		}

		/**
		 * @param {Object} config
		 */
		function openModalCreateAttr(config) {
			// IdRule 미선택시
			if (!selectedIdRule.value[ID_RULE.ID]) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.ID_RULE_DEF,
				});
				return;
			}

			const attrItems = attrRef.value.gridItems;
			maxLength.value = attrItems.reduce(
				(acc, cur) => acc - cur[ID_RULE.SECTION_LENGTH],
				selectedIdRule.value[ID_RULE.LENGTH],
			);

			// 최대 길이가 0이하이면 추가 불가능
			if (maxLength.value <= 0) {
				openModalWarning("warning.impossibleToAdd");
				return;
			}

			const readOnlySetting = {
				...selectedIdRule.value,
				[ID_RULE.POSITION]: attrItems.length + DEFAULT_POSITION,
			};

			emit("create", config, readOnlySetting);
		}

		return {
			// Config
			TABLE,
			ID_RULE,
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// IdRule
			attrRef,
			selectedIdRule,
			idRuleConfig,
			maxLength,
			selectIdRule,
			openModalCreateAttr,
		};
	},
};
</script>
<style></style>
