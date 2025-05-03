// Socket sending test
export default class TfmSocketManager {

    constructor() {
        this.identifier = 'system.tales-from-myriad';
        this.callbacks = new Map();
        this.#initalize();
    }

    #initalize() {
        game.socket.on(this.identifier, ({ type, data, target, user, id }) => {
            // if a target was assigned for the socket, and this isnt them
            if (target && target != game.userId) return;

            // Manage the event type
            switch (type) {
                /*----------------------------------------------------------------------------*/
                /*                                USER NOTIFICATIONS                          */
                /*----------------------------------------------------------------------------*/
                case 'NOTIFY':
                    tfm.utils.notify(data.message);
                    this.emit('RESOLVE', { resolved: true, id: id }, user);
                    break;

                case 'WARN':
                    tfm.utils.warn(data.message);
                    this.emit('RESOLVE', { resolved: true, id: id }, user);
                    break;

                case 'ERROR':
                    tfm.utils.error(data.message);
                    this.emit('RESOLVE', { resolved: true, id: id }, user);
                    break;

                /*----------------------------------------------------------------------------*/
                /*                            DIALOG POPUPS                                   */
                /*----------------------------------------------------------------------------*/
                case 'CONFIRM':
                    foundry.applications.api.DialogV2.confirm().then(response => {
                        this.emit('RESOLVE', { resolved: response, id: id }, user);
                    })
                    break;

                case 'GIFT':
                    // confirm dialog always returns true or false, and this is the value of the .then(response)
                    foundry.applications.api.DialogV2.confirm({
                        content: `<p>User <b>${game.users.get(user).name}</b> would like to send you: ${data.item.name}</p><p>Do you accept?</p>`,
                        rejectClose: true,
                        window: 'NEWEDO.recieveGiftOffer'
                    }).then(response => {
                        // if response is true, we agreed to take the item, and create it on the sheet from out own actor
                        if (response) {
                            let actor = game.user.character;
                            if (!actor) {
                                // no controlled actor, can't do it so we cancel the transaction
                                tfm.utils.error('NEWEDO.error.noControlledActor');
                                response = false;
                            } else {
                                // we confirmed we want the item and have a controlled actor, so create the item and respond 
                                // saying that we accepted the item
                                let newItem = Item.create(data.item, { parent: actor, renderSheet: true });
                            }
                        }
                        // send back our response
                        this.emit('RESOLVE', { resolved: response, id: id }, user);
                    })

                    break;

                case 'RESOLVE':
                    let cb = this.callbacks.get(data.id);
                    return cb(data);
                default:
                    throw new Error('Recieved unknown socket type', type);
            }
        });
    }

    /**
     * Data follows a strict format, it must include
     * [type]: String
     * [target]: user ID or null for all
     * [data]: object with relevant things
     * 
     * @param {string} type // the event type
     * @param {Object} data the payload delievered to the other user
     * @param {string} target UUID of the user you are emiting too
     * @param {Function} callback function to be triggered on this events resoloution
     * @returns EmitData
     */
    async emit(type, data, target = null, callback = null) {

        const args = {
            type: type,// Event type
            data: data,// Data for this event
            target: target,// User targeted for this event
            user: game.userId,// The user who triggered this event
            id: foundry.utils.randomID(),// ID used to watch for this specific event and it's callbacks
        }

        let serverAck = new Promise(resolve => {
            game.socket.emit(this.identifier, args, response => {
                resolve(args);
            });
        })

        // If this is a resoloution confirmation for a previous event, we dont need to register a callback
        if (type == 'RESOLVE') return serverAck;

        // registers a client callback for when the target has resolved the request
        // and returns a promise that will be resolved when the callback is retrieved
        return new Promise(resolve => {

            this.callbacks.set(args.id, (response) => {
                if (typeof callback == 'function') {
                    callback()
                    resolve(response);
                } else resolve(response);
                this.callbacks.delete(response.id);
            })
        })
    };

    async request() {

    }

    async requestAll() {

    }

    // Includes the client calling this event in the execution, cannot wait for a resoloution
    emitAll(type, data) {
        this.eventHandler({ type, data });
        return this.emit(type, data);
    }
}