<template>
	<div
		:class="{ on: isShowModalSuccess }"
		class="modal-success"
		@click="closeModalSuccess()"
	>
		<span class="spinner">
			<i id="check" class="aimcons_circle-check"></i>
		</span>
		<b>{{ $t("info.applied") }}</b>
		<button @click="closeModalSuccess()">
			<i id="close" class="aimcons_close"></i>
		</button>
	</div>
</template>

<script>
import { onBeforeUnmount } from "vue";
import { useModalSuccess } from "~/system/modeler/plugins/composables/modeler-modalHandler";
export default {
	name: "ModalSuccess",
	setup() {
		const { isShowModalSuccess, closeModalSuccess } = useModalSuccess();

		onBeforeUnmount(() => closeModalSuccess());

		return { isShowModalSuccess, closeModalSuccess };
	},
};
</script>

<style scoped>
.modal-success {
	position: absolute;
	width: 230px;
	height: 50px;
	bottom: -73px;
	right: 17px;
	padding: 8px 12px;
	z-index: 10000000;
	background: #fa8014;
	border-radius: 5px;
	color: #ffffffee;
	transition: transform 0.5s ease-in;
	cursor: pointer;
}
.modal-success .spinner {
	position: absolute;
	display: inline-block;
	top: -1px;
	left: 0px;
	width: 50px;
	height: 50px;
}
.modal-success #check {
	position: relative;
	font-size: 18px;
	top: 13px;
	left: 16.2px;
	opacity: 0;
	transition: opacity 0.7s linear;
}
.modal-success b {
	position: relative;
	display: block;
	top: 5px;
	left: 35px;
	font-size: 15px;
	opacity: 0;
	transition: opacity 0.5s linear;
	font-weight: 500;
}
.modal-success button {
	position: absolute;
	top: 5px;
	right: 5px;
	width: 20px;
	height: 20px;
	padding: 0;
	background: none;
	border: none;
}
.modal-success button #close {
	opacity: 0;
	color: #ffffffee;
	font-size: smaller;
	transition: opacity 0.1s ease-in;
}
.modal-success button:hover #close {
	color: white;
}
.modal-success.on {
	transform: translateY(-120px);
	transition: transform 0.3s linear;
}
.modal-success.on #check {
	font-size: 18px;
	top: 13px;
	left: 16.2px;
	opacity: 1;
	transition: opacity 0.5s ease-in 0.5s;
	animation: scale-up ease-in 0.5s 0.5s forwards;
	border-radius: 15px;
}
.modal-success.on b {
	opacity: 1;
	transition: opacity 0.7s linear;
}
.modal-success.on button #close {
	opacity: 1;
	transition: opacity 0.2s ease-in 1s;
}
.modal-success .spinner::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 40px;
	height: 40px;
	border: 11px solid #ffffff48;
	border-radius: 50%;
	transform: translate(-50%, -50%) rotate(0deg) scale(0.7);
}
.modal-success.on .spinner::before {
	border: 7px solid #ffffff00;
	animation: spin 0.8s linear 0.2s forwards;
}
@keyframes scale-up {
	0% {
		transform: scale(0);
	}
	90% {
		transform: scale(1.2);
	}
	100% {
		transform: scale(1);
	}
}
@keyframes spin {
	0% {
		transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
		border-top-color: #ffffffdc;
	}
	50% {
		transform: translate(-50%, -50%) rotate(180deg) scale(0.9);
		border-color: #ffffff84 #00b89300;
	}
	90% {
		transform: translate(-50%, -50%) rotate(360deg) scale(0.5);
		border-color: #ffffff0c;
	}
	100% {
		transform: translate(-50%, -50%) rotate(360deg) scale(0.7);
		border: 11px solid #ffffff48;
	}
}
</style>
