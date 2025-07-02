<template>
	<div id="tree-container">
		<div v-if="hasHeader" class="tree-header">
			<div class="row">
				<div class="tree-input">
					<ComboBasic
						:items="nodeConfigs"
						:placeholder="$t('tree.searcher')"
						:showClearButton="true"
						floatLabelType="Never"
						@update:modelValue="searchNode"
					/>
				</div>
				<div class="tree-btn-box">
					<ButtonBasic type="collapse" @onClick="toggleTree" />
					<ButtonBasic type="refresh" @onClick="$emit('refresh')" />
				</div>
			</div>
		</div>
		<div class="tree-body" style="height: 100%">
			<wfl-treeview
				ref="treeRef"
				:animation="animation"
				:checkedNodes="checkedNodes"
				:dataSource="treeItems"
				:fields="treeField"
				:selectedNodes="selectedNodes"
				:showCheckBox="showCheckBox"
				:sortOrder="sortOrder"
				nodeTemplate="nodeTemplate"
				@nodeChecked="checkNode"
				@nodeSelected="clickNode"
			>
				<template v-slot:nodeTemplate="{ data }">
					<slot name="tree-node" v-bind="data">
						<div class="tree-node">
							<span class="tree-node-id">
								{{ data[treeField.text] ?? data[ID] }}
							</span>
							<span
								v-if="getChildrenCount(data)"
								class="e-badge e-badge-primary"
							>
								{{ getChildrenCount(data) }}
							</span>
						</div>
					</slot>
				</template>
			</wfl-treeview>
		</div>
	</div>
</template>

<script>
import ComboBasic from "~/system/modeler/components/common/combo/ComboBasic";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";

import { ref, computed } from "vue";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";
import { useItem } from "~/system/modeler/plugins/composables/modeler-dataHandler";

import { NODE_FIELD } from "~/system/modeler/constants/tree_constants.js";

