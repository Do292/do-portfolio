<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<FormGrid
						ref="metaRef"
						:createApi="createMetaData"
						:customApi="SYSTEM_COMMON.getAllMetaData"
						:deleteApi="deleteMetaData"
						:modifyApi="modifyMetaData"
						gridId="MetaData"
						menuId="MetaData"
						metaDataId="MetaData"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectMeta"
					>
					</FormGrid>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="detailRef"
						:condition="selectedMeta"
						:createApi="createMetaDataDetail"
						:customApi="getMetaDataDetail"
						:deleteApi="deleteMetaDataDetail"
						:dragging="true"
						:modifyApi="modifyMetaDataDetail"
						gridId="MetaDataDetail"
						menuId="MetaData"
						metaDataId="MetaDataDetail"
						@create="openModalCreateDetail"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
					>
					</FormGrid>
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
import * as SYSTEM_COMMON from "~/api/system-common.js";

export default {
	name: "MetaDataForm",
	components: {},
	setup(_, { emit }) {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		const {
			createMetaData,
			createMetaDataDetail,
			modifyMetaData,
			modifyMetaDataDetail,
			deleteMetaData,
			deleteMetaDataDetail,
		} = SYSTEM_COMMON;

		const metaRef = ref(null);
		const detailRef = ref(null);

		const { META_ID, SYSTEM_ID, SEQUENCE } = CAMEL_ID;
		const selectedMeta = ref({ [META_ID]: "", [SYSTEM_ID]: "" });

		const getMetaDataDetail = () =>
			SYSTEM_COMMON.getMetaDataDetail(selectedMeta.value[META_ID]);

		async function selectMeta({ row = {} }) {
			selectedMeta.value = {
				[META_ID]: row[META_ID],
				[SYSTEM_ID]: row[SYSTEM_ID],
			};
		}

		function openModalCreateDetail(config) {
			const { length } = detailRef.value.gridItems;
			const readOnlySetting = {
				...selectedMeta.value,
				[SEQUENCE]: length + 1,
			};
			emit("create", config, readOnlySetting);
		}

		return {
			// Config
			SYSTEM_COMMON,
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			metaRef,
			detailRef,
			selectMeta,
			selectedMeta,
			getMetaDataDetail,

			openModalCreateDetail,

			// API
			createMetaData,
			createMetaDataDetail,
			modifyMetaData,
			modifyMetaDataDetail,
			deleteMetaData,
			deleteMetaDataDetail,
		};
	},
	data() {
		return {};
	},
};
</script>

<style scoped></style>
