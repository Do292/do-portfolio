<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<HeaderSystem @select="selectSystemId" />
					<GridForm
						:condition="selectedSystem"
						:menuId="MULTI_LANGUAGE_DEF"
						:tableId="MULTI_LANGUAGE_DEF"
						@create="$emit('create', $event)"
						@delete="$emit('delete', $event)"
						@modify="$emit('modify', $event)"
						@onSelectionChanged="fetchLanguageConfig"
					/>
				</template>
				<template v-slot:right>
					<Splitter
						:paneConfigs="verticalConfigs"
						orientation="Vertical"
					>
						<template
							v-for="(_, key) in languageValueConfig"
							:key="key"
							v-slot:[key]
						>
							<MultiLanguageBox
								:config="languageConfig"
								:header="key"
								:language="key"
								@update="updateLanguageConfig"
							/>
						</template>
					</Splitter>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import HeaderSystem from "~/system/modeler/components/common/header/HeaderSystem";
import GridForm from "~/system/modeler/components/common/form/GridForm";
import MultiLanguageBox from "~/system/modeler/components/admin/uiConfig/multiLanguageDef/MultiLanguageBox";

import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useItem,
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useLanguage } from "~/system/modeler/plugins/composables/modeler-locale";
import { computed, ref } from "vue";

import * as COMMON from "~/system/modeler/api/modeler-common";

import { ID, TABLE } from "~/system/modeler/constants/modeler_constants.js";
import { NLS } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "MultiLanguageDefForm",
	components: {
		HeaderSystem,
		GridForm,
		MultiLanguageBox,
	},
	setup() {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();
		const { MULTI_LANGUAGE_DEF } = TABLE;

		//==================== System
		const selectedSystemId = ref("");
		const selectedSystem = computed(() => ({
			[ID.SYSTEM_ID]: selectedSystemId.value,
		}));

		/**
		 * 시스템 Id 선택으로 트리 및 그리드 바인딩
		 */
		async function selectSystemId(systemId) {
			if (selectedSystemId.value !== systemId) {
				selectedSystemId.value = systemId;
				// Config 초기화
				languageConfig.value = {};
			}
		}

		//==================== Language Config
		const { languageValueConfig, languageValues } = useLanguage();
		const languageConfig = ref({});
		const { filterItem, deepCloneItems } = useItem();
		const { fetchOne } = useFetchData();
		const { modifyList } = useUpdateData();

		const verticalConfigs = computed(() =>
			languageValues.value.map(key => ({
				key,
				size: 100 / languageValues.value.length,
			})),
		);

		/**
		 * @param {Object} config
		 */
		async function fetchLanguageConfig(config) {
			const { ID, SYSTEM_ID } = NLS;

			if (config.row[ID]) {
				const condition = filterItem(config.row, [ID, SYSTEM_ID]);
				languageConfig.value = await fetchOne(() =>
					COMMON.getBy(MULTI_LANGUAGE_DEF, condition),
				);
			} else {
				// System만 설정
				languageConfig.value = {};
			}

			setInformation(config);
		}

		/**
		 * @param {String} language
		 * @param {String} value
		 */
		function updateLanguageConfig(language, value) {
			// language에 해당하는 config value 수정
			languageConfig.value[language] = value;

			// 값을 복사해서 데이터 수정; updateState 유지
			const items = deepCloneItems([languageConfig.value]);
			modifyList(MULTI_LANGUAGE_DEF, items, "", false);
		}

		return {
			// Information
			MULTI_LANGUAGE_DEF,
			isShowInformation,
			setInformation,
			infoConfig,

			// System
			selectedSystem,
			selectSystemId,

			// Language Box
			verticalConfigs,
			languageValueConfig,
			languageConfig,
			fetchLanguageConfig,
			updateLanguageConfig,
		};
	},
	data() {
		return {
			paneConfigs: [
				{ key: "left", size: 45, min: 30 },
				{ key: "right", size: 55, min: 30 },
			],
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 340px) !important;
}
</style>
