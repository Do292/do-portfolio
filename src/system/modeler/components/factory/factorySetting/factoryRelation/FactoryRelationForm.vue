<template>
	<div :class="{ infor: isShowInformation }" class="card">
		<div class="card-body">
			<Splitter :paneConfigs="paneConfigs">
				<template v-slot:left>
					<GridForm
						ref="factoryRef"
						:checkbox="false"
						:menuId="TABLE.FACTORY_RELATION"
						:needsDefaultFactory="false"
						:tableId="TABLE.FACTORY"
						@onSelectionChanged="selectFactory"
					>
						<template v-slot:grid-button>
							<span></span>
						</template>
					</GridForm>
				</template>
				<template v-slot:right>
					<GridForm
						ref="relationRef"
						:condition="selectedFactory"
						:menuId="TABLE.FACTORY_RELATION"
						:needsDefaultFactory="false"
						:tableId="TABLE.FACTORY_RELATION"
						@delete="$emit('delete', $event)"
						@onSelectionChanged="setInformation"
					>
						<template v-slot:grid-button>
							<div
								class="btn-group"
								@click.capture="validateSourceFactory"
							>
								<ButtonAddList
									:items="filteredFactoryList"
									:tableId="TABLE.FACTORY"
									@apply="createFactoryRelation"
								/>
								<ButtonBasic
									:needsAuthority="true"
									:type="ACTION.DELETE"
									class="text-red"
									@onClick="openModalDeleteRelation"
								/>
							</div>
						</template>
					</GridForm>
				</template>
			</Splitter>
		</div>
		<FormInformation :config="infoConfig" />
	</div>
</template>

<script>
import GridForm from "~/system/modeler/components/common/form/GridForm";
import ButtonAddList from "~/system/modeler/components/common/button/ButtonAddList";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";

import { ref, computed } from "vue";
import { useInformation } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useUpdateData } from "~/system/modeler/plugins/composables/modeler-dataHandler";

import {
	FACTORY,
	FACTORY_RELATION,
} from "~/system/modeler/constants/table_constants.js";
import { TABLE, ACTION } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "FactoryRelationForm",
	components: {
		GridForm,
		ButtonAddList,
		ButtonBasic,
	},
	props: { menuId: { type: String } },
	emits: ["create", "modify"],
	setup() {
		//==================== Config
		const { isShowInformation, infoConfig, setInformation } =
			useInformation();

		const paneConfigs = [
			{ key: "left", size: 40, min: "600px" },
			{ key: "right", size: 60, min: "600px" },
		];

		const { openModalWarning } = useModalAlert();

		//==================== Factory Relation
		const factoryRef = ref(null);
		const {
			SOURCE,
			DESTINATION,
			DESCRIPTION: DEST_DESCRIPTION,
		} = FACTORY_RELATION;
		const { ID: FACTORY_ID, DESCRIPTION } = FACTORY;

		const selectedFactory = ref({ [SOURCE]: "" });
		const isSourceFactoryValid = computed(
			() => !!selectedFactory.value[SOURCE],
		);

		/**
		 * @param {Object} config
		 * @param {String} config.tableId
		 * @param {Object[]} config.columns
		 * @param {Object|null} config.row
		 */
		async function selectFactory({ tableId, columns, row = {} }) {
			selectedFactory.value = { [SOURCE]: row[FACTORY_ID] || "" };
			setInformation({ tableId, columns, row });
		}

		/**
		 * SourceFactory가 유효한지 검증하여 이벤트 활성화 여부를 결정한다.
		 * @param {PointerEvent} e
		 */
		function validateSourceFactory(e) {
			if (!isSourceFactoryValid.value) {
				openModalWarning("warning.selectRowData", {
					param: TABLE.PROCESS_SPEC,
				});
				e.stopPropagation();
			}
		}

		//==================== Factory Relation
		const relationRef = ref(null);

		const { createList } = useUpdateData();

		const filteredFactoryList = computed(() => {
			return factoryRef.value?.gridItems
				.filter(
					factory =>
						selectedFactory.value[SOURCE] !== factory[FACTORY_ID],
				)
				.filter(factory => {
					return !relationRef.value?.gridItems.find(
						dest => dest[DESTINATION] === factory[FACTORY_ID],
					);
				});
		});

		/**
		 * @param {Object[]} factoryItems
		 * @param {String} comment
		 */
		function createFactoryRelation(factoryItems, comment) {
			const items = factoryItems.map(item => ({
				[DESTINATION]: item[FACTORY_ID],
				[DEST_DESCRIPTION]: item[DESCRIPTION],
				...selectedFactory.value,
			}));

			createList(TABLE.FACTORY_RELATION, items, comment);
		}

		function openModalDeleteRelation() {
			relationRef.value.openModalDelete();
		}

		return {
			// Config
			TABLE,
			ACTION,
			paneConfigs,
			isShowInformation,
			infoConfig,
			setInformation,

			// Factory
			factoryRef,
			selectedFactory,
			selectFactory,
			validateSourceFactory,

			// Factory Relation
			relationRef,
			filteredFactoryList,
			createFactoryRelation,
			openModalDeleteRelation,
		};
	},
};
</script>
<style scoped>
:deep(.e-frozenscrollbar.e-frozen-left-scrollbar) {
	display: inline-block !important;
}
</style>
