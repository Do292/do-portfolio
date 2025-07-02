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
						style="width: 43px; padding: 0 4px; cursor: pointer"
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
					:src="getSystemLogo()"
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
							placeholder="Menu"
							sortOrder="Ascending"
						></wfl-combobox>
						<!-- TODO : Menu Combobox 처리
							:dataSource="menuIds"
							@focus="openMenuList"
							@update:selectValue="goMenu" -->
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
									<!-- <span>{{
										formatTime(remainingSession)
									}}</span> -->
									<div
										class="btn btn-md btn-refresh"
										type="resetSession"
									>
										<i class="aim aimcons_refresh1"></i>
									</div>
								</div>
							</div>
						</li>
						<!-- <li class="nav-item nav-link pl-3">
							<div class="count-down">
								<div class="count">
									<span> - </span>
									<div
										class="btn btn-md btn-refresh"
										type="resetSession"
									>
										<i class="aim aimcons_refresh1"></i>
									</div>
								</div>
							</div>
						</li> -->
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
import { ref } from "vue";
import { useMenu, useSystem } from "~/plugins/composables/authority";
import { useModalConfig } from "~/plugins/composables/modalHandler";

export default {
	name: "SuiteHeader",
	components: {},
	setup() {
		const {
			isShowModal: isShowModalUserSetting,
			toggleModal: toggleModalUserSetting,
			// closeModalAll,
		} = useModalConfig();
		const { goHome, goMain } = useMenu();
		const { systemId } = useSystem();
		const isShowModalLogout = ref(false);

		async function logOut() {
			// 모든 모달 닫고 suite 홈으로
			// closeModalAll();   -> Modeler에서 Modeler 전용 Header, Modal을 쓰기 때문에 Modal이 제대로 닫히지 않아서 추가한 로직임
			goHome();
		}

		/**
		 * 제품 Logo 파일 위치 반환
		 * @returns {String}
		 */
		function getSystemLogo() {
			return `/assets/images/aim/${systemId.value}.svg`;
		}

		return {
			// Common
			isShowModalUserSetting,
			toggleModalUserSetting,

			// Menu
			goHome,
			goMain,
			getSystemLogo,

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

<style></style>
