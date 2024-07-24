import LOGGER from "./logger.mjs";

export default function registerSystemSettings() {
    game.settings.register(tfm.id, 'debug', {
        name: 'Debug mode',
        hint: 'Toggle if debug logs appear in the console',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: value => {
            LOGGER.log('CONFIG | Debug:', value);
        }
    });

    game.settings.register(tfm.id, 'autoDamagePlayer', {
        name: 'Automate damage to players',
        hint: 'Level of automation for attack / damage rolls against player characters',
        scope: 'world',
        config: true,
        type: Number,
        default: 0,
        onChange: value => {
            LOGGER.debug('CONFIG | Auto Player Damage:', value);
        },
        requiresReload: false,
        choices: {
            0: 'none',
            1: 'prompt',
            2: 'full'
        }
    })

    game.settings.register(tfm.id, 'autoSpellSync', {
        name: 'Automate spell sync',
        hint: 'Toggle whether casting focuses add/remove their spells from an owning actor sheet automagically',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            LOGGER.debug('CONFIG | Auto Sepll Sync:', value);
        },
        requiresReload: false
    });

    return 0;
}