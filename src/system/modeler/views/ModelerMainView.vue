<template>
	<div class="content">
		<div class="container-fluid">
			<object
				id="flowSvg"
				ref="flowSvg"
				data="/assets/images/navi.svg"
				height="100%"
				type="image/svg+xml"
				width="100%"
			></object>
		</div>
	</div>
</template>

<script>
export default {
	name: "ModelerMainView",
};
</script>

<style scoped>
.wrapper .container-fluid {
	height: calc(100vh - 90px);
	background: #f0f2f6 !important;
}
</style>
