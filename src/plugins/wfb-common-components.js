// Layout
import AppHeader from "~/components/common/AppHeader";
import SuiteHeader from "~/components/common/SuiteHeader";
import AppLeftSide from "~/components/common/AppLeftSide";
import AppTabMenu from "~/components/common/AppTabMenu";
import AppFooter from "~/components/common/AppFooter";

export default {
	install: app => {
		app.component("AppHeader", AppHeader);
		app.component("SuiteHeader", SuiteHeader);
		app.component("AppLeftSide", AppLeftSide);
		app.component("AppTabMenu", AppTabMenu);
		app.component("AppFooter", AppFooter);
	},
};
