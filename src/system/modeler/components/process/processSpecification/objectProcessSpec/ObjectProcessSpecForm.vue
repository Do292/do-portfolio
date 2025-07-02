<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<Splitter :paneConfigs="horizontalConfigs">
						<template v-slot:left>
							<HeaderObject @select="selectObject" />
							<GridForm
								:checkbox="false"
								:condition="objectConfig"
								:tableId="TABLE.PROCESS_SPEC"
								@onSelectionChanged="selectProcessSpec"
							>
								<template v-slot:grid-button>
									<span></span>
								</template>
							</GridForm>
						</template>
						<template v-slot:right>
							<GridForm
								ref="objectRef"
								:condition="specConfig"
								:needsDefaultFactory="false"
								:tableId="TABLE.OBJECT_PROCESS_SPEC"
								@onSelectionChanged="setInformation"
							>
								<template v-slot:grid-button>
									<div
										class="btn-group"
										@click.capture="validateProcessSpec"
									>
										<ButtonAddList
											:gridId="objectDef"
											:items="filteredDefList"
											:tableId="TABLE.OBJECT_PROCESS_SPEC"
											@apply="createObjectProcessSpec"
										/>
										<ButtonBasic
											:needsAuthority="true"
											:type="ACTION.DELETE"
											class="text-red"
											@onClick="openModalDeleteContent"
										/>
									</div>
								</template>
							</GridForm>
						</template>
					</Splitter>
				</div>
			</div>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import GridForm from "~/system/modeler/components/common/form/GridForm";
import ButtonAddList from "~/system/modeler/components/common/button/ButtonAddList";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";

import HeaderObject from "~/system/modeler/components/process/processSpecification/objectProcessSpec/HeaderObject";

import { ref, computed, watch } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useFetchData,
	useUpdateData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import { useUserInfo } from "~/system/modeler/plugins/composables/modeler-authority";
import {
	useModalAlert,
	useModalDelete,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";

import * as COMMON from "~/system/modeler/api/modeler-common.js";
import {
	ID,
	TABLE,
	ACTION,
	DATA_STATE,
} from "~/system/modeler/constants/modeler_constants.js";
import {
	PROCESS_SPEC,
	OBJECT_PROCESS_SPEC,
	OBJECT_DEF_ID,
} from "~/system/modeler/constants/table_constants.js";
import { OBJECT_TYPE_FIELD } from "~/system/modeler/constants/enum_constants.js";

export default {
	name: "ObjectProcessSpecForm",
	components: {
		GridForm,
		ButtonAddList,
		ButtonBasic,
		HeaderObject,
	},
	setup() {
		//==================== Information
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const horizontalConfigs = [
			{ key: "left", size: 30, min: "400px" },
			{ key: "right", size: 70 },
		];

		//==================== Factory
		const { FACTORY_ID } = ID;
		const { userFactory } = useUserInfo();
		const selectedFactory = computed(() => ({
			[FACTORY_ID]: userFactory.value,
			[ID.DATA_STATE]: DATA_STATE.CREATED,
		}));

		// default factory 변경 시 초기화
		watch(
			() => userFactory.value,
			() => {
				selectedSpec.value = defineProcessSpec({});
			},
		);

		//==================== Object Type
		const { ID: OBJECT_ID } = OBJECT_PROCESS_SPEC;
		const { ID: SPEC_ID, TYPE, VERSION, OBJECT_TYPE } = PROCESS_SPEC;
		const selectedObject = ref({});
		const objectConfig = computed(() => ({
			[OBJECT_TYPE]: selectedObject.value[OBJECT_TYPE_FIELD.TYPE],
		}));

		/**
		 * @param {Object|null} item
		 */
		function selectObject(config) {
			selectedObject.value = config;
			selectedSpec.value = defineProcessSpec({});
		}

		// Object Def
		const { fetchList } = useFetchData();
		const objectDef = computed(
			() => selectedObject.value[OBJECT_TYPE_FIELD.DEF],
		);

		const objectDefList = ref([]);
		const filteredDefList = computed(() =>
			objectDefList.value.filter(def =>
				objectSpecs.value.every(
					spec =>
						spec[OBJECT_ID] !== def[OBJECT_DEF_ID[objectDef.value]],
				),
			),
		);

		/**
		 * ObjectDef 데이터 가져오기
		 */
		async function fetchObjectDefList() {
			if (isSpecValid.value) {
				objectDefList.value = await fetchList(() =>
					COMMON.getBy(objectDef.value, selectedFactory.value),
				);
			}
		}

		//==================== ProcessSpec
		const { filterItem } = useItem();
		const selectedSpec = ref(defineProcessSpec({}));
		const specConfig = computed(() =>
			filterItem(selectedSpec.value, [OBJECT_TYPE, SPEC_ID, VERSION]),
		);
		const isSpecValid = computed(() => !!selectedSpec.value[SPEC_ID]);

		/**
		 * @param {Object} config
		 * @param {Object} config.row
		 */
		function selectProcessSpec(config) {
			selectedSpec.value = defineProcessSpec(config.row);
			setInformation(config);
			fetchObjectDefList();
		}

		/**
		 * @param {Object|null} item
		 * @returns {Object}
		 */
		function defineProcessSpec(item = {}) {
			return filterItem(item, [OBJECT_TYPE, SPEC_ID, VERSION, TYPE]);
		}

		/**
		 * ProcessSpec이 유효한지 검증하여 이벤트 활성화 여부를 결정한다.
		 * @param {PointerEvent} e
		 */
		function validateProcessSpec(e) {
			if (!isSpecValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_SPEC,
				});
				e.stopPropagation();
			}
		}

		//==================== Object Process Spec
		const objectRef = ref(null);
		const objectSpecs = computed(() =>
			objectRef.value.gridItems.filter(item => item[SPEC_ID]),
		);

		const { openModalWarning } = useModalAlert();
		const { openModalDelete } = useModalDelete();
		const { createList } = useUpdateData();

		/**
		 * 선택 아이템이 하나 이상인지 확인 후 삭제 이벤트 전송
		 */
		function openModalDeleteContent() {
			const checkItems = objectRef.value.cloneCheckItems();
			if (checkItems.length == 0) {
				openModalWarning("warning.selectData");
				return;
			}

			// 키 데이터
			const items = checkItems.map(item =>
				objectRef.value.createKeyItem(item),
			);
			const config = objectRef.value.mergeTableConfig({ items });

			// 모달 활성화
			openModalDelete(config);
		}

		/**
		 * @param {Object[]} objectItems
		 * @param {String} comment
		 */
		function createObjectProcessSpec(objectItems, comment) {
			const items = objectItems.map(item => {
				const id = item[OBJECT_DEF_ID[objectDef.value]];
				return Object.assign({ [OBJECT_ID]: id }, selectedSpec.value);
			});

			createList(TABLE.OBJECT_PROCESS_SPEC, items, comment);
		}

		return {
			// Config
			ACTION,
			TABLE,
			isShowInformation,
			infoConfig,
			setInformation,
			horizontalConfigs,

			// Factory
			userFactory,
			selectedFactory,

			// Object Type
			objectConfig,
			selectObject,

			// ProcessSpec
			selectedSpec,
			specConfig,
			isSpecValid,
			selectProcessSpec,
			validateProcessSpec,

			// Object Type
			objectDef,
			filteredDefList,

			// Content
			objectRef,
			openModalDeleteContent,
			createObjectProcessSpec,
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(#left-pane .e-gridcontent) {
	height: calc(100vh - 340px) !important;
}
:deep(.e-frozenscrollbar.e-frozen-left-scrollbar) {
	display: inline-block !important;
}
</style>
