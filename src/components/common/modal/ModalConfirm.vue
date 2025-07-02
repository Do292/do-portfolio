<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered confirm">
			<div class="modal-content">
				<slot name="header">
					<div :class="headerClass">
						<h6 class="modal-title">
							<span>{{ $t(type) }}</span>
						</h6>
						<ButtonClose @onClick="$emit('close')" />
					</div>
				</slot>
				<div class="modal-body confirm">
					<div class="container-fluid">
						<div class="row">
							<div class="col-12 message-box confirm">
								<span>
									<div :class="textClass">
										<slot name="label">
											<label>
												{{ title }}
											</label>
											<span>{{ message }}</span>
										</slot>
									</div>
									<div class="row check-user">
										<div class="col-6">
											<label class="user-field">
												User
											</label>
											<InputUserId v-model="userId" />
										</div>
										<div class="col-6">
											<label class="user-field">
												Password
											</label>
											<InputPassword
												ref="passwordRef"
												v-model="password"
												:canToggle="!isUserVerified"
												:isReadOnly="isUserVerified"
												:isValid="isPasswordValid"
												@onEnter="verifyUser"
											/>
											<ButtonSimple
												:disabled="isUserVerified"
												type="verify"
												@onClick="verifyUser"
											/>
										</div>
									</div>
									<div class="row">
										<div class="col-12">
											<label class="user-field">
												Comment
											</label>
											<textarea
												ref="commentRef"
												v-model="comment"
											></textarea>
										</div>
									</div>
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer justify-content-between">
					<ButtonFooter
						class="btn-con-dblue"
						type="close"
						@onClick="$emit('close')"
					/>
					<ButtonFooter
						:isDisabled="!isUserVerified"
						class="apply btn-con-reg"
						type="ok"
						@onClick="okConfirmData"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";
import ButtonSimple from "~/system/modeler/components/common/button/ButtonSimple";
import InputUserId from "~/system/modeler/components/common/input/InputUserId";
import InputPassword from "~/system/modeler/components/common/input/InputPassword";

import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useModalConfirm,
	useModalAlert,
} from "~/plugins/composables/modalHandler";
import {
	useUserInfo,
	useEncryt,
} from "~/system/modeler/plugins/composables/modeler-authority";
import { useKeyEvent } from "~/system/modeler/plugins/composables/modeler-eventHandler";
import {
	useFetchData,
	useUpdateData,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";

import * as USER_SETTING from "~/system/modeler/api/user.js";
import { USER } from "~/plugins/wfb-constants.js";

export default {
	name: "ModalConfirm",
	components: {
		ButtonClose,
		ButtonFooter,
		ButtonSimple,
		InputUserId,
		InputPassword,
	},
	setup(_, { emit }) {
		//==================== Config
		const { t } = useI18n();
		const { userInfo } = useUserInfo();
		const {
			metaDataId: tableId,
			type,
			count,
			confirmData,
		} = useModalConfirm();
		const { ACTION } = useUpdateData();

		const userId = userInfo.value[USER.ID];
		const title = t("modal.confirm.title", {
			type: t(type.value),
			tableId: t(tableId.value),
			count: count.value,
		});
		const message = t("modal.confirm.message", { type: type.value });

		//==================== Style
		const style = computed(() =>
			type.value === ACTION.DELETE ? "danger" : "dark",
		);
		const headerClass = computed(() => `modal-header alert-${style.value}`);
		const textClass = computed(() => `h-message text-${style.value}`);

		//==================== Verification
		const { fetchOne } = useFetchData();
		const { encryptValue } = useEncryt();
		const { isShowModalAlert } = useModalAlert();

		// Password
		const password = ref("");
		const passwordRef = ref(null);
		const isPasswordValid = ref(false);

		/**
		 * @todo 사용자 검증 무시
		 */
		const isUserVerified = ref(true);

		/**
		 * 비밀번호로 사용자 검증
		 */
		async function verifyUser() {
			const result = await fetchOne(() =>
				USER_SETTING.verify(userId, encryptValue(password.value)),
			);

			if (result) {
				isUserVerified.value = true;
				commentRef.value.focus();
			} else {
				isPasswordValid.value = false;
			}
		}

		watch(
			() => password.value?.length > 0,
			validFlag => {
				// 패스워드 값이 있으면 유효하다고 판단
				isPasswordValid.value = validFlag;
			},
		);

		watch(
			() => isShowModalAlert.value,
			value => {
				if (!value) {
					passwordRef.value.focus();
				}
			},
		);

		onMounted(() => passwordRef.value.focus());

		//==================== Confirm
		const { executeWithSpinner } = useSpinner();
		const { activateApplyEvent } = useKeyEvent();
		const comment = ref("");
		const commentRef = ref(null);

		/**
		 * Confrim api 호출
		 */
		function okConfirmData() {
			executeWithSpinner(async () => {
				emit("close");
				await confirmData.value(comment.value);
			});
		}

		activateApplyEvent(window, okConfirmData);

		return {
			//Config
			tableId,
			type,
			title,
			count,
			message,
			userId,
			userInfo,

			// Style
			headerClass,
			textClass,

			// Verification
			passwordRef,
			password,
			isPasswordValid,
			isUserVerified,
			verifyUser,

			// Confirm
			commentRef,
			comment,
			okConfirmData,
		};
	},
};
</script>

<style scoped></style>
