<template>
	<button class="close" @click="onClick">
		<i class="aim aimcons_close"></i>
	</button>
</template>

<script>
export default {
	// CRUD용 박스 버튼
	name: "ButtonClose",
	emits: ["onClick"],
	methods: {
		onClick(e) {
			e.stopPropagation();
			this.$emit("onClick");
		},
	},
};
</script>
