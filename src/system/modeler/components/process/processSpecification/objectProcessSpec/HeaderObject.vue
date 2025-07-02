<template>
	<HeaderTemplate :configs="headerConfigs" @search="selectObject">
		<template v-slot:[ENUM_KEY.OBJECT_TYPE]>
			<ComboBasic
				v-model="selectedType"
				:items="objectTypes"
				floatLabelType="Never"
			/>
		</template>
	</HeaderTemplate>
</template>

<script>
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic";

import { ref, computed, onMounted } from "vue";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useHeader } from "~/system/modeler/plugins/composables/modeler-uiControl";

import * as COMMON from "~/system/modeler/api/modeler-common";
import { TABLE } from "~/system/modeler/constants/modeler_constants.js";
import {
	ENUM_KEY,
	ENUM_FIELD,
} from "~/system/modeler/constants/enum_constants.js";

export default {
	name: "HeaderObject",
	components: {
		HeaderTemplate,
		ComboBasic,
	},
	setup(_, { emit }) {
		//==================== Object
		const { KEY, VALUE, POSITION } = ENUM_FIELD;
		const { fetchList } = useFetchData();

		const objectList = ref([]);
		const objectTypes = computed(() =>
			objectList.value.map(object => object[VALUE]),
		);
		const selectedType = ref("");

		const { formatConfigsByField } = useHeader();
		const headerConfigs = formatConfigsByField([ENUM_KEY.OBJECT_TYPE]);

		/**
		 * System 데이터 할당
		 */
		async function fetchObjectList() {
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.ENUM_VALUE, {
					[KEY]: ENUM_KEY.OBJECT_TYPE,
				}),
			);

			objectList.value = data.sort((a, b) => a[POSITION] - b[POSITION]);
		}

		/**
		 * 선택한 Object 전송
		 */
		async function selectObject() {
			if (selectedType.value) {
				const object = objectList.value.find(
					object => object[VALUE] === selectedType.value,
				);
				emit("select", object);
			}
		}

		onMounted(async () => {
			await fetchObjectList();
		});

		return {
			// Object
			ENUM_KEY,
			headerConfigs,
			objectTypes,
			selectedType,
			selectObject,
		};
	},
};
</script>

<style scoped></style>
