<template>
	<div class="info-team">
		<div class="row fiter-box02 mt-2 mb-2">
			<div class="col-6 team-input">
				<Textbox
					v-model="team[TEAM.NAME]"
					:enabled="editing"
					:placeholder="$t(TEAM.NAME)"
					floatLabelType="Always"
				/>
			</div>
			<div class="col-6 team-input">
				<Textbox
					v-model="team[TEAM.OWNER]"
					:enabled="false"
					:placeholder="$t(TEAM.OWNER)"
					floatLabelType="Always"
				/>
			</div>
		</div>
		<FormGrid
			:checkbox="false"
			:customItems="members"
			:exporting="false"
			:paging="false"
			menuId="Team"
			metaDataId="Member"
		>
			<template v-slot:grid-button>
				<ButtonAddUser
					v-if="editing"
					:steps="roles"
					:userMap="usersByRole"
					@apply="applyMembers"
				/>
			</template>
		</FormGrid>
	</div>
</template>

<script>
import ButtonAddUser from "~/system/qms/components/common/button/ButtonAddUser";
import { reactive, watch, onBeforeMount, ref } from "vue";
import { useFetchData, useItem } from "~/plugins/composables/dataHandler";

import * as COMMON from "~/api/common.js";
import * as TEAM_API from "~/system/qms/api/team.js";
import {
	META,
	STRATEGY_CONFIG,
	TEAM,
	MEMBER,
} from "~/system/qms/constants/qms_meta_constants.js";
import { ACTION } from "~/plugins/wfb-constants.js";
import { computed } from "vue";
import { inject } from "vue";

export default {
	name: "FormTeam",
	components: { ButtonAddUser },
	props: {
		config: {
			type: Object,
			default() {
				return {};
			},
		},
		editing: { type: Boolean },
	},
	setup(props, { emit }) {
		//==================== Team
		const { fetchList } = useFetchData();
		const { filterItem, groupByItems, createItem } = useItem();

		const team = reactive({
			[STRATEGY_CONFIG.ID]: null,
			[STRATEGY_CONFIG.TYPE]: "",
			[TEAM.OWNER]: "",
			[TEAM.NAME]: "",
			[TEAM.MEMBERS]: [],
		});

		/**
		 * issuanceNo이 있는 경우 Team 정보를 api 호출해 할당한다.
		 */
		async function initTeam() {
			if (props.config[STRATEGY_CONFIG.ID]) {
				const data = await fetchList(() =>
					COMMON.getByParam(META.TEAM, props.config),
				);

				for (const [key, value] of Object.entries(data)) {
					team[key] = value;
				}

				// Team Owner 지정
				team[TEAM.OWNER] = props.config[TEAM.OWNER];
				// Member 초기화
				members.value = team[TEAM.MEMBERS];
			}
		}

		/**
		 * 변경된 데이터를 저장한다.
		 */
		async function saveTeam() {
			// Member 재정의
			team[TEAM.MEMBERS] = members.value.map(member =>
				filterItem(member, Object.values(MEMBER)),
			);
			const teamConfig = createItem(
				Object.keys(team),
				key => team[key] || props.config[key],
			);
			await fetchList(() => TEAM_API.save(teamConfig));
		}

		onBeforeMount(async () => {
			await initTeam();

			// TeamId가 있으면 편집 모드로 전환
			if (!team[TEAM.ID]) {
				emit("edit");
			}
		});

		// Cancel시, 데이터 초기화
		watch(
			() => props.editing,
			editing => {
				if (!editing) {
					initTeam();
				}
			},
		);

		//==================== Member
		const members = ref([]);

		/**
		 * @param {Object} usersByRole
		 */
		function applyMembers(usersByRole) {
			members.value = Object.entries(usersByRole).reduce(
				(acc, [role, users]) => {
					// User가 있는 경우만 객체 정의하여 추가한다.
					if (users.length) {
						users.forEach(user => (user[MEMBER.ROLE] = role));
						acc.push(...users);
					}
					return acc;
				},
				[],
			);
		}

		//==================== User Role
		const { stepList } = inject("step");
		const roles = computed(() =>
			// Team, Approval을 제외한 단계에는 담당자가 필요함
			stepList.value
				.map(({ id }) => id)
				.filter(id => ![META.TEAM, META.APPROVAL].includes(id)),
		);

		// {[role]: users}
		const usersByRole = computed(() =>
			groupByItems(MEMBER.ROLE, members.value),
		);

		return {
			// Common
			META,
			TEAM,
			ACTION,

			// Team
			team,
			save: saveTeam,

			// Member
			members,
			applyMembers,

			// User Role
			roles,
			usersByRole,
		};
	},
};
</script>
<style scoped>
/* Button */
:deep(.item-box > .btn-group > .btn) {
	display: none;
}
</style>
