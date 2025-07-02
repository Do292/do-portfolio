<template>
	<div>
		<ModalSearch
			v-if="isShowModalSearch"
			:condition="dependency"
			:inputQuery="expression"
			:searchField="field"
			@apply="applyItem"
			@close="isShowModalSearch = false"
		/>
		<div class="search-field">
			<wfl-textbox
				:id="id"
				ref="input"
				:enabled="!isDisabled"
				:enteredValue="value"
				:floatLabelType="floatLabelType"
				:placeholder="placeholder"
				:readonly="!isWritable"
				autocomplete="off"
				class="form-control search-input"
				@blur="deactivateCursor"
				@focus="activateCursor"
				@keydown.backspace="handleBackspaceInput"
				@keyup.enter="handleEnterInput"
				@update:enteredValue="$emit('update:modelValue', $event)"
			/>
			<span ref="cursor"></span>
			<ButtonBasic
				v-if="!$isEmpty(this.value)"
				id="resetButton"
				:disabled="isDisabled"
				style="right: 24px"
				type="close"
				@onClick="resetInput"
			/>
			<ButtonBasic
				:disabled="isDisabled"
				type="search"
				@onClick="clickSearchButton"
			/>
		</div>
	</div>
</template>

<script>
import { ref } from "vue";

export default {
	name: "InputSearch",
	components: {},
	props: {
		id: { type: String },
		isWritable: { type: Boolean, default: false },
		isDisabled: { type: Boolean, default: false },
		placeholder: { type: String, default: " " },
		floatLabelType: { type: String, default: "Always" },
		value: { type: [String, Number] },
		field: { type: String },

		// Expression
		dependency: { type: Object },
		expression: { type: String },
	},
	computed: {
		$input() {
			return this.$refs.input;
		},
		$cursor() {
			return this.$refs.cursor;
		},
	},
	methods: {
		handleBackspaceInput() {
			this.resetInput();
			this.deactivateCursor();
		},
		handleEnterInput() {
			if (this.isWritable) this.$emit("search", this.value);
		},
		resetInput() {
			this.$input.value = "";
			this.$emit("reset");
		},
		activateCursor() {
			const { value } = this.$input;
			if (value && !this.isDisabled) {
				this.$cursor.textContent = value;
				this.$cursor.classList.add("on");
			}
		},
		deactivateCursor() {
			if (!this.isDisabled) {
				this.$cursor.textContent = "";
				this.$cursor.classList.remove("on");
			}
		},
	},
	setup(props, { emit }) {
		// Modal
		const isShowModalSearch = ref(false);

		// Button
		function clickSearchButton() {
			if (props.isWritable) {
				emit("search");
			} else {
				isShowModalSearch.value = true;
			}
		}

		function applyItem(item) {
			emit("search", [item]);
		}

		return {
			// Modal
			isShowModalSearch,
			applyItem,

			// Button
			clickSearchButton,
		};
	},
};
</script>

<style scoped></style>
