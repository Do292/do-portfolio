<template>
	<div id="tree-container">
		<div v-if="hasHeader" class="tree-header">
			<div class="row">
				<div class="tree-input">
					<wfl-combobox
						:dataSource="nodeConfigs"
						:placeholder="$t('tree.searcher')"
						:showClearButton="true"
						@update:selectValue="searchNode"
					></wfl-combobox>
				</div>
				<div class="tree-btn-box">
					<ButtonBasic type="collapse" @onClick="toggleTree" />
					<ButtonBasic type="refresh" @onClick="$emit('refresh')" />
				</div>
			</div>
		</div>
		<div class="tree-body">
			<wfl-treeview
				ref="treeRef"
				:animation="animation"
				:dataSource="treeItems"
				:fields="treeField"
				:selectedNodes="selectedNodes"
				nodeTemplate="nodeTemplate"
				@nodeSelected="clickNode"
			>
				<template v-slot:nodeTemplate="{ data }">
					<slot name="tree-node" v-bind="data">
						<div class="tree-node">
							<span class="tree-node-id">{{ data[ID] }}</span>
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
import ButtonBasic from "~/components/common/button/ButtonBasic";

import { ref, computed } from "vue";
import { useItem } from "~/plugins/composables/dataHandler";

import { NODE_FIELD } from "~/plugins/wfb-constants.js";

export default {
	name: "Tree",
	components: {
		ButtonBasic,
	},
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

		/* Field */
		parentID: { type: String },
		hasChildren: { type: String, default: "hasChildren" },
	},
	setup(props, { emit }) {
		//==================== Config
		const { ID, CHILDREN } = NODE_FIELD;
		const { parentID, hasChildren } = props;
		const treeRef = ref(null);
		const treeField = {
			child: CHILDREN,
			id: ID,
			text: ID,
			parentID,
			hasChildren,
		};
		const selectedNode = ref(null);
		const selectedNodes = computed(() => [selectedNode.value]);
		const animation = ref({
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
		});

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
				const paths = [...parents, id];

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
		 * @returns {Number|null}
		 */
		function getChildrenCount(data) {
			return data[CHILDREN]?.length;
		}

		/**
		 * Id에 해당하는 노드를 펼친다.
		 * @param {String} id
		 */
		function expandNode(id) {
			treeRef.value.expandAll([id]);
		}

		//==================== Tree Event
		/**
		 * 검색 데이터가 유효한 경우 선택 후 이벤트 전송
		 * @param {String} key input value
		 */
		function searchNode(key) {
			const node = findNodeConfig(key);

			if (node) {
				return;
			}

			focusNode(node.id);
			emit("clickItem", node);
		}

		/**
		 *트리 요소에서 아이템 노드를 찾아준다.
		 * @param {String} nodeId
		 */
		function focusNode(nodeId) {
			// 문자열 리셋
			selectedNode.value = "";

			treeRef.value.expandAll();
			selectedNode.value = nodeId;

			// setTimeout(() => {
			// 	const { parentElement: $tree } = treeRef.value.$el;
			// 	const { offsetTop } = $tree.querySelector(".e-active") ?? {};
			// 	const top = offsetTop ?? 0;

			// 	$tree.scrollTo({ top, behavior: "smooth" });
			// }, 350); // expand duration + 50
		}

		/**
		 * 클릭한 노드 요소의 데이터를 전송한다
		 * @param {Object} event
		 * @param {Object} event.node
		 */
		function clickNode({ node }) {
			const { uid } = node.dataset;
			const config = findNodeConfig(uid);
			emit("clickItem", config);

			// 초기화 시, 노드 선택 유지를 위해 보관
			selectedNode.value = uid;
		}

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

			selectedNode,
			selectedNodes,
			animation,

			searchNode,
			focusNode,
			clickNode,
		};
	},
	data() {
		return {};
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
	methods: {},
};
</script>
