const admin = {
	menu: "menu.admin.admin",
	subMenu: [
		{
			menu: "menu.admin.user",
			url: "/user",
			viewName: "UserView",
		},
		{
			menu: "menu.admin.userMenu",
			url: "/userMenu",
			viewName: "UserMenuView",
		},
	],
};

function getAdminMenu() {
	return admin;
}

export { getAdminMenu };
