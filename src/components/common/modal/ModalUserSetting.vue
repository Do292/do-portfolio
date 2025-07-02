<template>
	<div :class="{ 'modal-close': isClosing }" class="modal-mask">
		<ModalChangePassword
			v-if="isShowModalPassword"
			@close="toggleModalPassword(false)"
		/>
		<div aria-modal="true" class="modal-dialog-top setting">
			<div class="modal-small-content setting-container alert-content">
				<div class="row modal-header setting-header">
					<h6 class="modal-title">
						<span>{{ $t("modal.userSetting.title") }}</span>
					</h6>
					<ButtonBasic type="close" @onClick="closeModal" />
				</div>
				<div class="modal-body setting-body">
					<div class="container-fluid">
						<div class="row between">
							<div class="col-12 line-bottom p-1 mb-2">
								<div class="user-box mb-2">
									<div class="d-table inherit w100">
										<div class="d-table-row">
											<div class="d-table-cell">
												<div
													class="d-table-cell v-middle"
													style="position: relative"
												>
													<div
														class="user-icon"
														@click="selectImage"
													>
														<img :src="userImage" />
													</div>
													<ButtonImage
														ref="imageRef"
														@apply="updateUserImage"
													/>
												</div>
												<div
													class="d-table-cell v-middle p-2 w100"
												>
													<div
														class="d-table-row user-name"
													>
														{{ userInfo.USERID }}
													</div>
													<div
														class="d-table-row user-email"
													>
														{{ userInfo.EMAIL }}
													</div>
												</div>
											</div>
											<div
												class="d-table-cell"
												style="text-align: end"
											>
												<div
													class="btn btn-sm btn-lock"
													type="changePassword"
													@click="
														toggleModalPassword(
															true,
														)
													"
												>
													<i
														class="aim aimcons_lock"
													></i>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="row between inherit">
							<div class="col-12">
								<div class="text-dark item-title-small">
									<label>
										{{ $t("modal.userSetting.change") }}
									</label>
								</div>
								<div class="d-table table-item text-dark">
									<div class="d-table-row between">
										<div class="d-table-cell pl-1 language">
											<i class="aim aimcons_gps mr-2"></i>
											{{ $t("setting.factory") }}
										</div>
										<div class="d-table-cell input">
											<ComboFactory v-model="factory" />
										</div>
									</div>
									<div class="d-table-row between">
										<div class="d-table-cell pl-1 language">
											<i
												class="aim aimcons_language mr-2"
											></i>
											{{ $t("setting.language") }}
										</div>
										<div class="d-table-cell input">
											<ComboLocale v-model="language" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer inherit">
					<div class="col-12">
						<div class="item-box float-right">
							<ButtonFooter type="set" @onClick="setUserInfo" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ButtonImage from "~/system/modeler/components/common/button/ButtonImage";
import ComboFactory from "~/system/modeler/components/common/combo/ComboFactory";

import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
	useModalConfig,
	useModalAlert,
} from "~/plugins/composables/modalHandler";
import { useUserInfo } from "~/plugins/composables/authority";
import { useUpdateData } from "~/plugins/composables/dataHandler";
import { USER } from "~/plugins/wfb-constants.js";

export default {
	name: "ModalUserSetting",
	components: { ButtonImage, ComboFactory },
	emits: ["close"],
	setup(_, { emit }) {
		//==================== Modal
		const {
			isShowModal: isShowModalPassword,
			toggleModal: toggleModalPassword,
		} = useModalConfig();
		const { openModalWarning } = useModalAlert();
		const isClosing = ref(false);

		/**
		 * close 애니메이션 후 이벤트 전송
		 */
		function closeModal() {
			isClosing.value = true;
			setTimeout(() => emit("close"));
		}

		//==================== Config
		const i18n = useI18n();
		const {
			// Info
			userInfo,
			userImage,
			userLanguage,
			mergeUserInfo,
			updateUserImage,
		} = useUserInfo();
		const language = ref(userLanguage.value);
		const factory = ref(null);

		const { modifyList } = useUpdateData();

		function validateUserInfo() {
			if (!factory.value) {
				openModalWarning("Factory를 선택해주세요.");
				return false;
			}
			if (!language.value) {
				openModalWarning("Language를 선택해주세요.");
				return false;
			}
			return true;
		}

		/**
		 * @todo api 변경할 것
		 */
		async function setUserInfo() {
			if (!validateUserInfo()) {
				return;
			}

			i18n.locale.value = language.value;

			const config = {
				[USER.ID]: userInfo.value[USER.ID],
				[USER.LANGUAGE]: language.value,
				[USER.FACTORY_ID]: factory.value,
			};

			await modifyList("UserInfo", [config], "", false);
			mergeUserInfo(config);
			closeModal();
		}

		//==================== Image
		const imageRef = ref(null);

		function selectImage() {
			imageRef.value.selectImage();
		}

		return {
			// Modal Close
			isClosing,
			closeModal,

			// Modal Change Password
			isShowModalPassword,
			toggleModalPassword,

			// Config
			userInfo,
			userImage,
			language,
			factory,
			setUserInfo,
			updateUserImage,

			// Image
			imageRef,
			selectImage,
		};
	},
};
</script>

<style scoped>
/* Modal */
.modal-mask {
	transition: none !important;
}

/* Language */
.language.d-table-cell {
	width: 148px;
}
.language i {
	font-size: 1.2rem;
	line-height: 20px;
}
.language + .d-table-cell.input {
	padding-right: 0 !important;
}

/* Image */
.user-icon {
	border-radius: 100%;
	overflow: hidden;
	margin-right: 10px;
}
.user-icon img {
	height: 100%;
	cursor: pointer;
}
.user-icon:hover + :deep(.btn-image) {
	color: #f97203 !important;
}

/* Button */
.btn-simple {
	transform: translateX(5px);
}
:deep(.btn-simple:hover),
:deep(.btn-simple:active) {
	color: #f97203 !important;
}
:deep(.btn-image) {
	position: absolute;
	left: 55px;
	bottom: 2px;
}
</style>
