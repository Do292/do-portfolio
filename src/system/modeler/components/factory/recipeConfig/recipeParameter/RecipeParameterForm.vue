<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<GridForm
						:checkbox="false"
						:condition="recipeConfig"
						menuId="RecipeParameter"
						tableId="Recipe"
						@clone="openModalCloneParameter"
						@onSelectionChanged="selectRecipe"
					>
						<template v-slot:grid-path>
							<span></span>
						</template>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</GridForm>
				</template>
				<template v-slot:right>
					<GridForm
						:condition="selectedRecipe"
						:needsComboButton="false"
						menuId="RecipeParameter"
						tableId="RecipeParameter"
						@clone="openModalCloneParameter"
						@create="openModalCreateParameter"
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
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import {
	RECIPE_TABLE,
	RECIPE_ID_CONFIG,
	RECIPE_TYPE,
} from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "RecipeParameterForm",
	components: {
		GridForm,
	},
	emits: ["create", "modify"],
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { openModalWarning } = useModalAlert();
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		//==================== Recipe
		const valueRef = ref(null);
		const { filterItem } = useItem();
		const {
			RECIPE_ID,
			RECIPE_GROUP_ID,
			RECIPE_TYPE: TYPE,
		} = RECIPE_ID_CONFIG;
		const recipeConfig = ref({ [TYPE]: RECIPE_TYPE.EQUIPMENT });
		const selectedRecipe = ref({ [RECIPE_GROUP_ID]: "", [RECIPE_ID]: "" });

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		function selectRecipe({ tableId, columns, row = {} }) {
			selectedRecipe.value = filterItem(row, [
				RECIPE_GROUP_ID,
				RECIPE_ID,
			]);
			setInformation({ tableId, columns, row });
		}

		/**
		 * @param {Object} config
		 */
		function openModalCreateParameter(config) {
			// Recipe 미선택시
			if (!selectedRecipe.value[RECIPE_ID]) {
				openModalWarning("warning.selectRowData", {
					param: RECIPE_TABLE.RECIPE,
				});
				return;
			}

			const readOnlySetting = { ...selectedRecipe.value };
			emit("create", config, readOnlySetting);
		}

		function openModalCloneParameter() {
			if (!selectedRecipe.value[RECIPE_ID]) {
				openModalWarning("warning.selectRowData", {
					param: RECIPE_TABLE.RECIPE,
				});
				return;
			}
			// Target 정의
			emit("clone", selectedRecipe.value);
		}

		return {
			// Config
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// EnumValue
			valueRef,
			recipeConfig,
			selectedRecipe,
			selectRecipe,
			openModalCreateParameter,
			openModalCloneParameter,
		};
	},
};
</script>
<style></style>
