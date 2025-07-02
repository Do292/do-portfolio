<template>
	<div class="handling-info-box">
		<div
			v-for="(supplierAudit, index) of supplierAuditList"
			:key="supplierAudit[SUPPLIER_AUDIT.ID]"
		>
			<div v-if="index !== 0" class="handling-info-border"></div>
			<div
				:class="[
					'handling-info-card',
					{ selecting: isSupplierAuditSelected(supplierAudit) },
				]"
				@click="selectSupplierAudit(supplierAudit)"
			>
				<div class="handling-info-header">
					<div>
						<span class="handling-info-title">
							{{ supplierAudit[SUPPLIER_AUDIT.TITLE] }}
						</span>
					</div>
					<div>
						<span class="handling-info-step">
							{{ supplierAudit[SUPPLIER_AUDIT.STEP] }}
						</span>
					</div>
				</div>
				<div class="handling-info-content">
					{{ supplierAudit[SUPPLIER_AUDIT.CONTENT] }}
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
	SUPPLIER_AUDIT,
} from "~/system/qms/constants/qms_meta_constants.js";

export default {
	name: "SupplierAuditInfoCard",
	props: {
		searchCondition: { type: Array },
	},
	setup(props, { emit }) {
		const { fetchList } = useFetchData();
		const { findItem } = useItem();
		const supplierAuditList = ref([]);
		const selectedSupplierAudit = ref({});

		const isSupplierAuditSelected = computed(
			() => supplierAudit =>
				selectedSupplierAudit.value[SUPPLIER_AUDIT.ID] ===
				supplierAudit[SUPPLIER_AUDIT.ID],
		);

		onActivated(() => {
			selectSupplierAuditByState();
		});

		onBeforeMount(async () => {
			await fetchSupplierAuditList();
			selectSupplierAuditByState();
		});

		watch(() => props.searchCondition, fetchSupplierAuditList);

		/**
		 * 부적합 목록을 가져온 후 정렬한다.
		 */
		async function fetchSupplierAuditList() {
			const metaDataId = META.SUPPLIER_AUDIT;
			const { searchCondition } = props;

			supplierAuditList.value = await fetchList(() =>
				COMMON.getBy({ metaDataId, searchCondition }),
			);

			// 최신순으로 정렬
			supplierAuditList.value.sort(
				(a, b) => b[SUPPLIER_AUDIT.ID] - a[SUPPLIER_AUDIT.ID],
			);

			if (supplierAuditList.value.length) {
				// 가장 최근 데이터 선택
				selectSupplierAudit(supplierAuditList.value[0]);
			}
		}

		/**
		 * SupplierAudit 선택
		 */
		function selectSupplierAudit(config) {
			if (config) {
				selectedSupplierAudit.value = config;
				emit("select", config);
			}
		}

		/**
		 * ID로 SupplierAudit 선택
		 */
		function selectSupplierAuditBy(id) {
			if (supplierAuditList.value.length) {
				const supplierAudit = findItem(
					supplierAuditList.value,
					SUPPLIER_AUDIT.ID,
					id,
				);
				selectSupplierAudit(supplierAudit);
			}
		}

		/**
		 * history state로 Complaint 선택
		 */
		function selectSupplierAuditByState() {
			if (history.state[SUPPLIER_AUDIT.ID]) {
				selectSupplierAuditBy(history.state[SUPPLIER_AUDIT.ID]);
			}
		}

		return {
			SUPPLIER_AUDIT,
			supplierAuditList,
			isSupplierAuditSelected,
			selectSupplierAudit,
		};
	},
};
</script>

<style scoped></style>
