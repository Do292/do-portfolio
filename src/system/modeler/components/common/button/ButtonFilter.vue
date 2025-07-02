<template>
	<ButtonBasic
		:class="{ filtering: isFiltering }"
		type="filter"
		@onClick="toggleModalFilter()"
	/>
	<!-- expression api 중복 호출 방지 위하여 show로 토글 고려 -->
	<ModalFilter
		v-if="isShowModalFilter"
		@apply="validateFilterConfig"
		@close="toggleModalFilter(false)"
	/>
</template>

<script>
import ModalFilter from "~/system/modeler/components/common/modal/ModalFilter";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";

import { inject, computed } from "vue";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";

export default {
	name: "ButtonFilter",
	components: { ModalFilter, ButtonBasic },
	emits: ["onFilter"],
	setup(_, { emit }) {
		// GridForm에 정의되어 있음.
		const {
			filterConfig,
			filteredFields,
			isShowModalFilter,
			toggleModalFilter,
		} = inject("filter");
		const { filterItem } = useItem();

		// config value 감지하여 필터링 여부 확인
		const isFiltering = computed(() => filteredFields.value.length > 0);

		/**
		 * 유효한 프로퍼티만 남겨 config 재정의 후 그리드 데이터 바인딩을 위한 이벤트 전송
		 * @param {Object} config
		 */
		function validateFilterConfig(config) {
			const validKeys = Object.keys(config).filter(key => config[key]);
			filterConfig.value = filterItem(config, validKeys);

			emit("onFilter");
		}

		return {
			isShowModalFilter,
			toggleModalFilter,

			isFiltering,
			validateFilterConfig,
		};
	},
};
</script>

<style scoped>
.filtering {
	color: #ae57c0 !important;
}
</style>
