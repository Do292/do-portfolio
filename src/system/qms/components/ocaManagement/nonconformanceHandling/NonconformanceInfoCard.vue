<template>
	<div class="handling-info-box">
		<div
			v-for="(nonconformance, index) of nonconformanceList"
			:key="nonconformance[NONCONFORMANCE.ID]"
		>
			<div v-if="index !== 0" class="handling-info-border"></div>
			<div
				:class="[
					'handling-info-card',
					{ selecting: isNonconformanceSelected(nonconformance) },
				]"
				@click="selectNonconformance(nonconformance)"
			>
				<div class="handling-info-header">
					<div>
						<span class="handling-info-title">
							{{ nonconformance[NONCONFORMANCE.TITLE] }}
						</span>
					</div>
					<div>
						<span class="handling-info-date mr-1">
							<i
								v-if="nonconformance[NONCONFORMANCE.DUE_DATE]"
								class="aimcons_carlendar_check"
							></i>
							{{ nonconformance[NONCONFORMANCE.DUE_DATE] }}
						</span>
						<span class="handling-info-step">
							{{ nonconformance[NONCONFORMANCE.STEP] }}
						</span>
					</div>
				</div>
				<div class="handling-info-content">
					{{ nonconformance[NONCONFORMANCE.CONTENT] }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, watch, computed, onBeforeMount, onActivated } from "vue";
import { useFetchData, useItem } from "~/plugins/composables/dataHandler";

import * as COMMON from "~/api/common";
import {
	META,
	NONCONFORMANCE,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "NonconformanceInfoCard",
	props: {
		searchCondition: { type: Array },
	},
	setup(props, { emit }) {
		const { fetchList } = useFetchData();
		const { findItem } = useItem();
		const nonconformanceList = ref([]);
		const selectedNonconformance = ref({});

		const isNonconformanceSelected = computed(
			() => nonconformance =>
				selectedNonconformance.value[NONCONFORMANCE.ID] ===
				nonconformance[NONCONFORMANCE.ID],
		);

		onActivated(() => {
			selectNonconformancByState();
		});

		onBeforeMount(async () => {
			await fetchNonconformanceList();
			selectNonconformancByState();
		});

		watch(() => props.searchCondition, fetchNonconformanceList);

		/**
		 * 부적합 목록을 가져온 후 정렬한다.
		 */
		async function fetchNonconformanceList() {
			const metaDataId = META.NONCONFORMANCE;
			const { searchCondition } = props;

			nonconformanceList.value = await fetchList(() =>
				COMMON.getBy({ metaDataId, searchCondition }),
			);

			// 최신순으로 정렬
			nonconformanceList.value.sort(
				(a, b) => b[NONCONFORMANCE.ID] - a[NONCONFORMANCE.ID],
			);

			if (nonconformanceList.value.length) {
				// 가장 최근 데이터 선택
				selectNonconformance(nonconformanceList.value[0]);
			}
		}

		/**
		 * Nonconformance 선택
		 */
		function selectNonconformance(config) {
			if (config) {
				selectedNonconformance.value = config;
				emit("select", config);
			}
		}

		/**
		 * ID로 Nonconformance 선택
		 */
		function selectNonconformanceBy(id) {
			if (nonconformanceList.value.length) {
				const nonconformance = findItem(
					nonconformanceList.value,
					NONCONFORMANCE.ID,
					id,
				);
				selectNonconformance(nonconformance);
			}
		}

		/**
		 * history state로 Nonconformance 선택
		 */
		function selectNonconformancByState() {
			if (history.state[NONCONFORMANCE.ID]) {
				selectNonconformanceBy(history.state[NONCONFORMANCE.ID]);
			}
		}

		return {
			NONCONFORMANCE,
			nonconformanceList,
			isNonconformanceSelected,
			selectNonconformance,
		};
	},
};
</script>

<style scoped></style>
