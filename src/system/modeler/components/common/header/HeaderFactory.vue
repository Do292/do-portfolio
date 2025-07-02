<template>
	<HeaderTemplate :configs="headerConfigs" @search="selectFactoryId">
		<template v-slot:[FACTORY_ID]>
			<ComboFactory
				v-model="selectedFactoryId"
				floatLabelType="Never"
				@fetch="selectFactoryId"
			/>
		</template>
	</HeaderTemplate>
</template>

<script>
import HeaderTemplate from "~/system/modeler/components/common/template/HeaderTemplate";
import ComboFactory from "~/system/modeler/components/common/combo/ComboFactory";

import { ref } from "vue";
import { useHeader } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "HeaderFactory",
	components: {
		HeaderTemplate,
		ComboFactory,
	},
	setup(_, { emit }) {
		//==================== System
		const { FACTORY_ID } = ID;
		const selectedFactoryId = ref(null);

		const { formatConfigsByField } = useHeader();
		const headerConfigs = formatConfigsByField([FACTORY_ID]);

		/**
		 * Factory Id 이벤트 전송
		 */
		function selectFactoryId() {
			emit("select", selectedFactoryId.value);
		}

		return {
			// Factory
			FACTORY_ID,
			headerConfigs,
			selectedFactoryId,
			selectFactoryId,
		};
	},
};
</script>
