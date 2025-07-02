<template>
	<div class="modal-mask">
		<div class="modal-dialog">
			<div class="modal-content height-fit">
				<div class="modal-header alert-warning">
					<h6 class="modal-title">
						<span>Result</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body confirm">
					<div class="container-fluid">
						<div class="row">
							<div class="col-12 message-box">
								<i class="icons text-warning"></i>
								<label>
									<span class="success-badge">Success</span> :
									{{ getCountBy(SUCCESS) }},
									<span class="fail-badge">Fail</span> :
									{{ getCountBy(FAIL) }}
								</label>
							</div>
						</div>
						<Splitter
							:paneConfigs="paneConfigs"
							orientation="Vertical"
						>
							<template
								v-for="{ key } in paneConfigs"
								:key="key"
								v-slot:[key]
							>
								<GridTemplate
									:checkbox="false"
									:columns="getColumnsBy(key)"
									:freezing="true"
									:gridItems="getItemsBy(key)"
									:gridName="tableId"
								>
									<template v-slot:header-title>
										<span :class="key">{{ key }}</span>
									</template>
								</GridTemplate>
							</template>
						</Splitter>
					</div>
				</div>
				<div class="modal-footer">
					<ButtonFooter type="close" @onClick="$emit('close')" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import GridTemplate from "~/system/modeler/components/common/template/GridTemplate";
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import { toRef, computed } from "vue";
import { useModalResult } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useColumnDef } from "~/system/modeler/plugins/composables/modeler-tableHandler";

import { API_RESPONSE } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "ModalResult",
	components: { GridTemplate, ButtonClose, ButtonFooter },
	setup() {
		//==================== Config
		const { SUCCESS, FAIL, STATUS, MESSAGE } = API_RESPONSE;
		const { resultState } = useModalResult();
		const resultItems = toRef(resultState, "items");
		const hasSuccess = computed(() =>
			resultItems.value.some(item => item[STATUS] !== FAIL),
		);
		const paneConfigs = computed(() => {
			const keys = hasSuccess.value ? [SUCCESS, FAIL] : [FAIL];
			return keys.map(key => ({ key, min: "150px" }));
		});

		/**
		 * 상태 별 데이터 갯수 반환
		 * @param {String} status
		 * @return {Number}
		 */
		function getCountBy(status) {
			const { length } = getItemsBy(status);
			return length;
		}

		//==================== Grid
		const { tableId } = resultState;
		const { columns, fetchMetaColumns, createFrozenColumn } =
			useColumnDef();
		const messageColumn = createFrozenColumn(MESSAGE);
		fetchMetaColumns(tableId);

		/**
		 * @param {String} status
		 * @returns {Object[]}
		 */
		function getColumnsBy(status) {
			return status === SUCCESS
				? columns.value
				: [messageColumn, ...columns.value];
		}

		/**
		 * @param {String} status
		 * @returns {Object[]}
		 */
		function getItemsBy(status) {
			return resultItems.value.filter(
				item => (item[STATUS] === FAIL) === (status === FAIL),
			);
		}

		return {
			// Config
			SUCCESS,
			FAIL,
			paneConfigs,
			getCountBy,

			// Grid
			tableId,
			getColumnsBy,
			getItemsBy,
		};
	},
};
</script>

<style scoped>
/* Layout */
.modal-mask {
	z-index: 10000000000000;
}
.modal-dialog {
	width: 65vw !important;
	max-width: 65vw !important;
	min-width: 1000px !important;
	top: 35px;
}
.modal-body {
	overflow: hidden;
	padding: 10px !important;
	height: calc(100vh - 210px);
}

/* Message Box */
.message-box {
	height: 50px;
}
.message-box .icons {
	transform: translate(25px, -20px);
}
.message-box .icons::before {
	font-family: "aimcons";
	font-style: normal;
	content: "\e9b8";
}
.message-box label {
	position: absolute;
	transform: translate(105px, 12px);
	font-size: 19px;
	color: #474747;
	font-weight: 550;
}
.message-box label .success-badge {
	color: #169e16;
}
.message-box label .fail-badge {
	color: #e62239;
}

/* Splitter */
:deep(.e-splitter.e-splitter-vertical) {
	height: calc(100vh - 285px) !important;
}
:deep(.e-splitter.e-splitter-vertical > .e-pane > div) {
	height: 100%;
}
:deep(.grid-form) {
	height: calc(100% - 25px) !important;
}
:deep(.grid-form .e-grid) {
	height: calc(100% - 30px) !important;
}
:deep(.grid-form .e-gridcontent) {
	height: calc(100% - 80px) !important;
}
:deep(.grid-form .item-title span) {
	background: #169e16;
	padding: 2px 3px;
	border-radius: 15px;
	width: 75px;
	text-align: center;
	transform: translate(-1px, -4px);
	color: white;
	font-size: 14px;
}
:deep(.grid-form .item-title span.FAIL) {
	background: #e62239;
}
/* Text */
.message-box .h-message label {
	font-size: large;
	transform: translateY(25px);
}
.message-box .text-secondary label {
	font-size: larger;
	font-weight: 500;
}
</style>
