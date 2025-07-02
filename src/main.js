import { createApp } from "vue";
//store vuex
import store from "~/store";
//globalization
import i18n from "~/locale";
//plugins js
import eventBus from "~/plugins/event-bus.js";
import commonjs from "~/plugins/common.js";
import wfbConstants from "~/plugins/wfb-constants.js";
import wfbMixin from "~/plugins/mixin/mixin-plugin.js";

//providers
import localStorage from "~/providers/local-storage.js";
import modalUtil from "~/providers/modal-util.js";
//custom aim css
import style from "~/plugins/wfb-style.js";

//aim admin components
import wfbCommonComponents from "~/plugins/wfb-common-components";
import wfbModalComponents from "~/plugins/wfb-modal-components";
import wfbComponents from "~/plugins/wfb-components.js";

//Web Front Library Components
import WebFrontLibrary from "@wfl/vue";

/* vue fullscreen 적용 */
import VueFullscreen from "vue-fullscreen";

//App
import App from "~/App.vue";
//router setting
import router from "~/router";
const app = createApp(App);

//app setup
app.use(router);
app.use(store);
app.use(i18n);
app.use(commonjs);
app.use(style);
app.use(eventBus);
app.use(wfbConstants);
app.use(wfbComponents);
app.use(wfbModalComponents);
app.use(wfbCommonComponents);
app.use(localStorage);
app.use(modalUtil);
app.use(wfbMixin);
//Web Front Library 사용
app.use(WebFrontLibrary);
//fullscreen 사용
app.use(VueFullscreen);

app.mount("#app");
