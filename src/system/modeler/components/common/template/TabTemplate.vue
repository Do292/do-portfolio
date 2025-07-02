<template>
	<wfl-tabbasic
		ref="tabRef"
		:animation="animation"
		:selectedItem="tabIndex"
		:showCloseButton="isRemovable"
		:tabActionSettings="tabActionSetting"
		class="e-background"
		overflowMode="Scrollable"
		@removing="$emit('close', $event.removedIndex)"
		@selected="clickTab"
	>
		<wfl-tabitems>
			<wfl-tabitem
				v-for="tab in tabs"
				:key="tab.getKey()"
				v-bind="tab"
			></wfl-tabitem>
		</wfl-tabitems>
	</wfl-tabbasic>
	<slot name="tabContent">
		<div v-for="tab in tabs" :id="tab.getId()" :key="tab.getKey()">
			<slot :name="tab.getKey()"></slot>
		</div>
	</slot>
</template>

<script>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTemplate } from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";

export default {
	name: "TabTemplate",
	props: {
		tabIndex: { type: Number, default: 0 },
		tabKeys: { type: Array },
		isRemovable: { type: Boolean, default: true },
	},
	emits: ["select", "close"],
	setup(props, { emit }) {
		//==================== Config
		const { Base } = useTemplate("tab");
		const { t } = useI18n();

		class Tab extends Base {
			constructor(key) {
				// key는 Tag의 ID이므로 공백이랑 ":" 제외
				super(key.replace(/ |:/g, ""));
				this.header = { text: t(key) };
			}
		}

		const tabs = computed(() => props.tabKeys.map(tab => new Tab(tab)));

		//==================== Mehtod
		const tabRef = ref(null);

		/**
		 * @param {Object} event
		 * @param {Boolean} event.isSwiped
		 * @param {Boolean} event.isInteracted
		 * @param {Number} event.selectedIndex
		 */
		function clickTab({ isSwiped, isInteracted, selectedIndex: index }) {
			if (!isSwiped && isInteracted) {
				//탭 클릭하여 선택한 경우 이벤트 전송
				emit("select", index);
			} else if (index !== props.tabIndex) {
				//라우터 이동에 의한 탭 선택
				tabRef.value.select(props.tabIndex);
			}
		}

		return {
			// Config
			tabRef,
			tabs,

			// Method
			clickTab,
		};
	},
	data() {
		return {
			tabActionSetting: {
				effect: "None",
			},
			animation: {
				previous: {
					effect: "None",
				},
				next: {
					effect: "FadeIn",
				},
			},
		};
	},
};
</script>

<style scoped></style>
