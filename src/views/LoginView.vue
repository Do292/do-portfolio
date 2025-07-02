<template>
	<div class="login-wrapper">
		<wfl-modal-alert
			v-if="isShowModalAlert"
			:headerDivClass="modalAlertHeaderDivClass"
			:headerIClass="modalAlertHeaderIClass"
			@close="isShowModalAlert = false"
		>
			<template v-slot:header>
				<span v-html="modalAlertHeaderTitle"></span>
			</template>
			<template v-slot:body>
				<span v-html="modalAlertBodyTag"></span>
			</template>
		</wfl-modal-alert>

		<div class="login-container login-container-centered">
			<div class="login-content">
				<header class="login-header">
					<div>nexBe+ Suite [v{{ packageJson.version }}]</div>
				</header>
				<div class="container-fluid inherit">
					<div class="row inherit">
						<div
							class="col-6 inherit p-0"
							style="
								background: #15003e;
								border-radius: 0 0 2rem;
								box-shadow: 4px 0 8px rgb(0 0 0 / 25%);
								z-index: 999;
							"
						>
							<div
								class="bi-logo"
								style="
									z-index: 100;
									top: calc(50% - 35px);
									display: flex;
									justify-content: center;
								"
							>
								<img
									src="../assets/images/aim/logo.svg"
									style="width: 22%"
								/>
								<div class="logo-text-box">
									<span class="big-name"> nexBe+ Suite </span>
									<span class="small-name">
										nexBe+ Suite
									</span>
								</div>
							</div>
						</div>
						<div class="col-6">
							<LoginForm
								@showModalAlert="showModalAlert"
							></LoginForm>
						</div>
					</div>
				</div>
				<!-- Footer -->
				<footer class="login-footer">
					<div class="container-fluid">
						<div class="row">
							<div class="col text-center">
								<p class="text-center">
									Copyright © 2024 aimSystems inc All rights
									reserved.
								</p>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</div>
	</div>
</template>

<script>
import LoginForm from "~/components/LoginForm.vue";
import modalAlertMixin from "~/plugins/mixin/modal-alert";
import packageJson from "/package.json";

export default {
	name: "LoginView",
	components: {
		LoginForm,
	},
	mixins: [modalAlertMixin],
	data() {
		return {
			packageJson: packageJson,
		};
	},
	mounted() {},
	methods: {
		showModalAlert(type, title, message) {
			this.showModal(type, title, message);
			this.isShowModalAlert = true;
		},
	},
};
</script>

<style>
.control {
	margin: 2em 0;
	position: fixed;
	left: 50%;
	bottom: 0;
	transform: translate(-50%, 0%);
	width: 100%;
}

.control ul {
	display: block;
	margin: 0;
}

.control ul li {
	display: inline-block;
	margin: 1em 0.5em;
}

.control ul li a {
	border-bottom: 1px solid #eee;
	color: #fff;
	text-decoration: none;
	padding: 0.7em 2.5em 0.5em;
	letter-spacing: 1px;
	font-size: 0.9em;
	transition: color 500ms ease, border 500ms ease;
}

.control ul li a:hover {
	color: #ccc;
	border-bottom: 2px solid #ccc;
}

.cf:before,
.cf:after {
	content: " ";
	display: table;
}

.cf:after {
	clear: both;
}

.cf {
	/* *zoom: 1; */
	transform: scale(1);
}

svg.bg {
	position: absolute;
	top: 50%;
	left: 50%;
	right: 50%;
	transform: translate(-50%, -50%);
	opacity: 30%;
}

.path {
	animation: draw 2.5s infinite;
	animation-timing-function: linear;
}

@keyframes draw {
	0% {
	}

	100% {
		stroke-dashoffset: 0;
		stroke-opacity: 1;
	}
}
</style>
