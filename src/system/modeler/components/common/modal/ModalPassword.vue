<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered password">
			<div class="modal-content">
				<div class="modal-header alert-dark">
					<h6 class="modal-title">
						<span>Change Password</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body">
					<div class="container-fluid p-0">
						<div class="row">
							<div
								class="col-12 message-box password text-center mt-1"
							>
								<i class="icons aimcons_lock pr-0"></i>
								<span class="mt-2">
									<div
										class="text-dark h-message text-center"
									>
										<label>
											Please Put in Your Password
										</label>
									</div>
									<div class="check-user">
										<InputPassword
											v-for="(_, key) in passwordConfig"
											:key="key"
											ref="inputRefs"
											v-model="passwordConfig[key]"
											:isValid="invalidKey !== key"
											:placeholderText="key"
											class="required"
											@onEnter="changePassword"
										/>
									</div>
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer justify-content-between">
					<ButtonFooter type="close" @onClick="$emit('close')" />
					<ButtonFooter
						class="apply"
						type="ok"
						@onClick="changePassword"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";
import InputPassword from "~/system/modeler/components/common/input/InputPassword";

import { readonly, ref, reactive, watch, onMounted } from "vue";
import {
	useFetchData,
	useItem,
} from "~/system/modeler/plugins/composables/modeler-dataHandler";
import {
	useModalAlert,
	useModalSuccess,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import {
	useUserInfo,
	useEncryt,
} from "~/system/modeler/plugins/composables/modeler-authority";

import * as USER_SETTING from "~/system/modeler/api/user.js";
import { USER } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "ModalPassword",
	components: {
		ButtonClose,
		ButtonFooter,
		InputPassword,
	},
	emits: ["close"],
	setup(_, { emit }) {
		//==================== Config
		const KEY = readonly({
			CURRENT: "current",
			NEW: "new",
			CONFIRM: "confirm",
		});
		const passwordKeys = Object.values(KEY);

		const { createItem } = useItem();
		const { isShowModalAlert, openModalError } = useModalAlert();
		const { toggleModalSuccess } = useModalSuccess();
		const passwordConfig = reactive(createItem(passwordKeys));

		//==================== Password
		const { fetchOne } = useFetchData();
		const { userInfo } = useUserInfo();
		const { encryptValue } = useEncryt();

		/**
		 * 비밀번호 변경
		 * @todo successModal 매핑
		 */
		async function changePassword() {
			const { NEW, CONFIRM } = KEY;
			const emptyKeys = passwordKeys.filter(key => !passwordConfig[key]);

			if (emptyKeys.length) {
				// Empty Input 안내
				const [emptyKey] = emptyKeys;
				openModalErrorAndFocus(emptyKey, `${emptyKeys.join()} 없어요.`);
				return;
			} else if (passwordConfig[NEW] !== passwordConfig[CONFIRM]) {
				// Confirm 확인
				openModalErrorAndFocus(CONFIRM, "비밀번호 확인 값이 달라요.");
				return;
			}

			const userId = userInfo.value[USER.ID];
			const oldPassword = encryptValue(passwordConfig.current);
			const newPassword = encryptValue(passwordConfig.new);
			const result = await fetchOne(() =>
				USER_SETTING.changePassword({
					userId,
					oldPassword,
					newPassword,
				}),
			);

			if (result) {
				toggleModalSuccess();
				emit("close");
			} else {
				focusingKey.value = passwordKeys[0];
			}
		}

		//==================== Event
		const inputRefs = ref([]);
		const focusingKey = ref(passwordKeys[0]);
		const invalidKey = ref(null);

		/**
		 * input 포커싱
		 */
		function focusInput() {
			invalidKey.value = focusingKey.value;

			const index = passwordKeys.indexOf(focusingKey.value);
			inputRefs.value[index].focus();
		}

		/**
		 * @param {String|null} key
		 * @param {String} message
		 */
		function openModalErrorAndFocus(key, message) {
			focusingKey.value = key ?? passwordKeys[0];
			openModalError(message);
		}

		watch(isShowModalAlert, value => {
			if (!value) {
				focusInput();
			}
		});

		onMounted(() => inputRefs.value[0].focus());

		return { inputRefs, passwordConfig, invalidKey, changePassword };
	},
};
</script>

<style scoped>
:deep(.input-group) {
	padding-left: 10%;
}
:deep(.input-group span) {
	transform: translate(10px, 5px);
}
</style>
