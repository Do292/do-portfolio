<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="horizontalConfigs">
				<template v-slot:left>
					<Splitter
						:paneConfigs="verticalConfigs"
						orientation="Vertical"
					>
						<template v-slot:top>
							<FormGrid
								:gridId="META.STRATEGY_TYPE_DEF"
								:menuId="MENU.STRATEGY_DEF"
								:metaDataId="META.STRATEGY_TYPE_DEF"
								@create="$emit('create', $event)"
								@delete="$emit('delete', $event)"
								@modify="$emit('modify', $event)"
								@onSelectionChanged="selectType"
							/>
						</template>
						<template v-slot:bottom>
							<FormGrid
								:customItems="filteredStepList"
								:dragging="true"
								:dropTargetId="META.STRATEGY_MAP"
								:gridId="META.STRATEGY_STEP_DEF"
								:menuId="MENU.STRATEGY_DEF"
								:metaDataId="META.STRATEGY_STEP_DEF"
								@create="$emit('create', $event)"
								@delete="$emit('delete', $event)"
								@modify="$emit('modify', $event)"
								@onCrossGridDrop="openModalConfirmStrategyMap"
								@onSelectionChanged="setInformation"
							>
								<template v-slot:grid-button>
									<span></span>
								</template>
							</FormGrid>
						</template>
					</Splitter>
				</template>
				<template v-slot:right>
					<FormGrid
						ref="strategyMapRef"
						:condition="selectedType"
						:customPosition="SEQUENCE"
						:dragging="true"
						:gridId="META.STRATEGY_MAP"
						:menuId="MENU.STRATEGY_DEF"
						:metaDataId="META.STRATEGY_MAP"
						@delete="$emit('delete', $event)"
						@onSelectionChanged="setInformation"
					>
						<template v-slot:grid-button>
							<div
								class="btn-group"
								@click.capture="validateType"
							>
								<ButtonAddList
									:items="filteredStepList"
									:metaDataId="META.STRATEGY_STEP_DEF"
									@apply="createStrategyMapAtSequence"
								/>
								<ButtonBasic
									:type="ACTION.DELETE"
									class="text-red"
									@onClick="openModalDeleteStrategyMap"
								/>
							</div>
						</template>
					</FormGrid>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import {
	useModalAlert,
	useModalConfirm,
} from "~/plugins/composables/modalHandler";
import { useInformation } from "~/plugins/composables/uiControl";
import {
	useFetchData,
	useUpdateData,
	useItem,
} from "~/plugins/composables/dataHandler";

import * as COMMON from "~/api/common.js";
import { ACTION, DEFAULT_SEQEUNCE } from "~/plugins/wfb-constants.js";
import {
	META,
	STRATEGY_TYPE_DEF,
	STRATEGY_STEP_DEF,
	STRATEGY_MAP,
} from "~/system/qms/constants/qms_meta_constants.js";
import { MENU } from "~/system/qms/constants/qms_constants";

