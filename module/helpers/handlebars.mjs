
function registerTemplates() {
    const partials = [
        // Actor Partials
        `${tfm.filepath.template}/sheet/shared/tab-content.hbs`,
        `${tfm.filepath.template}/sheet/shared/tab-nav.hbs`,

        // Dialog partials
        `${tfm.filepath.template}/dialog/parts/roll-options.hbs`
    ];

    // Strips the partials down to barebones and prefixs them with the tfm tag to be used for easy loading and legibility in the .hbs sheets
    const paths = {};
    for (const path of partials) {
        paths[`tfm.${path.split("/").pop().replace(".hbs", "")}`] = path;
    }

    return loadTemplates(paths);
};

function registerHelpers() {
    Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
    Handlebars.registerHelper('isGM', () => game.user.isGM);
    Handlebars.registerHelper('disabled', (a) => a == true ? 'disabled' : '');

    /* -------------------------------------------- */
    /*  Math helpers                                */
    /* -------------------------------------------- */
    Handlebars.registerHelper('math_div', (a, b) => a / b);
    Handlebars.registerHelper('math_mult', (a, b) => a * b);
    Handlebars.registerHelper('math_add', (a, b) => a + b);
    Handlebars.registerHelper('math_sub', (a, b) => a - b);
    Handlebars.registerHelper('math_pct', (a, b) => a / b * 100);

    /* -------------------------------------------- */
    /*  Iterators                                   */
    /* -------------------------------------------- */
    Handlebars.registerHelper('repeat', (context, options) => {
        let ret = '';

        for (var i = 0; i < context; i++) {
            ret = ret + options.fn(context[i]);
            console.log("current stirng: ", ret);
        }

        return ret;
    });

    Handlebars.registerHelper('getSchemaField', (schema, path) => {
        console.log('schema: ', schema);
        console.log('path: ', path)
        if (schema instanceof foundry.abstract.TypeDataModel) throw new Error('Helper getSchemaField must be passed a Schemafield as its initital argument');
        if (typeof path != 'string') throw new Error('Helper getSchemaField must be passed a string path to a schema field as its secondary argument');
        
        return schema.getField(path);
    });
}

/**
 * Registers all system specific handlebars functionality
 */
export default function registerHandlebars() {
    registerTemplates();
    registerHelpers();
}