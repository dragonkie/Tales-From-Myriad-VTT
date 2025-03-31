export const TFM = {};

/**
 * ===================================================
 * Declarations
 * ===================================================
 */

TFM.Abilities = {
    pwr: 'TFM.Ability.Pwr.long',
    fin: 'TFM.Ability.Fin.long',
    ins: 'TFM.Ability.Ins.long',
    chm: 'TFM.Ability.Chm.long',
    arc: 'TFM.Ability.Arc.long',
    occ: 'TFM.Ability.Occ.long',
    lck: 'TFM.Ability.Lck.long',
};

TFM.CreatureTypes = {
    beast: 'TFM.Creature.Beast',
    plant: 'TFM.Creature.Plant',
    monster: 'TFM.Creature.Monster',
    demon: 'TFM.Creature.Demon',
    construct: 'TFM.Creature.Construct',
    abomination: 'TFM.Creature.Abomination',
    aberration: 'TFM.Creature.Aberration',
    humanoid: 'TFM.Creature.Humanoid',
    undead: 'TFM.Creature.Undead',
};

TFM.Generic = {
    health: 'TFM.Generic.Health',
    level: 'TFM.Generic.Level',
    experience: 'TFM.Generic.Experience',
    corruption: 'TFM.Generic.Corruption'
};

TFM.Kindred = {
    human: 'TFM.Kindred.Human',
    elf: 'TFM.Kindred.Elf',
    animus: 'TFM.Kindred.Animus',
    frog: 'TFM.Kindred.Frog',
    bird: 'TFM.Kindred.Bird',
    beast: 'TFM.Kindred.Beast',
    gnome: 'TFM.Kindred.Gnome',
    moth: 'TFM.Kindred.Moth',
};

TFM.Homeland = {
    luxion: 'TFM.Homeland.Luxion',
    frogland: 'TFM.Homeland.Frogland',
    swamp: 'TFM.Homeland.Swamp',
    gobani: 'TFM.Homeland.Gobani',
    polaris: 'TFM.Homeland.Polaris',
    hills: 'TFM.Homeland.Hills',
    forcosia: 'TFM.Homeland.Forcosia',
    kingdom: 'TFM.Homeland.Kingdom'
};

TFM.ArmourTypes = {
    head: 'TYPES.Armour.Head',
    shoulder: 'TYPES.Armour.Shoulder',
    torso: 'TYPES.Armour.Torso',
    back: 'TYPES.Armour.Back',
    legs: 'TYPES.Armour.Legs',
    feet: 'TYPES.Armour.Feet',
    shield: 'TYPES.Armour.Shield',
};

TFM.ArmourTags = {
    minimal: '',
    light: '',
    medium: '',
    heavy: '',
}

TFM.WeaponTypes = {
    axe: 'TFM.Weapon.Axe',
    bow: 'TFM.Weapon.Bow',
    crossbow: 'TFM.Weapon.Crossbow',
    dagger: 'TFM.Weapon.Dagger',
    firearm: 'TFM.Weapon.Firearm',
    fist: 'TFM.Weapon.Fist',
    flail: 'TFM.Weapon.Flail',
    hammer: 'TFM.Weapon.Hammer',
    katana: 'TFM.Weapon.Katana',
    natural: 'TFM.Weapon.Natural',
    polearm: 'TFM.Weapon.Polearm',
    scythe: 'TFM.Weapon.Scythe',
    sword: 'TFM.Weapon.Sword',
    thrown: 'TFM.Weapon.Thrown',
    unarmed: 'TFM.Weapon.Unarmed',
    whip: 'TFM.Weapon.Whip',
}

TFM.WeaponTags = {
    thrown: '',
    reach: '',
    finesse: '',
    great: '',
    light: '',
    medium: '',
    heavy: '',
    ranged: '',
};

TFM.MagicTypes = {
    arc: 'TYPES.magic.arc',
    div: 'TYPES.magic.div',
    nat: 'TYPES.magic.nat',
    occ: 'TYPES.magic.occ',
    per: 'TYPES.magic.per',
};

TFM.DamageClass = {
    phy: 'TFM.Damage.Class.Physical',
    ele: 'TFM.Damage.Class.Elemental',
    spc: 'TFM.Damage.Class.Special',
}

TFM.DamageTypes = {
    cold: 'TFM.Damage.Type.Cold',
    fire: 'TFM.Damage.Type.Fire',
    sonic: 'TFM.Damage.Type.Sonic',
    electric: 'TFM.Damage.Type.Electric',
    poison: 'TFM.Damage.Type.Poison',
    acid: 'TFM.Damage.Type.Acid',
    radiant: 'TFM.Damage.Type.Radiant',
    necrotic: 'TFM.Damage.Type.Necrotic',
    force: 'TFM.Damage.Type.Force',
    psychic: 'TFM.Damage.Type.Psychic',
    sharp: 'TFM.Damage.Type.Sharp',
    blunt: 'TFM.Damage.Type.Blunt',
};

TFM.ItemSizes = {
    tiny: 'TFM.ItemSize.Tiny',// no slots
    small: 'TFM.ItemSize.Small',// stack to 10 (30 if its an ammo type)
    regular: 'TFM.ItemSize.Regular',// 1 slot
    large: 'TFM.ItemSize.Large',// 2 slot
    huge: 'TFM.ItemSize.Huge',//4 slot
    gigantic: 'TFM.ItemSize.Gigantic'// 8 slots
}

/**
 * =======================================================
 * Helper functions
 * =======================================================
 */

/**
 * Creates a new object with edited values tacked onto the end of these ones
 * @param {Object} group - original object to extend
 * @param {String} key - the key to extend with
 * @returns {Object} new object with edited values
 * @example TFM.AbilitiesAbbr = ExtendDeclaration(TFM.Abilities, '.abbr');
 */
function ExtendDeclaration(group, key) {
    const _d = {};
    for (const [k, value] of Object.entries(group)) _d[k] = value + key
    return _d;
}

/**
 * 
 * @param {Object} group - original object to extend
 * @param {String} label - the value to be replaced
 * @param {String} key - the key to extend with
 */
function ReplaceDeclaration(group, label, key) {
    const _d = {};
    for (const [k, value] of Object.entries(group)) _d[k] = value?.replace(label, key);
    return _d;
}

/**
 * =======================================================
 * Additional declarations
 * =======================================================
 */

TFM.AbilitiesAbbr = ReplaceDeclaration(TFM.Abilities, 'long', 'abbr');