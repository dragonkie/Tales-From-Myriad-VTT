import sysUtil from "./sysUtil.mjs";

export default class TfmSocket {
    static async registerHandler() {
        // Packet type sorter
        let handler = ({ type, data }) => {
            switch (type) {

                // Handels the giving and recieving of items
                case 'ITEMSEND': return this._onSendItem(data);
                case 'ITEMTAKE': return this._onTakeItem(data);
                default:
                    throw new Error('Recieved unknown socket type');
            }
        }

        // Register the socket handler for myriad
        game.socket.on(`system.${tfm.id}`, (request, options, callback) => {
            console.log('Recieved socket event emit', request, options, callback);

            const response = handler(sysUtil.duplicate(request));
            if (callback) callback(response);
        });

        return true;
    }

    static _id = `system.tales-from-myriad`;

    /**
     * Prompts the targeted user to recieve an item from you
     * @param {*} item 
     */
    static async sendItem(itemUuid) {
        const item = await fromUuid(itemUuid);

        // Get list of users
        let userList = [];
        for (let user of game.users.players) {
            if (user.character && user.active && user.id != game.user.id) {
                userList.push({ value: user.id, label: user.character.name });
            }
        }

        // Create the character selector for the list of possible recievers
        let selector = foundry.applications.fields.createSelectInput({
            options: userList,
            valueAttr: 'value',
            labelAttr: 'label',
            localize: false,
            sort: true,
            name: 'userSelect'
        })

        // Create a dialog box with a selection of valid users
        let options = await new Promise((resolve, reject) => {
            let dialog = new tfm.applications.TfmDialog({
                window: { title: "Gift Item" },
                content: `
                    <div> Who would you like to gift your <b>${item.name}</b> too? </div>
                    ${selector.outerHTML}
                `,
                buttons: [{
                    label: 'confirm',
                    action: 'confirm',
                    callback: (event, button, dialog) => resolve({ event: event, button: button, html: dialog })
                }, {
                    label: 'Cancel',
                    action: 'cancel',
                    callback: (event, button, dialog) => reject('User canceld transaction')
                }]
            })

            dialog.render(true);
        });
        // Proccess the input data
        let formData = sysUtil.getFormData(options.html, '[name]');

        // Tag the item being sent so we know its in transit, and lock it with a key until this transaction is complete
        // This flag should time itself out after 15 seconds if not recieved, or I guess an input time would be better
        const lock = foundry.utils.randomID(8)
        item.setFlag('world', 'transfer', lock);

        // Promises to resolve the emit when it recieves a response
        return new Promise(resolve => {
            const packet = {
                type: 'ITEMSEND',
                data: {
                    itemUuid: itemUuid,
                    targetId: formData.userSelect,
                    lock: lock
                }
            }

            game.socket.emit(this._id, packet, {}, (response) => {
                console.log('Emit is acknowledged:', response);
                resolve(response);
            });
        });
    }

    /**
     * Prompts the user to take an item offered by another player
     * @param {*} data 
     * @returns 
     */
    static async _onSendItem(data) {

        if (game.user.id != data.targetId) return 'Wrong Player';
        else {
            // The item being recieved
            let item = await fromUuid(data.itemUuid);
            // User that sent the item
            let name = item.actor.name;

            // Character recieving
            let character = game.user.character;

            let options = await new Promise((resolve, reject) => {
                let dialog = new tfm.applications.TfmDialog({
                    window: { title: "Gift Item" },
                    content: `<div><b>${name}</b> would like to give you <b>${item.name}</b></div>`,
                    buttons: [{
                        label: 'Accept',
                        action: 'confirm',
                        callback: (event, button, dialog) => resolve({ event: event, button: button, html: dialog })
                    }, {
                        label: 'Reject',
                        action: 'cancel',
                        callback: (event, button, dialog) => reject('Reciever did not want the item')
                    }]
                })

                dialog.render(true);
            });

            if (options.button.dataset.action == 'confirm') {
                let itemData = item.toObject();
                const modification = {
                    "-=_id": null,
                    "-=ownership": null,
                    "-=folder": null,
                    "-=sort": null,
                    "-=flags": {}
                };

                foundry.utils.mergeObject(itemData, modification, { performDeletions: true });
                getDocumentClass('Item').create(itemData, { parent: character });

                const packet = {
                    type: 'ITEMTAKE',
                    data: {
                        targetId: item.actor.id,
                        itemUuid: data.itemUuid,
                        lock: data.lock,
                    }
                }
                return new Promise(resolve => {
                    game.socket.emit(this._id, packet, {}, response => {
                        console.log('Emit is acknowledged:', response);
                        resolve(response);
                    })
                })
            } else return 'Rejected';
        }

    }

    /**
     * Follow up to _onRecieveItem(), used to remove the item from the original actors inventory
     * @param {*} data 
     */
    static async _onTakeItem(data) {
        const item = await fromUuid(data.itemUuid);
        if (item.actor.id != data.targetId) return 'Wrong actor';

        const character = game.user.character;
        if (!character) return 'Rejected';


        let flag = item.getFlag('world', 'transfer');
        console.log('Item from uuid', item);
        if (flag == data.lock) {
            console.log('Found matching item, deleting');
            await item.delete();
            console.log('Item Deleted');
        }
    }
}


