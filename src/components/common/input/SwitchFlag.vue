<template>
	<div :class="{ on: checked, enabled }" class="switch-box switch-flag">
		<wfl-switch
			:id="switchId"
			:checked="checked"
			:disabled="!enabled"
			@change="changeFlag"
		></wfl-switch>
	</div>
</template>

<script>
import { computed } from "vue";
import { useItem } from "~/plugins/composables/dataHandler";
import { FLAG } from "~/plugins/wfb-constants.js";

export default {
	name: "SwitchFlag",
	components: {},
	props: {
		config: { type: Object },
		target: { type: String },
		enabled: { type: Boolean, default: true },
	},
	setup(props, { emit }) {
		const switchId = `switch-${Date.now()}`;

		// Target이 없는 경우 column의 field로 대체(GridForm 사용)
		const key = computed(() => props.target ?? props.config.column.field);
		const checked = computed(() => props.config[key.value] === FLAG.Y);

		const { deepCloneItems } = useItem();

		/**
		 * @param {Boolean} flag
		 */
		function changeFlag(flag) {
			const [item] = deepCloneItems([props.config]);
			item[key.value] = flag.checked ? FLAG.Y : FLAG.N;
			emit("onChange", item);
		}

		return { switchId, checked: checked.value, changeFlag };
	},
};
</script>

<style scoped></style>
