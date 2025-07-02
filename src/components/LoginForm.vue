<template>
	<div class="login-form-card">
		<div class="Login login-card-body">
			<div class="text-area text-center">
				<i class="aim aimcons_security mb-2 text-gray"></i>
			</div>
			<InputUserId
				ref="userIdRef"
				v-model="userId"
				:isReadOnly="false"
				@onEnter="logIn"
			/>
			<InputPassword
				ref="passwordRef"
				v-model="password"
				@onEnter="logIn"
			/>
			<div class="input-group login-input mt-1 mb-4">
				<div class="input-group-prepend">
					<span class="input-group-text">
						<i class="aim aimcons_language"></i>
					</span>
				</div>
				<ComboLocale v-model="language" />
			</div>

			<div class="row">
				<div class="col-6">
					<div class="d-table-row">
						<div class="d-table-cell">
							<wfl-checkbox
								v-model="isRemembering"
								label="Remember me"
								labelPosition="After"
							></wfl-checkbox>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row mt-4">
			<div class="col p-0">
				<div class="box">
					<button
						class="button button--nina button--round-l button--text-thick button--inverted w100 login_bt"
						data-text="LogIn"
						@click="logIn"
					>
						<span v-for="letter in 'LogIn'" :key="letter">
							{{ letter }}
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useModalAlert } from "~/plugins/composables/modalHandler";
import {
	useFetchData,
	useLocalStorage,
} from "~/plugins/composables/dataHandler";
import { useUserInfo, useEncryt } from "~/plugins/composables/authority";
import * as USER from "#/modeler/api/user.js";

export default {
	name: "LoginForm",
	setup() {
		//==================== Config
		const { isShowModalAlert } = useModalAlert();
		const { getLocalStorage, toggleLocalStorage } = useLocalStorage();

		const rememberId = getLocalStorage("rememberId");
		const isRemembering = ref(!!rememberId);
		const userId = ref(rememberId);
		const password = ref("");
		const language = ref("ENGLISH");

		//==================== Login
		const i18n = useI18n();
		const { fetchOne } = useFetchData();
		const { initUserState } = useUserInfo();
		const { encryptValue } = useEncryt();
		// const { fetchMenuList } = useMenu();
		const router = useRouter();

		/**
		 * Login 후 user 정보를 저장한다.
		 */
		async function logIn() {
			const data = await fetchOne(() =>
				USER.logIn(userId.value, encryptValue(password.value)),
			);

			// data가 있을 경우 = 로그인 성공
			if (data) {
				initUserState(data, true);
				// isRemebering이 force flag 역할
				toggleLocalStorage(
					"rememberId",
					userId.value,
					isRemembering.value,
				);

				// 언어 설정
				i18n.locale.value = language.value ?? data["DEFAULTLANGTYPE"];

				// await fetchMenuList();
				// Main으로 이동
				router.push({ path: "/main" });
			}
		}

		//==================== Event
		const userIdRef = ref(null);
		const passwordRef = ref(null);

		/**
		 * value 여부에 따라 input 포커싱 수행
		 * @todo userId, password 잘못 입력했을 경우 포커싱 처리
		 */
		function focusInput() {
			if (userId.value && !password.value) {
				passwordRef.value.focus();
			} else {
				userIdRef.value.focus();
			}
		}

		onMounted(focusInput);

		watch(isShowModalAlert, value => {
			if (!value) focusInput();
		});

		return {
			// Config
			isRemembering,
			userId,
			password,
			language,

			// Login
			logIn,

			// Event
			userIdRef,
			passwordRef,
		};
	},
};
</script>
<style scoped>
.aimcons_security {
	font-size: 3.5rem;
	color: #cecece;
}

/* Input */
.login-card-body .input-group > input {
	padding: 0.6rem 0.5rem 0.6rem 3rem !important;
	margin: 0.2rem 0rem 0.2rem 0.2rem !important;
	background: white !important;
	border: none !important;
	border-radius: 30px !important;
}
.login-card-body .input-group > span {
	transform: translate(15px, 10px);
	color: #858384cf;
}
.login-card-body .input-group.password button {
	position: absolute;
	top: 8px;
	right: 15px;
}
.login-card-body .input-group.password.valid input:focus {
	outline: 0px solid #28a745 !important;
}
/* Language */
.input-group.login-input {
	padding: 0.34rem 0.5rem !important;
	transform: translateX(-2px);
	padding-right: 0px !important;
}
.input-group-prepend + .e-input-group {
	width: calc(100% - 55px) !important;
	position: absolute;
	left: -10px;
	top: -9px;
	color: black !important;
}
.login-card-body .input-group .input-group-text {
	color: #858384cf;
}
</style>
