<template>
	<div class="c-box">
		<div class="c-box-left">
			<span class="c-icon">
				<img :src="iconPath" />
			</span>
		</div>
		<div class="c-box-right">
			<p class="c-box-title">
				{{ title }}
				<SwitchFlag
					v-if="hasFlag"
					:config="setting"
					:target="SYSTEM_SETTING.VALUE"
					@onChange="changeFlag"
				/>
			</p>
			<p class="c-box-content">
				{{ description }}
			</p>
			<InputField
				v-if="!hasFlag"
				:fieldConfig="setting"
				:modelValue="modelValue"
				@update:modelValue="$emit('update:modelValue', $event)"
			/>
		</div>
	</div>
</template>

<script>
import SwitchFlag from "~/system/modeler/components/common/switch/SwitchFlag.vue";
import InputField from "~/system/modeler/components/common/input/InputField";

import { computed } from "vue";

import { ID, DATA_TYPE } from "~/system/modeler/constants/modeler_constants.js";
import { SYSTEM_SETTING } from "~/system/modeler/constants/table_constants.js";

export default {
	name: "SystemSettingBox",
	components: { SwitchFlag, InputField },
	props: {
		setting: { type: Object },
		modelValue: { type: [String, Number, Boolean], default: "" },
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		//==================== Config
		const title = computed(() => props.setting[SYSTEM_SETTING.ID]);
		const description = computed(() => props.setting[ID.DESCRIPTION]);

		// Icon
		const iconPath = computed(() => {
			const type = props.setting[SYSTEM_SETTING.TYPE];
			return `/assets/images/menu/modeler/${type}.svg`;
		});

		// Switch
		const hasFlag = computed(
			() => props.setting[ID.DATA_TYPE] === DATA_TYPE.BOOLEAN,
		);

		/**
		 * SystemValue만 추출하여 이벤트 전송한다.
		 * @param {Object} item
		 */
		function changeFlag(item) {
			emit("update:modelValue", item[SYSTEM_SETTING.VALUE]);
		}

		// Input Field
		const settingConfig = computed(() =>
			Object.assign(
				{ [ID.FEILD]: props.setting[SYSTEM_SETTING.ID] },
				props.setting,
			),
		);

		return {
			// Config
			SYSTEM_SETTING,
			title,
			description,
			iconPath,

			// Switch
			hasFlag,
			changeFlag,

			// Input Field
			settingConfig,
		};
	},
};
</script>

<style>
/* Box */
.c-box {
	flex: 1;
	display: flex;
	padding: 10px;
	margin-bottom: 20px;
	border-radius: 7px;
}
.c-box-left {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 10px;
	box-sizing: border-box;
}
.c-box-right {
	flex: 9;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	padding: 20px 5px;
	box-sizing: border-box;
}
.c-box-right .c-box-title {
	font-weight: bold;
	font-size: 0.8rem;
	margin: 0;
}
.c-box-right .c-box-content {
	color: #888;
	font-size: 0.8rem;
	margin: 10px 0px;
	margin-bottom: 5px;
}

/* Icon */
.c-icon {
	background: #f7f9fc;
	border-radius: 10px;
	padding: 8px;
}
.c-icon i {
	font-size: 28px;
	color: white;
}
.c-icon img {
	width: 45px;
	height: 45px;
}

/* Input */
.c-box-target {
	flex: 2;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 10px;
	box-sizing: border-box;
}
.c-box-right .e-input-group {
	margin-top: 0px !important;
}

/* Switch */
.c-box-right .switch-box {
	transform: translate(20px, 2px) !important;
}
.c-box-right .switch-box .e-switch-wrapper {
	width: 42px !important;
}
.c-box-right .switch-box .e-switch-handle::after {
	transform: translate(0px, 0px) !important;
	left: 3px !important;
	top: 0.3px !important;
}
.c-box-right .switch-box .e-switch-handle.e-switch-active::after {
	left: 4px !important;
}

/* Number */
.c-box-right .e-input-group .e-numerictextbox {
	align-self: center;
}
.c-box-right .e-input-group.e-control-wrapper {
	width: 150px !important;
	border-radius: 5px !important;
	height: 28px !important;
	border: 1px solid #e0e0e0 !important;
}
</style>
