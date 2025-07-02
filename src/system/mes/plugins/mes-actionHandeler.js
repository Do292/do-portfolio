import { useModalAlert } from "~/plugins/composables/modalHandler";

export function checkValidation() {
	const { openModalWarning } = useModalAlert();

	const validationMap = {
		hold: item => {
			const isValid = item.holdState === "NotOnHold";
			if (!isValid) {
				openModalWarning("holdState를 확인하세요.");
			}
			return isValid;
		},
		release: item => {
			const isValid = item.holdState === "OnHold";
			if (!isValid) {
				openModalWarning("holdState 확인하세요.");
			}
			return isValid;
		},
	};

	function validateAction(item, action) {
		const validateFunction = validationMap[action];
		// TODO: hold, release외 임시처리 (무조건 true)
		if (!validateFunction) {
			return true;
		}
		return validateFunction(item);
	}

	return {
		validateAction,
	};
}
