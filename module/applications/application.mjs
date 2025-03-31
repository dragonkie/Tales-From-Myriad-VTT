let {HandlebarsApplicationMixin, ApplicationV2} = foundry.applications.api

export default class TfmApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'tfm-app-{id}',
        tag: 'form',
        classes: ['tfm'],
        window: {
            frame: true,
            positioned: true,
            title: "TFM_Application",
            icon: "fa-solid fa-note-sticky",
            minimizable: false,
            resizeable: true
        },
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            top: 300,
            left: 300,
            width: 650,
            height: 500,
            scale: 1.0
        }
    }
}