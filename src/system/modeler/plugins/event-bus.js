import mitt from "mitt";
const EventBus = mitt();

export default {
	install: app => {
		// Plugin code goes here
		app.config.globalProperties.EventBus = EventBus;
	},
};
