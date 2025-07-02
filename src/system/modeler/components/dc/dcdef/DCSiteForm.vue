<template>
	<div class="row">
		<div class="col-9 item-title">
			<label>DCDefItem - Site</label>
			<BreadcrumbTemplate :isSelectable="false" :items="path" />
		</div>
		<div class="col-3 text-right mt-2">
			<div class="item-box right-space">
				<ButtonBasic type="refresh" @onClick="initConfig" />
				<ButtonText
					:needsAuthority="true"
					type="apply"
					@onClick="applyConfig"
				/>
			</div>
		</div>
	</div>
	<div :key="currentRef" class="site-box">
		<div class="row line-bottom pt-1 pb-1">
			<div class="col-12">
				<div class="row pb-1">
					<div class="col-2 field">Site Count</div>
					<div class="col-10 input">
						<InputNumber
							v-model="count"
							:enabled="!isDisabled"
							:min="0"
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="row pt-1 pb-1">
			<div class="col-12">
				<div class="row pb-1">
					<div class="col-12 field">Site Names</div>
				</div>
				<div class="row pb-1">
					<div class="col-12 field">
						<div class="site-name-box p-2">
							<div v-for="n in count" :key="n">
								<label class="site-name">Site{{ n }}</label>
								<InputText v-model="siteNameList[n - 1]" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import BreadcrumbTemplate from "~/system/modeler/components/common/template/BreadcrumbTemplate";
import ButtonBasic from "~/system/modeler/components/common/button/ButtonBasic";
import ButtonText from "~/system/modeler/components/common/button/ButtonText";
import InputNumber from "~/system/modeler/components/common/input/InputNumber";
import InputText from "~/system/modeler/components/common/input/InputText";

import { ref, computed } from "vue";
import { useSpinner } from "~/system/modeler/plugins/composables/modeler-uiControl";
import { useModalAlert } from "~/system/modeler/plugins/composables/modeler-modalHandler";

import { DC_DEF_ITEM } from "~/system/modeler/constants/table_constants.js";
import { watch } from "vue";

export default {
	name: "DCSiteForm",
	components: {
		BreadcrumbTemplate,
		ButtonBasic,
		ButtonText,
		InputNumber,
		InputText,
	},
	props: {
		defaultConfig: { type: Object },
		isDisabled: { type: Boolean },
	},
	emits: ["apply"],
	setup(props, { emit }) {
		//==================== Config
		const COLUMN_COUNT = 4;
		const DELIMETER = "^";
		const { DEF_ID, ITEM_ID, SITE_COUNT, SITE_IDS } = DC_DEF_ITEM;

		const currentRef = ref(0);

		const { executeWithSpinner } = useSpinner();

		// Path
		const path = computed(() => [
			props.defaultConfig[DEF_ID],
			props.defaultConfig[ITEM_ID],
		]);

		watch(
			() => props.defaultConfig,
			() => initConfig(),
		);

		/**
		 * Config를 초기값으로 원복
		 */
		function initConfig() {
			executeWithSpinner(() => {
				count.value = props.defaultConfig[SITE_COUNT] || 0;
				siteNameList.value = deepCloneItems(baseSiteList.value);
				currentRef.value++;
			}, 200);
		}

		// Modal Alert
		const { openModalWarning } = useModalAlert();

		//==================== SiteIds
		const count = ref(props.defaultConfig[SITE_COUNT]);

		const baseSiteList = computed(() => {
			const siteIds = props.defaultConfig[SITE_IDS] || "";
			return siteIds.length > 0 ? siteIds.split(DELIMETER) : [];
		});

		const siteNameList = ref(deepCloneItems(baseSiteList.value));

		watch(
			() => count.value,
			() => {
				generateSiteNameList();
			},
		);

		/**
		 * count에 따른 SiteNameList 조작
		 */
		function generateSiteNameList() {
			const { length } = siteNameList.value;
			const difference = count.value - length;
			if (difference > 0) {
				for (let i = length; i < count.value; i++) {
					const num = (i + 1).toString().padStart(2, "0");
					siteNameList.value.push(`S${num}`);
				}
			} else {
				siteNameList.value.splice(length + difference);
			}
		}

		function deepCloneItems(items = []) {
			return JSON.parse(JSON.stringify(items));
		}

		/**
		 * Site 정의 후 이벤트 전송
		 */
		function applyConfig() {
			if (!validateSiteName()) {
				openModalWarning("warning.enterData");
				return;
			}

			const siteIds = siteNameList.value.join("^");
			const config = {
				...props.defaultConfig,
				[SITE_COUNT]: count.value,
				[SITE_IDS]: siteIds,
			};
			emit("apply", config);
		}

		/**
		 * SiteName 중 빈 값이 있는지 확인
		 * @return {Boolean}
		 */
		function validateSiteName() {
			return !siteNameList.value.some(siteName => !siteName);
		}

		return {
			COLUMN_COUNT,
			path,
			count,
			siteNameList,
			applyConfig,
			initConfig,
			currentRef,
		};
	},
};
</script>

<style scoped>
/* Header */
.item-title label {
	white-space: nowrap !important;
}

/* Site Box */
.site-box {
	padding: 2px 10px;
	border: 1px solid #e0e0e0;
	background-color: #fafafa;
	height: calc(100vh - 720px) !important; /*dylee*/
	min-height: 210px;
}
.site-box .item-box-title {
	margin-top: 5px;
	height: 25px;
}

/* Site Name Box */
.site-name-box {
	width: 100%;
	height: calc(100vh - 818px) !important; /*dylee*/
	border: 1px solid #e0e0e0;
	border-radius: 5px;
	overflow-y: scroll;

	display: grid;
	grid-template-columns: repeat(v-bind("COLUMN_COUNT"), 1fr);
	grid-column-gap: 3px;
	grid-row-gap: 6px;
}

.site-name {
	display: inline-block;
	width: 60px;
	font-size: 12px;
}

/* Input */
.site-box .field {
	font-size: 12px;
	font-weight: 500;
	transform: translateY(5px);
}
</style>
