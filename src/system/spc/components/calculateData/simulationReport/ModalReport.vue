<template>
	<div class="modal-mask">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h6 class="modal-title">
						<span>Simulation Report (설계 후 추가 수정 필요)</span>
					</h6>
					<ButtonBasic type="close" @onClick="$emit('close')" />
				</div>
				<div class="modal-body text-dark p-2">
					<div class="card mb-0">
						<div class="col-12 item-title pl-2">
							<label>Data Info</label>
						</div>

						<div class="d-table table-item w100">
							<div
								v-for="key of keyList"
								:key="key"
								class="d-table-row"
							>
								<div class="d-table-cell">
									<span> {{ key }} </span>
								</div>
								<div class="d-table-cell p-0">
									<div class="pl-2">
										{{ item[key] }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<ButtonBasic
						class="btn btn-md btn-footer"
						type="close"
						@onClick="$emit('close')"
					>
						<label>Close</label>
					</ButtonBasic>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "ModalReport",
	props: {
		item: {
			type: Object,
			default() {
				return {};
			},
		},
	},
	setup(props) {
		const keyList = Object.keys(props.item);

		return { keyList };
	},
	computed: {},
};
</script>
<style scoped>
@media (max-width: 1690px) {
	.modal-content {
		height: calc(100vh - 260px);
	}
}
@media (max-width: 1480px) {
	.modal-content {
		height: calc(100vh - 220px);
	}
}
</style>
