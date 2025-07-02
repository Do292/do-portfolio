// Button
import ButtonAddList from "~/components/common/button/ButtonAddList";
import ButtonBasic from "~/components/common/button/ButtonBasic";
import ButtonCollapse from "~/components/common/button/ButtonCollapse";
import ButtonDropdown from "~/components/common/button/ButtonDropdown";
import ButtonFooter from "~/components/common/button/ButtonFooter";
import ButtonPin from "~/components/common/button/ButtonPin";
import ButtonText from "~/components/common/button/ButtonText";
import ButtonImage from "~/components/common/button/ButtonImage";

// WFL Input
import Checkbox from "~/components/common/input/Checkbox";
import DatePicker from "~/components/common/input/DatePicker";
import Numericbox from "~/components/common/input/Numericbox";
import Textbox from "~/components/common/input/Textbox";
import SwitchFlag from "~/components/common/input/SwitchFlag";
import SwitchLabel from "~/components/common/input/SwitchLabel";

// Custom Input
import InputPassword from "~/components/common/input/InputPassword";
import InputSearch from "~/components/common/input/InputSearch";
import InputUserId from "~/components/common/input/InputUserId";

// Dropdown
import Combobox from "~/components/common/dropdown/Combobox";
import ComboQuery from "~/components/common/dropdown/ComboQuery";
import DropDownList from "~/components/common/dropdown/DropDownList";
import MultiDropDownList from "~/components/common/dropdown/MultiDropDownList";
import ListBox from "~/components/common/dropdown/ListBox";
import ComboLocale from "~/components/common/dropdown/ComboLocale";

// Layout
import Splitter from "~/components/common/layout/Splitter";
import DashboardLayout from "~/components/common/layout/DashboardLayout";

// Tempalte Component
import Accordion from "~/components/common/template/component/Accordion";
import Breadcrumb from "~/components/common/template/component/Breadcrumb";
import Grid from "~/components/common/template/component/Grid";
import Spinner from "~/components/common/template/component/Spinner";

// Template Form
import FormCreate from "~/components/common/template/form/FormCreate";
import FormGrid from "~/components/common/template/form/FormGrid";
import FormInformation from "~/components/common/template/form/FormInformation";
import FormInput from "~/components/common/template/form/FormInput";
import FormModify from "~/components/common/template/form/FormModify";
import FormSearchCondition from "~/components/common/template/form/FormSearchCondition";
import FormFilter from "~/components/common/template/form/FormFilter";
import FormTree from "~/components/common/template/form/FormTree";
import FormTab from "~/components/common/template/form/FormTab";

export default {
	install: app => {
		app.component("ButtonAddList", ButtonAddList);
		app.component("ButtonBasic", ButtonBasic);
		app.component("ButtonDropdown", ButtonDropdown);
		app.component("ButtonFooter", ButtonFooter);
		app.component("ButtonText", ButtonText);
		app.component("ButtonCollapse", ButtonCollapse);
		app.component("ButtonPin", ButtonPin);
		app.component("ButtonImage", ButtonImage);

		app.component("Checkbox", Checkbox);
		app.component("DatePicker", DatePicker);
		app.component("Numericbox", Numericbox);
		app.component("Textbox", Textbox);
		app.component("SwitchFlag", SwitchFlag);
		app.component("SwitchLabel", SwitchLabel);

		app.component("InputPassword", InputPassword);
		app.component("InputSearch", InputSearch);
		app.component("InputUserId", InputUserId);

		app.component("Combobox", Combobox);
		app.component("ComboQuery", ComboQuery);
		app.component("DropDownList", DropDownList);
		app.component("MultiDropDownList", MultiDropDownList);
		app.component("ListBox", ListBox);
		app.component("ComboLocale", ComboLocale);

		app.component("Splitter", Splitter);
		app.component("DashboardLayout", DashboardLayout);

		app.component("Accordion", Accordion);
		app.component("Breadcrumb", Breadcrumb);
		app.component("Grid", Grid);
		app.component("Spinner", Spinner);

		app.component("FormCreate", FormCreate);
		app.component("FormGrid", FormGrid);
		app.component("FormInformation", FormInformation);
		app.component("FormInput", FormInput);
		app.component("FormModify", FormModify);
		app.component("FormSearchCondition", FormSearchCondition);
		app.component("FormFilter", FormFilter);
		app.component("FormTree", FormTree);
		app.component("FormTab", FormTab);
	},
};
