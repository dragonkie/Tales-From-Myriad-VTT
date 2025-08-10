/**
 * @typedef {Object} ContextMenuEntry
 * @prop {String} name
 * @prop {String} icon
 * @prop {String} classes
 * @prop {String} group
 * @prop {CallableFunction} callback
 * @prop {Boolean} condition
 */

/**
 * A specialized subclass of ContextMenu that places the menu in a fixed position.
 * @extends {ContextMenu}
 */
export default class TfmContextMenu extends foundry.applications.ux.ContextMenu.implementation {

    /**
     * @param {HTMLElement} element 
     * @param {string} selector 
     * @param {ContextMenuEntry} menuItems 
     * @param {Object} options 
     * @param {string} options.eventName
     * @param {CallableFunction} options.onOpen
     * @param {CallableFunction} options.onClose
     * @param {Boolean} [options.jQuery=true]
     * @param {Boolean} [options.fixed=false]
     */
    constructor(element, selector, menuItems, options) {
        super(element, selector, menuItems, options)
    }

    /** @override */
    _setPosition(html, target, options) {
        document.body.appendChild(html);
        const { clientWidth, clientHeight } = document.documentElement;
        const { width, height } = html.getBoundingClientRect();
        const { clientX, clientY } = event;
        const left = Math.min(clientX, clientWidth - width) + 1;

        const expandUp = clientY + height > clientHeight;
        html.classList.add("artichron");
        html.classList.toggle("expand-up", expandUp);
        html.classList.toggle("expand-down", expandUp);
        html.style.visibility = "";
        html.style.left = `${left}px`;

        if (expandUp) html.style.bottom = `${clientHeight - clientY}px`;
        else html.style.top = `${clientY + 1}px`;

        target.classList.add("context");
        html.style.zIndex = `${foundry.applications.api.ApplicationV2._maxZ + 1}`;
    }
}