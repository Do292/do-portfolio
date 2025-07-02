<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header alert-dark">
					<h6 class="modal-title">
						<span>Query Preview</span>
					</h6>
					<ButtonClose @onClick="$emit('close')" />
				</div>
				<div class="modal-body">
					<div class="container-fluid p-0">
						<div class="query-box" v-html="formattedQuery"></div>
					</div>
				</div>
				<div class="modal-footer">
					<ButtonFooter type="close" @onClick="$emit('close')" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ButtonClose from "~/system/modeler/components/common/button/ButtonClose";
import ButtonFooter from "~/system/modeler/components/common/button/ButtonFooter";

import { computed } from "vue";

export default {
	name: "ModalPassword",
	components: {
		ButtonClose,
		ButtonFooter,
	},
	props: {
		query: { type: String },
	},
	emits: ["apply", "close"],
	setup(props) {
		const pattern =
			/\b(select|from|where|and|as|inner join|left join|right join|on|and|or)\b/gi;
		const formattedQuery = computed(() =>
			props.query.replace(
				pattern,
				key =>
					`<span class=${key
						.toLowerCase()
						.replaceAll(" ", "")}>${key}</span>`,
			),
		);

		return {
			formattedQuery,
		};
	},
};
</script>

<style scoped>
.modal-dialog-centered {
	max-width: 30vw !important;
}
.query-box {
	max-height: 150px;
	height: 30vh;
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	background: #f2f4f5;
	padding: 5px 10px;
	overflow: auto;
	white-space: nowrap;
}
</style>
