export const TFM = {};
//========================================================================================
// Abilities
//========================================================================================

TFM.Abilities = {
    pwr: 'TFM.Ability.Pwr.long',
    fin: 'TFM.Ability.Fin.long',
    ins: 'TFM.Ability.Ins.long',
    chm: 'TFM.Ability.Chm.long',
    arc: 'TFM.Ability.Arc.long',
    occ: 'TFM.Ability.Occ.long',
    lck: 'TFM.Ability.Lck.long',
};

// quick reference list for the full length names
TFM.AbilitiesLong = {
    pwr: 'power',
    fin: 'finesse',
    ins: 'insight',
    chm: 'charm',
    arc: 'arcane',
    occ: 'occult',
    lck: 'luck'
}

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
    broken: 'TFM.Generic.Broken',
    chatDescription: 'TFM.Generic.ChatDescription',
    corruption: 'TFM.Generic.Corruption',
    curse: 'TFM.Generic.Curse.long',
    cursed: 'TFM.Generic.Cursed',
    description: 'TFM.Generic.Description',
    enchatment: 'TFM.Generic.Enchantment',
    experience: 'TFM.Generic.Experience',
    health: 'TFM.Generic.Health',
    identified: 'TFM.Generic.Identified',
    label: 'TFM.Generic.Label',
    level: 'TFM.Generic.Level',
    price: "TFM.Generic.Price",
    ranged: "TFM.Generic.Ranged",
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

//========================================================================================
// Armour
//========================================================================================
TFM.ArmourTypes = {
    head: 'TYPES.Armour.Head',
    shoulder: 'TYPES.Armour.Shoulder',
    torso: 'TYPES.Armour.Torso',
    back: 'TYPES.Armour.Back',
    legs: 'TYPES.Armour.Legs',
    feet: 'TYPES.Armour.Feet',
    shield: 'TYPES.Armour.Shield',
};

TFM.ArmourClass = {
    minimal: 'TFM.Armour.Minimal',
    light: 'TFM.Armour.Light',
    medium: 'TFM.Armour.Medium',
    heavy: 'TFM.Armour.Heavy',
}

//========================================================================================
// Weapons
//========================================================================================
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
    thrown: 'TFM.Generic.Thrown',
    reach: 'TFM.Generic.Reach',
    finesse: 'TFM.Generic.Finesse',
    great: 'TFM.Generic.Great',
    light: 'TFM.Generic.Light',
    medium: 'TFM.Generic.Medium',
    heavy: 'TFM.Generic.Heavy',
    ranged: 'TFM.Generic.Ranged',
};

TFM.MagicTypes = {
    arc: 'TYPES.magic.arc',
    div: 'TYPES.magic.div',
    nat: 'TYPES.magic.nat',
    occ: 'TYPES.magic.occ',
    per: 'TYPES.magic.per',
};

//========================================================================================
// Corruption
//========================================================================================
TFM.Corruption = {
    label: [
        "TFM.Corruption.None.label",
        "TFM.Corruption.Touched.label",
        "TFM.Corruption.Scrawlings.label",
        "TFM.Corruption.TransientCurse.label",
        "TFM.Corruption.Abandon.label",
        "TFM.Corruption.DarkInsight.label",
        "TFM.Corruption.Soulwarp.label",
        "TFM.Corruption.Felwarp.label",
        "TFM.Corruption.MonsterousMeditation.label",
        "TFM.Corruption.ThrallToChaos.label",
        "TFM.Corruption.FinalTransformation.label",
    ],
    description: [],
}

for (const a of TFM.Corruption.label) TFM.Corruption.description.push(a.replace('label', 'description'));

//========================================================================================
// Damage
//========================================================================================
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

//========================================================================================
// Helper Functions
//========================================================================================

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

//========================================================================================
// Extended declarations
//========================================================================================

TFM.AbilitiesAbbr = ReplaceDeclaration(TFM.Abilities, 'long', 'abbr');