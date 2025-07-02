import ModalAlert from "~/components/common/modal/ModalAlert";
import ModalConfirm from "~/components/common/modal/ModalConfirm";
import ModalSearch from "~/components/common/modal/ModalSearch";
import ModalSuccess from "~/components/common/modal/ModalSuccess";
import ModalUserSetting from "~/components/common/modal/ModalUserSetting";
import ModalChangePassword from "~/components/common/modal/ModalChangePassword";
import ModalImage from "~/components/common/modal/ModalImage";

export default {
	install: app => {
		app.component("ModalAlert", ModalAlert);
		app.component("ModalConfirm", ModalConfirm);
		app.component("ModalSearch", ModalSearch);
		app.component("ModalSuccess", ModalSuccess);
		app.component("ModalUserSetting", ModalUserSetting);
		app.component("ModalChangePassword", ModalChangePassword);
		app.component("ModalImage", ModalImage);
	},
};
