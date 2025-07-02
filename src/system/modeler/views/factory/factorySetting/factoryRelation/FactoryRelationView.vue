<template>
	<div>
		<FactoryRelationForm @delete="openModalDelete" />
	</div>
</template>

<script>
import FactoryRelationForm from "~/system/modeler/components/factory/factorySetting/factoryRelation/FactoryRelationForm";

import { useModalDelete } from "~/system/modeler/plugins/composables/modeler-modalHandler";

export default {
	name: "FactoryRelationView",
	components: {
		FactoryRelationForm,
	},
	setup() {
		//==================== Modal
		const { openModalDelete } = useModalDelete();

		return {
			// Delete
			openModalDelete,
		};
	},
};
</script>
