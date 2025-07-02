<template>
	<div class="card">
		<div class="card-body">
			<div class="row">
				<div class="col">
					<div class="row">
						<div class="d-table table-item">
							<div class="category">
								<div class="d-table-row">
									<div class="d-table-cell">
										<div class="d-table-cell">
											<span
												:class="'mr-2 input-title-redonly'"
											>
												{{ $t("materialId") }}
											</span>
										</div>
									</div>
									<div class="d-table-cell">
										<wfl-textbox
											:id="'material'"
											:ref="'material'"
											v-model="materialId"
											@update:modelValue="
												onValueChanged(
													materialId,
													$event,
												)
											"
										></wfl-textbox>
									</div>
									<div class="d-table-cell">
										<ButtonBasic
											style="
												position: absolute;
												right: 15px;
												top: 20px;
											"
											type="search"
											@onClick="searchButtonClicked"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- <SearchCondition
						:conditionId="conditionId"
						:customConditionList="customConditionList"
						@searchClicked="search"
					/> -->

					<InspectionResultRegistrationForm
						ref="InspectionResultRegistrationForm"
					></InspectionResultRegistrationForm>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {
	getCurrentInstance,
	ref,
	// computed
} from "vue";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import InspectionResultRegistrationForm from "../../../../components/inspectionResultRegistration/InspectionResultRegistrationForm.vue";

export default {
	name: "InspectionResultRegistrationView",
	components: { InspectionResultRegistrationForm },
	data() {
		// return { conditionId: "InspectionResultRegistration" };
	},
	setup() {
		const materialId = ref("");
		const InspectionResultRegistrationForm = ref(null);
		const { proxy } = getCurrentInstance();
		const { openModalWarning } = useModalAlert();

		// const materialId = computed(() => {
		// 	return materialId.value;
		// });

		function onValueChanged(data) {
			materialId.value = data;
		}
		function searchButtonClicked() {
			if (proxy.$isEmpty(materialId.value)) {
				openModalWarning("materialId를 입력해주세요");
				return;
			}

			InspectionResultRegistrationForm.value.getLotItems(
				materialId.value,
			);
			InspectionResultRegistrationForm.value.getSpecItems(
				materialId.value,
			);
		}

		return {
			InspectionResultRegistrationForm,
			materialId,
			onValueChanged,
			searchButtonClicked,
		};
	},
};
</script>
<style scoped>
.table-item {
	width: 100% !important;
}
.category {
	background-color: #f7f9fc;
	border: 2px solid #e7eefa !important;
	border-radius: 5px;
	padding: 15px;
	margin-bottom: 5px;
}

.input-title-redonly:before {
	content: "\ea70";
	font-family: aimcons;
	color: red;
}
/* :deep(.e-input-group.e-control-wrapper) {
	border: 1px solid #ced4da !important;
	border-radius: 5px !important;
} */
</style>
