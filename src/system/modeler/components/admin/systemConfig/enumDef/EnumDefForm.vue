<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<GridForm
						:menuId="MENU.ENUM_DEF"
						:tableId="TABLE.ENUM"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectEnum"
					/>
				</template>
				<template v-slot:right>
					<GridForm
						ref="valueRef"
						:condition="selectedEnum"
						:dragging="true"
						:menuId="MENU.ENUM_DEF"
						:tableId="TABLE.ENUM_VALUE"
						@create="openModalCreateValue"
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

import { ref } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";

import { ENUM } from "~/system/modeler/constants/table_constants.js";
import {
	ID,
	MENU,
	TABLE,
	DEFAULT_POSITION,
} from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "EnumDefForm",
	components: {
		GridForm,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== Enum Value
		const valueRef = ref(null);
		const selectedEnum = ref({ [ENUM.NAME]: "" });

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectEnum({ tableId, columns, row = {} }) {
			selectedEnum.value = { [ENUM.NAME]: row[ENUM.NAME] };
			setInformation({ tableId, columns, row });
		}

		/**
		 * @param {Object} config
		 */
		function openModalCreateValue(config) {
			const { length } = valueRef.value.gridItems;
			const readOnlySetting = {
				...selectedEnum.value,
				[ID.POSITION]: length + DEFAULT_POSITION,
			};

			emit("create", config, readOnlySetting);
		}

		return {
			// Config
			MENU,
			TABLE,
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// EnumValue
			valueRef,
			selectedEnum,
			selectEnum,
			openModalCreateValue,
		};
	},
};
</script>
<style></style>
