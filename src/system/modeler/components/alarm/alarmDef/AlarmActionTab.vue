<template>
	<div id="action-tab">
		<TabTemplate
			:isRemovable="false"
			:tabKeys="actionKeys"
			@select="selectAction"
		>
			<template v-slot:tabContent>
				<div class="row">
					<div class="col-9 item-title">
						<label> AlarmAction </label>
						<BreadcrumbTemplate
							:isSelectable="false"
							:items="actionPaths"
						/>
					</div>
				</div>
				<div class="action-box">
					<div class="row item-box-title">Configuration</div>
					<div class="row line-bottom pt-1 pb-2">
						<div class="col-12">
							<div class="row">
								<div class="col-6 input">
									<InputText
										:enabled="false"
										:modelValue="config[ALARM.ID]"
										floatLabelType="Always"
										placeholder="AlarmId"
									/>
								</div>
								<div class="col-6 input">
									<InputText
										:enabled="false"
										:modelValue="config[ALARM.LEVEL]"
										floatLabelType="Always"
										placeholder="Level"
									/>
								</div>
							</div>
							<div class="row">
								<div class="col input">
									<InputText
										:enabled="false"
										:modelValue="config[ID.DESCRIPTION]"
										floatLabelType="Always"
										placeholder="Description"
									/>
								</div>
							</div>
						</div>
					</div>
					<div class="row item-box-title mt-2">Action</div>
					<div class="row pt-1 pb-2">
						<div class="col">
							<div class="row">
								<div class="col input">
									<InputText
										floatLabelType="Always"
										placeholder="ActionId"
									/>
								</div>
							</div>
							<div class="row">
								<div class="col input">
									<InputText
										floatLabelType="Always"
										placeholder="Title"
									/>
								</div>
							</div>
							<div class="row">
								<div class="col input">
									<InputText
										:resizing="true"
										floatLabelType="Always"
										placeholder="Content"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<GridForm
					v-show="hasRecipient(selectedTab)"
					:needsDefaultFactory="false"
					:tableId="TABLE.USER_INFO"
					gridId="Recipient"
				>
					<template v-slot:grid-button>
						<span></span>
					</template>
				</GridForm>
			</template>
		</TabTemplate>
	</div>
</template>

<script>
import TabTemplate from "~/system/modeler/components/common/template/TabTemplate";
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import GridForm from "~/system/modeler/components/common/form/GridForm";
import InputText from "~/system/modeler/components/common/input/InputText";

import { ref, computed, onBeforeMount } from "vue";
import {
	useItem,
	useFetchData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";

import { TABLE, ID } from "~/system/modeler/constants/modeler_constants.js";
import { ALARM } from "~/system/modeler/constants/table_constants.js";
import {
	ENUM_KEY,
	ENUM_FIELD,
} from "~/system/modeler/constants/enum_constants.js";
import * as COMMON from "~/system/modeler/api/modeler-common";

export default {
	name: "AlarmActionTab",
	components: {
		TabTemplate,
		BreadcrumbTemplate,
		GridForm,
		InputText,
	},
	props: {
		config: { type: Object },
	},
	setup(props) {
		//==================== Action
		const { fetchList } = useFetchData();
		const { sortItemsByPosition } = useItem();
		const actionTypeList = ref([]);
		const actionKeys = computed(() =>
			actionTypeList.value.map(item => item[ENUM_FIELD.VALUE]),
		);

		/**
		 * Sequence 기준 정렬 후 Action Type 정의
		 */
		async function fetchActionTypeList() {
			const data = await fetchList(() =>
				COMMON.getBy(TABLE.ENUM_VALUE, {
					[ENUM_FIELD.KEY]: ENUM_KEY.ACTION_TYPE,
				}),
			);
			actionTypeList.value = sortItemsByPosition(data);
		}

		onBeforeMount(async () => {
			await fetchActionTypeList();
			selectAction(0);
		});

		//==================== Path
		const selectedAction = ref("");
		const actionPaths = computed(() => [
			props.config[ALARM.ID],
			selectedAction.value,
		]);

		/**
		 * @param {Number|null} index
		 */
		function selectAction(index = 0) {
			selectedAction.value = actionKeys.value[index];
		}

		//==================== Recipient Splitter

		function hasRecipient(key) {
			return ["Message", "Mail"].includes(key);
		}

		return {
			// Config
			TABLE,
			ALARM,
			ID,

			// Action
			actionTypeList,
			actionKeys,

			// Path
			selectAction,
			actionPaths,

			hasRecipient,
		};
	},
};
</script>
<style scoped>
/* Tab */
#action-tab :deep(.e-tab.e-background) {
	margin-bottom: 0px !important;
}
#action-tab :deep(.e-tab.e-background .e-content.e-lib.e-touch) {
	display: none !important;
}

/* Action Box */
#action-tab .action-box {
	padding: 3px 10px;
	border: 1px solid #e0e0e0;
	background-color: #fafafa;
	overflow: auto;
	height: calc(100vh - 220px); /*dylee*/
}
.action-box .item-box-title {
	margin-top: 5px;
	height: 25px;
}
.action-box .input {
	padding-right: 10px !important;
	padding-left: 10px !important;
}

/* Action Input */
#action-tab :deep(.e-float-text.e-label-top) {
	top: -13px !important;
}
#action-tab :deep(.e-disabled .e-float-text.e-label-top::before) {
	background: rgba(239, 239, 239, 0.785);
}
#action-tab :deep(.required .e-float-text::after) {
	position: relative;
	content: "\ea07";
	font-family: aimcons;
	color: #fd7e14;
	padding-left: 4px;
	font-size: 12px;
}

/* Input Query */
#action-tab :deep(.e-multi-line-input .e-float-text.e-label-top) {
	top: -25px !important;
}
#action-tab :deep(.e-input-group.e-multi-line-input) {
	padding-top: 4px !important;
	padding-bottom: 4px !important;
	padding-right: 0 !important;
	min-height: 38px !important;
	height: calc(100vh - 562px) !important;
	/*max-height: calc(100vh - 100px) !important;*/ /*dylee*/
}
#action-tab :deep(.e-input-group.e-multi-line-input textarea) {
	height: calc(100% - 8px) !important;
}
#action-tab :deep(.e-input-group.e-multi-line-input + .btn-simple) {
	top: 5px;
	right: 4px;
}
</style>
