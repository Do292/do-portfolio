<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<FormGrid
						ref="enumRef"
						:createApi="ENUM.createEnum"
						:customApi="ENUM.getEnumList"
						:deleteApi="ENUM.deleteEnum"
						:modifyApi="ENUM.modifyEnum"
						gridId="Enum"
						menuId="EnumDef"
						metaDataId="Enum"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectEnum"
					/>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="valueRef"
						:condition="selectedEnum"
						:createApi="ENUM.createEnumValue"
						:customApi="getEnumValueList"
						:deleteApi="ENUM.deleteEnumValue"
						:dragging="true"
						:modifyApi="ENUM.modifyEnumValue"
						gridId="EnumValue"
						menuId="EnumDef"
						metaDataId="EnumValue"
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
import { ref } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";
import { CAMEL_ID } from "~/constants/common_constants.js";
import * as ENUM from "~/api/system-common.js";

export default {
	name: "EnumDefForm",
	components: {},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		const enumRef = ref(null);
		const valueRef = ref(null);
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== Enum Value
		const selectedEnum = ref({ enumName: "" });

		const getEnumValueList = () =>
			ENUM.getEnumValueList(selectedEnum.value.enumName);

		/**
		 * @param {Object} config
		 * @param {String} config.gridId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectEnum({ gridId, columns, row = {} }) {
			selectedEnum.value = { ["enumName"]: row["enumName"] };
			setInformation({ gridId, columns, row });
		}

		/**
		 * @param {Object} config
		 */
		function openModalCreateValue(config) {
			const { length } = valueRef.value.gridItems;
			const readOnlySetting = {
				...selectedEnum.value,
				[CAMEL_ID.SEQUENCE]: length + 1,
			};

			emit("create", config, readOnlySetting);
		}

		return {
			// API
			ENUM,

			// Config
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// Enum
			enumRef,

			// EnumValue
			valueRef,
			selectedEnum,
			selectEnum,
			getEnumValueList,
			openModalCreateValue,
		};
	},
};
</script>
<style></style>
