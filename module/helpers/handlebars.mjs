
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
    const helpers = {
        //=================================================================================================
        //>  Data Management
        //=================================================================================================
        JSON: (str) => JSON.parse(str),
        isArray: (arr) => Array.isArray(arr),
        arrayLength: (arr) => {
            if (Array.isArray(arr)) return arr.length;
            else throw new Error("Can't get length of non array value");
        },
        objectIsEmpty: (obj) => Object.keys(obj).length <= 0,
        objectProp: (obj, property) => obj[property],
        //======================================================================================
        //> Strings
        //======================================================================================
        toLowerCase: (str) => str.toLowerCase(),
        toTitleCase: (str) => str.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()),
        selected: (val) => {
            if (val) return new Handlebars.SafeString('selected');
            return '';
        },
        //======================================================================================
        //> Logic
        //======================================================================================
        choose: (a, b) => a ? a : b,
        isEmpty: (obj) => {
            if (Array.isArray(obj)) return obj.length == 0;
            if (typeof obj == 'object') return Object.keys(obj).length == 0;
        },
        //======================================================================================
        //> User permissions
        //======================================================================================
        isGM: () => game.user.isGM,
        gameSetting: (scope, id) => { return game.settings.get(scope, id) },
        systemSetting: (id) => { return game.settings.get(game.system.id, id) },
        //======================================================================================
        //> Math helpers
        //======================================================================================
        addition: (a, b) => a + b,
        ceil: (a) => Math.ceil(a),
        divide: (a, b) => a / b,
        floor: (a) => Math.floor(a),
        max: (...num) => Math.max(...num),
        min: (...num) => Math.min(...num),
        multiply: (a, b) => a * b,
        percent: (a, b) => a / b * 100,
        round: (a) => Math.ceil(a),
        subtraction: (a, b) => a - b,
        //======================================================================================
        //> Elements
        //======================================================================================
        // wraps a set of elements in a collapsible wrapper
        collapsible: (label, options) => {
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
        },
        collapsed: (label, options) => {
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
        },
        //======================================================================================
        //> Iterators
        //======================================================================================
        repeat: (num, options) => {
            if (isNaN(num)) return options.fn(this);
            for (var i = 0, ret = ''; i < num; i++) ret += options.fn(i);
            return ret;
        },
        //=================================================================================================
        //>  Data Fields                              
        //=================================================================================================
        getField(schema, path) { return schema.getField(path) },
        toFieldGroup(schema, path, options) {
            let field = schema.getField(path);
            const { classes, label, hint, rootId, stacked, units, widget, ...inputConfig } = options.hash;
            const groupConfig = {
                label, hint, rootId, stacked, widget, localize: true, units,
                classes: typeof classes === "string" ? classes.split(" ") : []
            }
            const group = field.toFormGroup(groupConfig, inputConfig);
            return new Handlebars.SafeString(group.outerHTML);
        },
        toFieldInput(schema, path, options) {
            let field = schema.getField(path);
            const { classes, label, hint, rootId, stacked, units, widget, ...inputConfig } = options.hash;
            const groupConfig = {
                label, hint, rootId, stacked, widget, localize: true, units,
                classes: typeof classes === "string" ? classes.split(" ") : []
            }
            const group = field.toInput(inputConfig);
            return new Handlebars.SafeString(group.outerHTML);
        },
        systemFieldInput(system, path, options) {
            // auto fills in the details to the input using the provided path from the system data
            // the system needs to define a schema path as well
            const field = system?.schema.getField(path);
            if (!system.schema) throw new Error("Missing system schema to reference");
            if (!field) throw new Error("Couldn't find field path for system schema, was it included?" + `${path}`);

            const { classes, label, hint, rootId, stacked, units, widget, ...inputConfig } = options.hash;
            const input = path.split(".");
            var value = system;
            input.forEach(p => {
                value = value[p];
            });

            inputConfig.value = value;

            const group = field.toInput(inputConfig);
            return new Handlebars.SafeString(group.outerHTML);
        },
        systemFieldGroup(system, path, options) {
            // auto fills in the details to the input using the provided path from the system data
            // the system needs to define a schema path as well
            const field = system?.schema.getField(path);
            if (!system.schema) throw new Error("Missing system schema to reference");
            if (!field) throw new Error("Couldn't find field path for system schema, was it included?" + `${path}`);

            const { classes, label, hint, rootId, stacked, units, widget, ...inputConfig } = options.hash;
            const groupConfig = {
                label, hint, rootId, stacked, widget, localize: true, units,
                classes: typeof classes === "string" ? classes.split(" ") : []
            };

            const input = path.split(".");
            var value = system;
            input.forEach(p => {
                value = value[p];
            });

            inputConfig.value = value;

            const group = field.toFormGroup(groupConfig, inputConfig);
            return new Handlebars.SafeString(group.outerHTML);
        },
    }

    // register the helpers
    for (const [key, fn] of Object.entries(helpers)) Handlebars.registerHelper(key, fn);
}

/**
 * Registers all system specific handlebars functionality
 */
export default function registerHandlebars() {
    registerTemplates();
    registerHelpers();
}