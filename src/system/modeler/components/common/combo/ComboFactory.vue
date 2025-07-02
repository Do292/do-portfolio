<template>
	<wfl-dropdownlist
		ref="factoryRef"
		:dataSource="factoryIds"
		:defaultValue="factory"
		@update:defaultValue="$emit('update:modelValue', $event)"
	>
	</wfl-dropdownlist>
</template>

<script>
import { ref, computed, onBeforeMount, nextTick } from "vue";
import { useFetchData } from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useUserInfo } from "~/system/modeler/plugins/composables/modeler-authority";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import { ID, TABLE } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "ComboFactory",
	props: {
		modelValue: { type: String },
	},
	emits: ["fetch", "update:modelValue"],
	setup(props, { emit }) {
		//==================== Config
		const { assignDataState, fetchList } = useFetchData();
		const { userFactory } = useUserInfo();

		const factories = ref([]);

		/**
		 * Factory List 가져오기
		 */
		async function fetchFactories() {
			// Data State 지정
			factories.value = await fetchList(() =>
				COMMON.getBy(TABLE.FACTORY, assignDataState()),
			);

			nextTick(() => emit("fetch"));
		}

		//==================== Factory Items
		const factoryRef = ref(null);
		const factory = ref(props.modelValue);
		const factoryIds = computed(() =>
			factories.value.map(factory => factory[ID.FACTORY_ID]),
		);

		onBeforeMount(async () => {
			await fetchFactories();

			// default factory 설정
			if (!factory.value) {
				factory.value = userFactory.value;
				emit("update:modelValue", userFactory.value);
			}
		});

		return { factoryIds, factoryRef, factory };
	},
};
</script>
