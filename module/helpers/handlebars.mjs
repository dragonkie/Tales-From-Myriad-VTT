
function registerTemplates() {
    const partials = [
        //components
        `${tfm.filepath.template}/shared/resource-bar.hbs`,
        `${tfm.filepath.template}/shared/resource-bar-inline.hbs`,
        `${tfm.filepath.template}/shared/description.hbs`,

        // Sheet partials
        `${tfm.filepath.template}/shared/tabs-nav.hbs`,
        `${tfm.filepath.template}/shared/tabs-content.hbs`,

        // Actor Partials
        `${tfm.filepath.template}/actor/shared/actor-abilities.hbs`,
        `${tfm.filepath.template}/actor/shared/actor-defence.hbs`,
        `${tfm.filepath.template}/actor/shared/actor-resistance.hbs`,
        `${tfm.filepath.template}/actor/shared/actor-skills.hbs`,
        `${tfm.filepath.template}/actor/shared/actor-proficiency.hbs`,
        `${tfm.filepath.template}/actor/shared/actor-movement.hbs`,

        // Dialog partials
        `${tfm.filepath.template}/dialog/parts/roll-options.hbs`
    ];

    // Strips the partials down to barebones and prefixs them with the tfm tag to be used for easy loading and legibility in the .hbs sheets
    // @example {{> 'tfm.sheet-tabs'}}
    const paths = {};
    for (const path of partials) {
        paths[`tfm.${path.split("/").pop().replace(".hbs", "")}`] = path;
    }

    return foundry.applications.handlebars.loadTemplates(paths);
};

function registerHelpers() {
    const helpers = [
        //======================================================================================
        //> Strings
        //======================================================================================
        { name: 'toLowerCase', fn: (str) => str.toLowerCase() },
        { name: 'toTitleCase', fn: (str) => str.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()) },

        //======================================================================================
        //> Logic
        //======================================================================================
        { name: 'choose', fn: (a, b) => a ? a : b },
        {
            name: 'isEmpty', fn: (obj) => {
                if (Array.isArray(obj)) return obj.length == 0;
                if (typeof obj == 'object') return Object.keys(obj).length == 0;
            }
        },

        //======================================================================================
        //> User permissions
        //======================================================================================
        { name: 'isGM', fn: () => game.user.isGM },

        //======================================================================================
        //> Math helpers
        //======================================================================================
        { name: 'addition', fn: (a, b) => a + b },
        { name: 'ceil', fn: (a) => Math.ceil(a) },
        { name: 'divide', fn: (a, b) => a / b },
        { name: 'floor', fn: (a) => Math.floor(a) },
        { name: 'max', fn: (...num) => Math.max(...num) },
        { name: 'min', fn: (...num) => Math.min(...num) },
        { name: 'multiply', fn: (a, b) => a * b },
        { name: 'percent', fn: (a, b) => a / b * 100 },
        { name: 'round', fn: (a) => Math.ceil(a) },
        { name: 'subtraction', fn: (a, b) => a - b },
        //======================================================================================
        //> Elements
        //======================================================================================
        {// wraps a set of elements in a collapsible wrapper
            name: 'collapsible',
            fn: (label, options) => {
                if (!options) options = label, label = '';
                return new Handlebars.SafeString(`
                    <div class="collapsible">
                        <div class="flexrow">
                            <a data-action="collapse"><i class="fas fa-caret-down"></i></a>
                            <label>${label}</label>
                        </div>
                        <div class="collapsible-content">
                            <div class="wrapper">
                                ${options.fn(this)}
                            </div>
                        </div>
                    </div>`
                );
            }
        },
        {
            name: 'collapsed',
            fn: (label, options) => {
                if (!options) options = label, label = '';
                return new Handlebars.SafeString(`
                    <div class="collapsible collapsed">
                        <div class="flexrow">
                            <a data-action="collapse"><i class="fas fa-caret-down"></i></a>
                            <label>${label}</label>
                        </div>
                        <div class="collapsible-content">
                            <div class="wrapper">
                                ${options.fn(this)}
                            </div>
                        </div>
                    </div>`
                );
            }
        },
        //======================================================================================
        //> Iterators
        //======================================================================================
        {
            name: 'repeat',
            fn: (num, options) => {
                if (isNaN(num)) return options.fn(this);
                for (var i = 0, ret = ''; i < num; i++) ret += options.fn(i);
                return ret;
            }
        },
        //======================================================================================
        //> Data Fields
        //======================================================================================
        {
            name: 'getField',
            fn: (schema, path) => schema.getField(path)
        }, {
            name: 'toFieldGroup',
            fn: (schema, path, options) => {
                const field = schema.getField(path);
                if (!field) throw new Error(`Couldnt find field from [${path}] in schema:`, schema);

                const { classes, label, hint, rootId, stacked, units, widget, ...inputConfig } = options.hash;
                const groupConfig = {
                    label, hint, rootId, stacked, widget, localize: true, units,
                    classes: typeof classes === "string" ? classes.split(" ") : []
                };

                const group = field.toFormGroup(groupConfig, inputConfig);
                return new Handlebars.SafeString(group.outerHTML);
            }
        }, {
            name: 'toFieldInput',
            fn: (schema, path, options) => {
                const field = schema.getField(path);
                if (!field) throw new Error(`Couldnt find field from [${path}] in schema:`, schema);


                const { classes, label, hint, rootId, stacked, units, widget, ...inputConfig } = options.hash;
                const groupConfig = {
                    label, hint, rootId, stacked, widget, localize: true, units,
                    classes: typeof classes === "string" ? classes.split(" ") : []
                };

                const group = field.toInput(groupConfig, inputConfig);
                return new Handlebars.SafeString(group.outerHTML);
            }
        }, {
            name: 'ledger',
            fn: (target, id, label) => {
                return `<a data-action="editLedger" data-target="${target}" data-id="${id}" data-label="${label}"><i class="fa-solid fa-memo-pad"></i></a>`
            }
        }
    ]

    // register the helpers
    for (const helper of helpers) Handlebars.registerHelper(helper.name, helper.fn);
}

/**
 * Registers all system specific handlebars functionality
 */
export default function registerHandlebars() {
    registerTemplates();
    registerHelpers();
}