import { mapMutations } from "vuex";
// import store from "../../store";
export default {
	methods: {
		...mapMutations({
			SET_FLAG_LOGIN: "SET_FLAG_LOGIN",
			SET_LOCALE: "SET_LOCALE",
			SET_USERINFO: "SET_USERINFO",
			SET_AUTHENTICATION: "SET_AUTHENTICATION",
		}),
		clearUserInfo() {
			this.SET_FLAG_LOGIN(false);
			this.SET_USERINFO("");
			this.SET_LOCALE("");
			this.SET_AUTHENTICATION("");
			// store.commit("SET_FLAG_LOGIN", false);
		},
		logoutUser() {
			this.clearUserInfo();
			this.$router.push("/login").catch(() => {});
			// window.location = "/";
			//this.$router.push("/login").catch(() => {});
		},
	},
};
