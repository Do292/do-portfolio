<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<FormGrid
						ref="conditionRef"
						:createApi="createSearchCondition"
						:customApi="getSearchCondition"
						:deleteApi="deleteSearchCondition"
						:modifyApi="modifySearchCondition"
						gridId="SearchCondition"
						menuId="SearchCondition"
						metaDataId="SearchCondition"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="selectCondition"
					>
					</FormGrid>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="detailRef"
						:condition="selectedCondition"
						:createApi="createSearchConditionDetail"
						:customApi="getSearchConditionDetail"
						:deleteApi="deleteSearchConditionDetail"
						:dragging="true"
						:modifyApi="modifySearchConditionDetail"
						gridId="SearchConditionDetail"
						menuId="SearchCondition"
						metaDataId="SearchConditionDetail"
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
	name: "SearchConditionForm",
	components: {},
	setup(_, { emit }) {
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		const {
			getSearchCondition,
			createSearchCondition,
			createSearchConditionDetail,
			modifySearchCondition,
			modifySearchConditionDetail,
			deleteSearchCondition,
			deleteSearchConditionDetail,
		} = SYSTEM_COMMON;

		const conditionRef = ref(null);
		const detailRef = ref(null);

		const { SEARCH_CONDITION_ID, SYSTEM_ID, SEQUENCE } = CAMEL_ID;
		const selectedCondition = ref({
			[SEARCH_CONDITION_ID]: "",
			[SYSTEM_ID]: "",
		});

		const getSearchConditionDetail = () =>
			SYSTEM_COMMON.getSearchConditionDetail(
				selectedCondition.value[SEARCH_CONDITION_ID],
			);

		async function selectCondition({ row = {} }) {
			selectedCondition.value = {
				[SEARCH_CONDITION_ID]: row[SEARCH_CONDITION_ID],
				[SYSTEM_ID]: row[SYSTEM_ID],
			};
		}

		function openModalCreateDetail(config) {
			const { length } = detailRef.value.gridItems;
			const readOnlySetting = {
				...selectedCondition.value,
				[SEQUENCE]: length + 1,
			};
			emit("create", config, readOnlySetting);
		}

		return {
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			conditionRef,
			detailRef,
			selectCondition,
			selectedCondition,
			openModalCreateDetail,

			// API
			getSearchCondition,
			getSearchConditionDetail,
			createSearchCondition,
			createSearchConditionDetail,
			modifySearchCondition,
			modifySearchConditionDetail,
			deleteSearchCondition,
			deleteSearchConditionDetail,
		};
	},
	data() {
		return {};
	},
};
</script>

<style scoped></style>
