<template>
	<wfl-querybuilder
		id="querybuilder"
		ref="querybuilderRef"
		:fieldMode="FIELD_MODE"
		:separator="SEPARATOR"
		width="100%"
	>
		<wfl-columns>
			<wfl-column
				v-for="table in tableConfigs"
				:key="table.getKey()"
				v-bind="table"
			/>
		</wfl-columns>
	</wfl-querybuilder>
</template>

<script>
import { DropDownList } from "@syncfusion/ej2-dropdowns";
import { createElement } from "@syncfusion/ej2-base";

import { computed, ref, readonly } from "vue";
import {
	useTemplate,
	useInputBase,
} from "~/system/modeler/plugins/composables/modeler-syncfusionHelper";

import { ID } from "~/system/modeler/constants/modeler_constants.js";

export default {
	name: "QueryBuilderTemplate",
	props: {
		tables: { type: Array },
		tableColumns: { type: Array },
		dependencyColumns: { type: Array },
	},
	setup(props) {
		//==================== Config
		const FIELD_MODE = "DropdownTree";
		const SEPARATOR = ".";
		const querybuilderRef = ref(null);

		/**
		 * @param {String} value
		 * @param {HTMLElement} element
		 */
		function updateRule(value, element) {
			querybuilderRef.value.notifyChange(value, element);
		}

		/**
		 * @returns {String}
		 */
		function getSql() {
			const rules = querybuilderRef.value.getRules();
			return querybuilderRef.value.getSqlFromRules(rules);
		}

		//==================== Table
		const { Base, joinIdWith } = useTemplate();

		class ConfigBase extends Base {
			constructor(key) {
				super(key);

				this.field = key;
				this.label = key;
			}
		}

		class TableConfig extends ConfigBase {
			constructor(key) {
				super(key);

				this.columns = props.tableColumns
					.filter(column => column[ID.META_ID] === key)
					.map(column => new ColumnConfig(column));
			}
		}

		const tableConfigs = computed(() =>
			props.tables.map(table => new TableConfig(table)),
		);

		//==================== Column
		const { InputTextBase, InputListBase, InputTreeBase } = useInputBase();
		const { META_ID, META_DETAIL_ID } = ID;

		class InputText extends InputTextBase {
			constructor(id) {
				super(id);

				this.change = ({ value, container }) =>
					updateRule(`'${value}'`, container);
				this.init();
			}
		}

		class InputColumn extends InputTreeBase {
			constructor(id) {
				const TEXT = "text";
				const VALUE = "value";
				const CHILDREN = "columns";

				const dataSource = props.tables.map(table => ({
					[VALUE]: table,
					[TEXT]: table,
					[CHILDREN]: props.tableColumns
						.filter(column => column[META_ID] === table)
						.map(column => ({
							...column,
							[VALUE]: column[META_DETAIL_ID],
							[TEXT]:
								column[META_ID] + "." + column[META_DETAIL_ID],
						})),
					selectable: false,
				}));

				super(id, dataSource, TEXT, VALUE, CHILDREN);

				this.change = ({ element }) =>
					updateRule(element.value, element);
				this.init();
			}
		}

		class InputDependency extends InputListBase {
			constructor(id) {
				super(
					id,
					props.dependencyColumns,
					META_DETAIL_ID,
					META_DETAIL_ID,
					META_ID,
				);

				this.change = ({ value, element }) =>
					updateRule(`:${value}`, element);
				this.init();
			}
		}

		const VALUE_TYPE = readonly({
			TEXT: "Text",
			COLUMN: "Column",
			DEPENDENCY: "Dependency",
		});

		const VALUE_COMPONENT = readonly({
			[VALUE_TYPE.TEXT]: InputText,
			[VALUE_TYPE.COLUMN]: InputColumn,
			[VALUE_TYPE.DEPENDENCY]: InputDependency,
		});

		class ColumnTemplate {
			static #index = 0;

			joinIdByIndex(key) {
				const index = ColumnTemplate.#index;
				return joinIdWith([key, index]);
			}

			get typeId() {
				return this.joinIdByIndex("type");
			}

			get valueId() {
				return this.joinIdByIndex("value");
			}

			create() {
				++ColumnTemplate.#index;

				return createElement("div", {
					innerHTML: `<input id='${this.typeId}'></input>
					<input id='${this.valueId}'></input>`,
				});
			}

			destroy({ elements }) {
				elements?.[0].ej2_instances?.[0].destroy();
			}

			write() {
				const valueTypes = Object.values(VALUE_TYPE);
				const getWidth = value => value.length * 7 + 50;

				const { typeId, valueId } = this;
				let inputValue = new InputText(valueId);

				/**
				 * @param {String} type VALUE_TYPE 참고
				 */
				function updateInputValue(type) {
					inputValue.destroy();
					inputValue = new VALUE_COMPONENT[type](valueId);
				}

				new DropDownList(
					{
						dataSource: valueTypes,
						index: 0,
						width: getWidth(valueTypes[0]),
						change({ element, value }) {
							element.ej2_instances[0].width = getWidth(value);
							updateInputValue(value);
						},
					},
					"#" + typeId,
				);
			}
		}

		class ColumnConfig extends ConfigBase {
			constructor(column) {
				super(column[ID.META_DETAIL_ID]);

				this.tableId = column[ID.META_ID];
				this.type = "number";

				this.template = new ColumnTemplate();
			}
		}

		return {
			// Config
			querybuilderRef,
			FIELD_MODE,
			SEPARATOR,
			getSql,

			// Column
			tableConfigs,
		};
	},
};
</script>

<style scoped>
/* Input */
:deep(.e-rule-field .e-input-group) {
	border: 1px solid #e0e0e0 !important;
	border-radius: 5px;
	padding-left: 5px;
	color: #000000de !important;
}

/* Rule */
:deep(.e-rule-container.e-horizontal-mode) {
	padding-top: 5px;
}
:deep(.e-rule-field) {
	overflow-x: auto;
}
:deep(.e-rule-value.e-template-value) {
	position: relative;
	width: auto !important;
	white-space: nowrap;
}
:deep(.e-rule-value.e-template-value .e-input-group:first-child) {
	border-right: 0 !important;
	border-top-right-radius: 0 !important;
	border-bottom-right-radius: 0 !important;
}
:deep(.e-rule-value.e-template-value .e-input-group:last-child) {
	margin-top: 0 !important;
	width: fit-content !important;
	float: none !important;
	border-top-left-radius: 0 !important;
	border-bottom-left-radius: 0 !important;
	transform: translateX(-4px);
}

/* Button */
:deep(.e-rule-value-delete) {
	position: absolute;
	top: 0;
	right: 0;
}
:deep(.e-lib.e-btn-group) {
	height: 22px;
	line-height: 18px;
}
</style>
