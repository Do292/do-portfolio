<template>
	<ModalUserSetting
		v-if="isShowModalUserSetting"
		@close="toggleModalUserSetting(false)"
	/>
	<wfl-modal-logout
		v-if="isShowModalLogout"
		@close="isShowModalLogout = false"
		@logout="logOut"
	></wfl-modal-logout>
	<nav class="main-header">
		<div class="container-fluid inherit">
			<div class="header-logo">
				<div class="logo">
					<img
						src="/assets/images/aim/link-logo.svg"
						style="width: 44px; padding: 0 4px; cursor: pointer"
						@click="goHome"
					/>
					<img
						id="logo"
						src="/assets/images/aim/MesSuite.svg"
						style="cursor: pointer"
						@click="goHome"
					/>
				</div>
				<img
					src="/assets/images/aim/modeler.svg"
					style="
						width: 109px;
						top: 1px;
						right: 64px;
						position: absolute;
						z-index: 10;
						cursor: pointer;
					"
					@click="goMain"
				/>
			</div>
			<div class="row header-navi">
				<div class="col navbar navbar-expand">
					<span class="menu-searcher text-right">
						<i class="aim aimcons_search_21"></i>
						<wfl-combobox
							ref="menuRef"
							:dataSource="menuIds"
							placeholder="Menu"
							sortOrder="Ascending"
							@focus="openMenuList"
							@update:selectValue="goMenu"
						></wfl-combobox>
					</span>
				</div>
				<div class="navbar right navbar-expand">
					<ul class="navbar-nav-service ml-auto">
						<!--count-downg-->
						<li
							class="nav-item nav-link pl-3"
							@click="resetSession(true)"
						>
							<div class="count-down">
								<div class="count">
									<span>{{
										formatTime(remainingSession)
									}}</span>
									<div
										class="btn btn-md btn-refresh"
										type="resetSession"
									>
										<i class="aim aimcons_refresh1"></i>
									</div>
								</div>
							</div>
						</li>
						<!--usersetting-->
						<li
							class="nav-item nav-link pl-2"
							@click="toggleModalUserSetting(true)"
						>
							<i class="aim aimcons_gear"></i>
						</li>
						<!--logout-->
						<li
							class="nav-item nav-link pl-2"
							@click="isShowModalLogout = true"
						>
							<i class="aim aimcons_exit pl-1"></i>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</nav>
</template>

<script>
import ModalUserSetting from "~/system/modeler/components/common/modal/ModalUserSetting";

import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import {
	useMenu,
	useTab,
	useSystemSetting,
} from "~/system/modeler/plugins/composables/modeler-authority";
import {
	useModalConfig,
	useModalSuccess,
} from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { refresh } from "~/system/modeler/api/modeler-common";
import { MENU } from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "AppHeader",
	components: { ModalUserSetting },
	setup() {
		//==================== Common
		const { executeWithSpinner } = useSpinner();
		const { toggleModalSuccess } = useModalSuccess();
		const {
			isShowModal: isShowModalUserSetting,
			toggleModal: toggleModalUserSetting,
			closeModalAll,
		} = useModalConfig();

		//==================== Menu
		const { t } = useI18n();
		const { menuList, fetchMenuList, checkMenuAction, goHome, goMain } =
			useMenu();
		const { addOrSelectTab } = useTab();
		const menuRef = ref(null);

		const menuIds = computed(() =>
			menuList.value.filter(checkMenuAction).map(menu => ({
				text: t(menu[MENU.NAME] ?? menu[MENU.ID]),
				value: menu[MENU.ID],
			})),
		);

		/**
		 * focus되면 콤보 데이터 열기
		 */
		function openMenuList() {
			menuRef.value.showPopup();
		}

		/**
		 * 선택한 메뉴로 이동한다.
		 * @param {String} menuId
		 */
		function goMenu(menuId) {
			if (menuId) {
				addOrSelectTab(menuId);
			}
		}

		//==================== Login Session
		const { KEY, settingConfig, fetchSettingConfig } = useSystemSetting();
		// 분으로 환산
		const sessionDuration = computed(
			() => settingConfig.value[KEY.SESSION_TIMEOUT] * 60,
		);
		const remainingSession = ref(0);
		const sessionTimer = ref(null);

		/**
		 * 세션 초기화
		 * @todo api 연결
		 */
		function resetSession() {
			executeWithSpinner(() => {
				refresh();
				fetchMenuList();
				remainingSession.value = sessionDuration.value;
				toggleModalSuccess();
			});
		}

		/**
		 * 시간을 mm:ss 형식으로 반환한다
		 * @param {Number} time
		 */
		function formatTime(time) {
			const padWithZero = number =>
				String(Math.floor(number)).padStart(2, 0);

			const minutes = padWithZero(time / 60);
			const seconds = padWithZero(time % 60);
			return `${minutes}:${seconds}`;
		}

		onMounted(async () => {
			// settingDef에서 세션 시간 가져오기 위함.
			await fetchSettingConfig();
			remainingSession.value = sessionDuration.value;

			sessionTimer.value = setInterval(() => {
				if (remainingSession.value) {
					remainingSession.value--;
				} else {
					clearInterval(sessionTimer.value);
					logOut();
				}
			}, 1000);
		});

		// 타이멀르 해제해서 불필요한 메모리 누수 방지
		onUnmounted(() => {
			clearInterval(sessionTimer.value);
		});

		//==================== Logout
		const isShowModalLogout = ref(false);

		/**
		 * @todo 로그아웃 수행
		 */
		async function logOut() {
			// 세션 만료 등으로 자동 로그아웃됐을 때, 기존에 활성화된 모달이 home에서 안 보이다가 재진입 시 보임.
			closeModalAll();
			goHome();
		}

		return {
			// Common
			isShowModalUserSetting,
			toggleModalUserSetting,

			// Menu
			menuRef,
			menuIds,
			goHome,
			goMain,
			goMenu,
			openMenuList,

			// Session
			remainingSession,
			resetSession,
			formatTime,

			// Logout
			isShowModalLogout,
			logOut,
		};
	},
	data() {
		return {
			logoCount: 0,
		};
	},
	mounted() {
		this.$nextTick(() => this.mask(138));
	},
	methods: {
		//==================== ETC
		mask(sec) {
			this.logoCount++;
			if (this.logoCount < sec) {
				let el = document.querySelector(".logo");

				if (el) {
					el.setAttribute(
						"style",
						"-webkit-mask:-webkit-gradient(radial, 17 17, " +
							this.logoCount +
							", 17 17, " +
							(this.logoCount + 15) +
							", from(rgb(255, 255, 255)), color-stop(3, rgba(255, 255, 255, 0.6)), to(rgb(255, 255, 255)));",
					);
				}

				setTimeout(
					function () {
						this.mask(sec);
					}.bind(this),
					20 - this.logoCount,
				);
			} else this.logoCount = 0;
		},
	},
};
</script>