export default {
	name: "StrategyDefForm",
	emits: ["create", "modify", "delete"],
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const horizontalConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];
		const verticalConfigs = [{ key: "top" }, { key: "bottom" }];

		const { openModalWarning } = useModalAlert();

		//==================== StrategyType
		const { ID: TYPE_ID } = STRATEGY_TYPE_DEF;

		const { filterItem } = useItem();
		const selectedType = ref(defineType({}));
		const isTypeValid = computed(() => !!selectedType.value[TYPE_ID]);

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object} config.row
		 */
		function selectType({ tableId, columns, row = {} }) {
			selectedType.value = defineType(row);
			setInformation({ tableId, columns, row });
		}

		/**
		 * @param {Object} item
		 * @returns {Object}
		 */
		function defineType(item) {
			return filterItem(item, [TYPE_ID]);
		}

		/**
		 * Type이 유효한지 검증하여 이벤트 활성화 여부를 결정한다.
		 * @param {PointerEvent} e
		 */
		function validateType(e) {
			if (!isTypeValid.value) {
				openModalWarning("warning.selectRowData", {
					param: META.STRATEGY_TYPE_DEF,
				});
				e.stopPropagation();
			}
		}

		//==================== Strategy
		const { ID: STEP_ID } = STRATEGY_STEP_DEF;

		const { fetchList } = useFetchData();
		const stepList = ref([]);
		const filteredStepList = computed(() =>
			stepList.value.filter(
				table =>
					!strategyMapList.value.find(
						item => item[STEP_ID] === table[STEP_ID],
					),
			),
		);

		/**
		 * Strategy 리스트 가져오기
		 */
		async function fetchStepList() {
			stepList.value = await fetchList(() =>
				COMMON.getBy({ metaDataId: META.STRATEGY_STEP_DEF }),
			);
		}

		onMounted(async () => {
			await fetchStepList();
		});

		//==================== StrategyMap
		const strategyMapRef = ref(null);
		const { META_DATA_ID, SEQUENCE } = STRATEGY_MAP;

		const strategyMapList = computed(() =>
			strategyMapRef.value.gridItems.filter(item => item[TYPE_ID]),
		);

		const { openModalConfirmBy } = useModalConfirm();
		const { deepCloneItems } = useItem();
		const { createList } = useUpdateData();

		/**
		 * @param {Object[]} steps
		 * @param {Number|null} forceIndex
		 */
		function openModalConfirmStrategyMap(steps, forceIndex) {
			// 그리드 데이터 원복
			const items = deepCloneItems(strategyMapList.value);
			strategyMapRef.value.setGridItems(items);

			// StrategyType 검증
			if (!isTypeValid.value) {
				openModalWarning("warning.selectRowData", {
					param: META.STRATEGY_TYPE_DEF,
				});
				return;
			}

			// Confirm 모달 활성화
			openModalConfirmBy(
				ACTION.CREATE,
				META.STRATEGY_MAP,
				steps,

				// Apply function
				comment =>
					createStrategyMapAtSequence(steps, comment, forceIndex),
			);
		}

		/**
		 * @param {Object[]} steps
		 * @param {String} comment
		 * @param {Number|null} startIndex
		 */
		async function createStrategyMapAtSequence(steps, comment, startIndex) {
			// StrategyMap 그리드 데이터 복사
			const strategyMapItems = deepCloneItems(strategyMapList.value);
			startIndex = startIndex ?? strategyMapItems.length;
			const isAddedAtEnd = startIndex === strategyMapItems.length;

			// StrategyMap 생성
			const items = steps.map((step, index) => ({
				[STEP_ID]: step[STEP_ID],
				[META_DATA_ID]: `${selectedType.value[TYPE_ID]}.${step[STEP_ID]}`,
				[SEQUENCE]: startIndex + index + DEFAULT_SEQEUNCE,
				...selectedType.value,
			}));
			const createItems = await createList(
				null, // Common CreateApi
				META.STRATEGY_MAP,
				items,
				comment,
			);

			// 생성 데이터가 있고 맨 끝에 추가되지 않았을 경우, changeSequence 수행
			if (createItems.length > 0 && !isAddedAtEnd) {
				// 지정된 Index에 생성된 데이터 삽입
				strategyMapItems.splice(startIndex, 0, ...createItems);

				// index 기준으로 Position 부여
				strategyMapRef.value.changeSequence(
					createItems,
					strategyMapItems,
				);
			}
		}

		function openModalDeleteStrategyMap() {
			strategyMapRef.value.openModalDelete();
		}

		return {
			// Config
			ACTION,
			META,
			MENU,
			isShowInformation,
			infoConfig,
			setInformation,
			horizontalConfigs,
			verticalConfigs,

			// StrategyType
			selectType,
			selectedType,
			validateType,

			// StrategyStep
			filteredStepList,

			// StrategyMap
			SEQUENCE,
			strategyMapRef,
			strategyMapList,
			openModalConfirmStrategyMap,
			createStrategyMapAtSequence,
			openModalDeleteStrategyMap,
		};
	},
};
</script>

<style scoped>
/* Grid */
:deep(.e-pane-vertical.e-scrollable.e-resizable .e-grid) {
	height: calc(100% - 48px) !important;
}
:deep(.e-pane-vertical.e-scrollable.e-resizable .e-gridcontent) {
	height: calc(100% - 86px) !important;
}
</style>
