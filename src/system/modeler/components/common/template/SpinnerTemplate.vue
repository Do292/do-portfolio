<template>
	<div class="spinner">
		<img alt="" src="/assets/images/loader_spinner.gif" />
	</div>
</template>
<script>
export default {
	name: "SpinnerTemplate",
};
</script>
<style>
/* Spinner */
.spinner img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translateX(-50%) translateY(-50%);
	width: 120px;
	height: 120px;
	z-index: 100000000;
}
</style>
