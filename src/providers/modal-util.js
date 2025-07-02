export default {
	install: app => {
		const modalServiceHeaderTitle = type => {
			let title = "Warning";
			if (type === "warning") {
				title = "Warning";
			} else if (type === "info") {
				title = "Info";
			} else if (type === "success") {
				title = "Success";
			} else if (type === "error") {
				title = "Error";
			}
			const headerTitle = `${title}`;
			return headerTitle;
		};
		const modalServiceHeaderDivClass = type => {
			let divClassName = "modal-header alert-warning";
			if (type === "warning") {
				divClassName = "modal-header alert-warning";
			} else if (type === "info") {
				divClassName = "modal-header alert-info";
			} else if (type === "success") {
				divClassName = "modal-header alert-success";
			} else if (type === "error") {
				divClassName = "modal-header alert-danger";
			}

			const headerDivClass = `${divClassName}`;
			return headerDivClass;
		};
		const modalServiceHeaderIClass = type => {
			let iClassName = "aim aimcons_warning text-warning";
			if (type === "warning") {
				iClassName = "aim aimcons_warning text-warning";
			} else if (type === "info") {
				iClassName = "aim aimcons_info text-info";
			} else if (type === "success") {
				iClassName = "aim aimcons_circle-check text-success ";
			} else if (type === "error") {
				iClassName = "aim aimcons_error text-danger";
			}

			const headerIClass = `${iClassName}`;
			return headerIClass;
		};
		const modalServiceBodyTag = (type, title, message) => {
			let typeClass = "text-warning";
			if (type === "warning") {
				typeClass = "text-warning";
			} else if (type === "info") {
				typeClass = "text-info";
			} else if (type === "success") {
				typeClass = "text-success";
			} else if (type === "error") {
				typeClass = "text-danger";
			}

			const bodyTag = `<div><label class="${typeClass} h-message" >${title}</label></div>
                            <div><label class="text-secondary p-message" >${message}</label></div>`;
			return bodyTag;
		};
		app.provide("modalServiceHeaderTitle", modalServiceHeaderTitle);
		app.provide("modalServiceHeaderDivClass", modalServiceHeaderDivClass);
		app.provide("modalServiceHeaderIClass", modalServiceHeaderIClass);
		app.provide("modalServiceBodyTag", modalServiceBodyTag);
	},
};