export default {
	name: "TreeTemplate",
	components: { ComboBasic, ButtonBasic },
	props: {
		/* Button */
		hasHeader: { type: Boolean, default: true },

		/* Tree */
		treeItems: {
			type: Array,
			default() {
				return [];
			},
		},
		sortOrder: { type: String, default: "Ascending" },
		hasBadge: { type: Boolean, default: true },

		/* Field */
		fieldText: { type: String },
		parentID: { type: String },
		hasChildren: { type: String, default: "hasChildren" },

		/* Checkbox */
		showCheckBox: { type: Boolean, default: false },
		checkedNodes: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	emits: ["clickItem", "checkNode", "refresh"],
	setup(props) {
		//==================== Config
		const { ID, CHILDREN } = NODE_FIELD;
		const { fieldText, parentID, hasChildren } = props;
		const treeRef = ref(null);
		const treeField = {
			child: CHILDREN,
			id: ID,
			text: fieldText ?? ID,
			parentID,
			hasChildren,
		};

		//==================== Tree Header
		const { findItem } = useItem();

		/**
		 * 트리 expandAll/collapseAll 전환
		 */
		function toggleTree() {
			treeRef.value.onTreeAllOpenClose();
		}

		/**
		 * text value로 treeItem을 찾는다
		 * @param {String} value
		 * @returns {Object|null} treeItem
		 */
		function findTreeItem(value) {
			return findItem(props.treeItems, ID, value);
		}

		//==================== Tree Node
		class NodeConfig {
			constructor(item, parents = []) {
				const id = item[ID];
				const paths = [...parents, item[fieldText] ?? id];

				// Config
				this.id = id;
				this.item = item;
				this.paths = paths;

				// Combo
				this.value = id;
				this.text = paths.join(" > ");
			}
		}

		const nodeConfigs = computed(() => flattenTreeItems(props.treeItems));

		/**
		 * 자식 데이터들을 재귀적으로 평탄화한다.
		 * @param {Object[]} items
		 * @param {String[]} parents
		 * @returns {Object[]}
		 */
		function flattenTreeItems(items = [], parents) {
			return items.reduce((acc, cur) => {
				const item = new NodeConfig(cur, parents);
				// Selectable이 false이면 콤보데이터에 넣지 않음.
				if (cur.selectable !== false) {
					acc.push(item);
				}
				// 자식 데이터 추가
				const childItems = flattenTreeItems(cur[CHILDREN], item.paths);
				acc.push(...childItems);
				return acc;
			}, []);
		}

		/**
		 * @param {String} key
		 * @returns {Object}
		 */
		function findNodeConfig(key) {
			return nodeConfigs.value.find(({ id }) => id === key);
		}

		/**
		 * @param {Object} data;
		 * @returns {Number}
		 */
		function getChildrenCount(data) {
			return props.hasBadge ? data[CHILDREN]?.length : 0;
		}

		/**
		 * Id에 해당하는 노드를 펼친다.
		 * @param {String} id
		 */
		function expandNode(id) {
			treeRef.value.expandAll([id]);
		}

		//==================== Modal
		const { openModalInfo, openModalWarning, openModalError } =
			useModalAlert();

		return {
			// Config
			treeRef,
			treeField,
			...NODE_FIELD,

			// Tree Node
			nodeConfigs,
			findNodeConfig,
			getChildrenCount,
			expandNode,

			// Tree
			toggleTree,
			findTreeItem,

			// Modal
			openModalInfo,
			openModalWarning,
			openModalError,
		};
	},
	data() {
		return {
			selectedNode: null,

			animation: {
				expand: {
					effect: "SlideDown",
					duration: 300,
					easing: "linear",
				},
				collapse: {
					effect: "SlideUp",
					duration: 300,
					easing: "linear",
				},
			},
		};
	},
	computed: {
		selectedNodes() {
			return [this.selectedNode];
		},
	},
	watch: {
		treeItems() {
			// 선택 노드가 있을 경우 랜더링 이후 포커싱
			if (this.selectedNode) {
				this.$nextTick(() => {
					this.focusNode(this.selectedNode);
				});
			}
		},
	},
	methods: {
		//==================== Tree Event
		/**
		 * 검색 데이터가 유효한 경우 선택 후 이벤트 전송
		 * @param {String} key input value
		 */
		searchNode(key) {
			const node = this.findNodeConfig(key);

			if (node) {
				this.focusNode(node.id);
				this.$emit("clickItem", node);
			}
		},

		/**
		 *트리 요소에서 아이템 노드를 찾아준다.
		 * @param {String} nodeId
		 */
		focusNode(nodeId) {
			// 문자열 리셋
			this.selectedNode = "";

			this.treeRef.expandAll();
			this.selectedNode = nodeId;

			setTimeout(() => {
				const { parentElement: $tree } = this.treeRef.$el;
				const { offsetTop } = $tree.querySelector(".e-active") ?? {};
				const top = offsetTop ?? 0;

				$tree.scrollTo({ top, behavior: "smooth" });
			}, 350); // expand duration + 50
		},

		/**
		 * 클릭한 노드 요소의 데이터를 전송한다
		 * @param {Object} event
		 * @param {Object} event.node
		 */
		clickNode({ node }) {
			const { uid } = node.dataset;
			const config = this.findNodeConfig(uid);
			this.$emit("clickItem", config);

			// 초기화 시, 노드 선택 유지를 위해 보관
			this.selectedNode = uid;
		},

		/**
		 * @param {Object} config
		 * @param {String} config.action
		 * @param {Object[]} config.data
		 * @param {Boolean} config.isInteracted
		 */
		checkNode({ action, data, isInteracted }) {
			// 사용자가 직접 클릭했는지
			if (isInteracted) {
				this.$emit("checkNode", action === "check", data);
			}
		},
	},
};
</script>
<style scoped>
/* Search */
.tree-input {
	display: inline-block;
	width: calc(100% - 80px);
	margin-left: 3px !important;
}
:deep(.e-input-group .e-search-icon) {
	position: absolute;
	top: 0px;
	right: 5px;
}
:deep(.e-input-group.e-input-focus .e-clear-icon) {
	position: absolute;
	top: 3.5px;
	right: 20px;
}

/* Button */
.tree-btn-box {
	width: 77px;
	padding-left: 20px;
}
.tree-btn-box button {
	position: absolute;
	background: none !important;
	border: none !important;
	color: #00000086 !important;
	transform: translate(16px, 3px);
	font-size: 14px;
}
.tree-btn-box button:first-child {
	transform: translate(-6px, 3px);
}
.tree-btn-box button:hover {
	color: #000000c7 !important;
}

/* Icon */
:deep(.e-list-icon::after) {
	font-weight: bold;
}
:deep(.e-list-icon.Root::after) {
	font-family: aimcons;
	content: "\e9d4";
	color: #313756 !important;
}

/* Badge */
:deep(.e-badge) {
	position: absolute;
	padding-top: 2.6px !important;
	right: 10px;
	top: 7px;
	height: 17px;
	border-radius: 10px;
	background: #ffffff !important;
	color: #007bff !important;
	font-size: 11px;
	text-align: center;
	padding: 4px 5px;
	border: 1px #63b7ff solid;
}
:deep(.e-treeview .e-list-item.e-active > .e-fullrow) {
	border-radius: 5px;
	border-color: #ffffff00 !important;
}
:deep(.e-treeview .e-list-item.e-active > .e-text-content .tree-node-id) {
	font-weight: 500;
}
:deep(.e-active > .e-text-content .e-badge) {
	background: #007bff !important;
	color: white !important;
	border: 1px #007bff solid;
}
</style>
