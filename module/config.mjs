export const TFM = {};
//========================================================================================
//> Abilities
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
    aberration: 'TFM.Creature.Aberration',
    abomination: 'TFM.Creature.Abomination',
    beast: 'TFM.Creature.Beast',
    construct: 'TFM.Creature.Construct',
    demon: 'TFM.Creature.Demon',
    humanoid: 'TFM.Creature.Humanoid',
    monster: 'TFM.Creature.Monster',
    plant: 'TFM.Creature.Plant',
    undead: 'TFM.Creature.Undead',
};

//========================================================================================
//> Generic
//========================================================================================
TFM.Generic = {
    ability: 'TFM.Generic.Ability',
    age: 'TFM.Generic.Age',
    armour: 'TFM.Generic.Armour',
    auto: 'TFM.Generic.Automatic.abbr',
    automatic: 'TFM.Generic.Automatic.long',
    base: 'TFM.Generic.Base',
    bonus: 'TFM.Generic.Bonus',
    broken: 'TFM.Generic.Broken',
    chatDescription: 'TFM.Generic.ChatDescription',
    corruption: 'TFM.Generic.Corruption',
    curse: 'TFM.Generic.Curse.long',
    cursed: 'TFM.Generic.Cursed',
    defence: 'TFM.Generic.Defence',
    description: 'TFM.Generic.Description',
    dodge: "TFM.Generic.Dodge",
    enchatment: 'TFM.Generic.Enchantment.long',
    equip: "TFM.Generic.Equip",
    equipped: "TFM.Generic.Equipped",
    experience: 'TFM.Generic.Experience',
    gender: 'TFM.Generic.Gender',
    health: 'TFM.Generic.Health',
    height: 'TFM.Generic.Height',
    homeland: "TFM.Generic.Homeland.long",
    identified: 'TFM.Generic.Identified',
    kindred: "TFM.Generic.Kindred.long",
    label: 'TFM.Generic.Label',
    level: 'TFM.Generic.Level',
    normal: 'TFM.Generic.Normal',
    proficiency: 'TFM.Generic.Proficiency.long',
    price: "TFM.Generic.Price",
    ranged: "TFM.Generic.Ranged",
    reduction: "TFM.Generic.Reduction",
    resistance: "TFM.Generic.Resistance",
    size: "TFM.Generic.Size",
    type: "TFM.Generic.Type",
    weapon: 'TFM.Generic.Weapon',
    weight: 'TFM.Generic.Weight',
    skill: 'TFM.Generic.Skill'
};

TFM.Dice = {
    d4: 'd4',
    d6: 'd6',
    d8: 'd8',
    d10: 'd10',
    d12: 'd12',
    d20: 'd20',
    d100: 'd100',
}

TFM.Sizes = {
    tiny: "TFM.Size.Tiny",
    small: "TFM.Size.Small",
    medium: "TFM.Size.Medium",
    large: "TFM.Size.Large",
    huge: "TFM.Size.Huge"
}

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
//> Armour Types
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
//> Weapons Types
//========================================================================================
TFM.WeaponClass = {
    light: 'TFM.Weight.Light',
    medium: 'TFM.Weight.Medium',
    heavy: 'TFM.Weight.Heavy',
    ranged: 'TFM.Weapon.Ranged',
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
    thrown: 'TFM.Generic.Thrown',
    reach: 'TFM.Generic.Reach',
    finesse: 'TFM.Generic.Finesse',
    great: 'TFM.Generic.Great',// Ranged weapon using power instead of fin
    lucky: 'TFM.Generic.Lucky',
    oversized: 'TFM.Generic.Oversized',
    ...TFM.WeaponClass
};

//========================================================================================
//> Magic
//========================================================================================

TFM.TrinketTypes = {
    arc: 'TYPES.magic.arc',
    div: 'TYPES.magic.div',
    occ: 'TYPES.magic.occ',
};

TFM.MagicTypes = {
    arc: 'TYPES.magic.arc',
    div: 'TYPES.magic.div',
    nat: 'TYPES.magic.nat',
    occ: 'TYPES.magic.occ',
    per: 'TYPES.magic.per',
};

//========================================================================================
//> Corruption
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
//> Damage types
//========================================================================================
TFM.DamageClass = {
    phy: 'TFM.Damage.Class.Physical',
    ele: 'TFM.Damage.Class.Elemental',
    spc: 'TFM.Damage.Class.Special',
}

TFM.DamageTypes = {
    sharp: 'TFM.Damage.Type.Sharp',
    blunt: 'TFM.Damage.Type.Blunt',
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
};

TFM.DamageResistance = {
    immune: "TFM.Generic.Immune",
    resist: "TFM.Generic.Resist",
    vulnerable: "TFM.Generic.Vulnerable"
}

TFM.TargetTypes = {
    any: 'TFM.Generic.Any',
    ally: 'TFM.Generic.Ally',
    enemy: 'TFM.Generic.Enemy',
    creature: 'TFM.Generic.Creature',
    object: 'TFM.Generic.Object',
}

//========================================================================================
//> Effects
//========================================================================================
TFM.Effects = {
    active: 'TFM.Effect.Active',
    passive: 'TFM.Effect.Passive',
    suppressed: 'TFM.Effect.Suppressed',
    disabled: 'TFM.Effect.Disabled',
}

//========================================================================================
//> Helper Functions
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