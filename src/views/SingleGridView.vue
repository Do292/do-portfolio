<template>
	<div>
		<div :class="{ infor: isShowInformation }" class="card">
			<div class="card-body">
				<FormGrid
					ref="gridRef"
					:menuId="menuId"
					:metaDataId="menuId"
					@onSelectionChanged="setInformation"
				/>
			</div>
			<FormInformation :config="infoConfig" />
		</div>
	</div>
</template>

<script>
import { ref } from "vue";
import { useInformation } from "~/plugins/composables/uiControl";

export default {
	name: "SingleGridView",
	components: {},
	props: {
		menuId: { type: String },
	},
	setup() {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const gridRef = ref(null);

		return {
			// Information
			isShowInformation,
			infoConfig,
			setInformation,
			gridRef,
		};
	},
};
</script>
<style></style>
