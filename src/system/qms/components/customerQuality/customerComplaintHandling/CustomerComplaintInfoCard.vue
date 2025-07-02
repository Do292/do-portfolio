<template>
	<div class="handling-info-box">
		<div
			v-for="(complaint, index) of complaintList"
			:key="complaint[COMPLAINT.ID]"
		>
			<div v-if="index !== 0" class="handling-info-border"></div>
			<div
				:class="[
					'handling-info-card',
					{ selecting: isComplaintSelected(complaint) },
				]"
				:style="{ borderColor: getBorderLeftColor(complaint) }"
				@click="selectComplaint(complaint)"
			>
				<div class="handling-info-header mb-1">
					<div>
						<span class="handling-info-title">
							{{ complaint[COMPLAINT.TITLE] }}
						</span>
					</div>
					<div>
						<span class="handling-info-date mr-1">
							<i
								v-if="complaint[COMPLAINT.DUE_DATE]"
								class="aimcons_carlendar_check"
							></i>
							{{ complaint[COMPLAINT.DUE_DATE] }}
						</span>
						<span
							:class="complaint[COMPLAINT.PRIORITY]"
							class="handling-info-priority mr-1"
						>
							{{ complaint[COMPLAINT.PRIORITY] }}
						</span>
						<span class="handling-info-step">{{
							complaint[COMPLAINT.STEP]
						}}</span>
					</div>
				</div>
				<div class="handling-info-content">
					{{ complaint[COMPLAINT.CONTENT] }}
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
	CUSTOMER_COMPLAINT as COMPLAINT,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "CustomerComplaintInfoCard",
	props: {
		searchCondition: { type: Array },
	},
	setup(props, { emit }) {
		const { fetchList } = useFetchData();
		const { findItem } = useItem();
		const complaintList = ref([]);
		const selectedComplaint = ref({});

		const isComplaintSelected = computed(
			() => complaint =>
				selectedComplaint.value[COMPLAINT.ID] ===
				complaint[COMPLAINT.ID],
		);

		onActivated(() => {
			selectComplaintByState();
		});

		onBeforeMount(async () => {
			await fetchComplaintList();
			selectComplaintByState();
		});

		watch(() => props.searchCondition, fetchComplaintList);

		/**
		 * 불만 목록을 가져온 후 정렬한다.
		 */
		async function fetchComplaintList() {
			const metaDataId = META.CUSTOMER_COMPLAINT;
			const { searchCondition } = props;

			complaintList.value = await fetchList(() =>
				COMMON.getBy({ metaDataId, searchCondition }),
			);

			// 최신순으로 정렬
			complaintList.value.sort(
				(a, b) => b[COMPLAINT.ID] - a[COMPLAINT.ID],
			);

			if (complaintList.value.length) {
				// 가장 최근 데이터 선택
				selectComplaint(complaintList.value[0]);
			}
		}

		/**
		 * Complaint 선택
		 */
		function selectComplaint(config) {
			if (config) {
				selectedComplaint.value = config;
				emit("select", config);
			}
		}

		/**
		 * ID로 Complaint 선택
		 */
		function selectComplaintBy(id) {
			if (complaintList.value.length) {
				const complaint = findItem(
					complaintList.value,
					COMPLAINT.ID,
					id,
				);
				selectComplaint(complaint);
			}
		}

		/**
		 * history state로 Complaint 선택
		 */
		function selectComplaintByState() {
			if (history.state[COMPLAINT.ID]) {
				selectComplaintBy(history.state[COMPLAINT.ID]);
			}
		}

		function getBorderLeftColor(complaint) {
			switch (complaint[COMPLAINT.PRIORITY]) {
				case "High":
					return "#d81b60";
				case "Middle":
					return "#fc7e17";
				case "Low":
					return "#06c755";
				default:
					return "black";
			}
		}

		return {
			COMPLAINT,
			complaintList,
			isComplaintSelected,
			selectComplaint,
			getBorderLeftColor,
		};
	},
};
</script>

<style scoped></style>
