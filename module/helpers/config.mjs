import sysUtil from "./sysUtil.mjs";

export const TFM = {};

TFM.ability = {
    pow: "TFM.ability.pow",
    fin: "TFM.ability.fin",
    ins: "TFM.ability.ins",
    chr: "TFM.ability.chr",
    arc: "TFM.ability.arc",
    occ: "TFM.ability.occ",
    lck: "TFM.ability.lck",
    abbr: {
        pow: "TFM.ability.abbr.pow",
        fin: "TFM.ability.abbr.fin",
        ins: "TFM.ability.abbr.ins",
        chr: "TFM.ability.abbr.chr",
        arc: "TFM.ability.abbr.arc",
        occ: "TFM.ability.abbr.occ",
        lck: "TFM.ability.abbr.lck",
    }
};

TFM.corruption = {
    label: "TFM.corruption",
    level: (num) => {
        if (num === undefined) return `TFM.corruption.name.00`;
        var sNum = String(sysUtil.clamp(num, 0, 10));
        return `TFM.corruption.name.${sNum.padStart(2, '0')}`;
    },
    description: (num) => {
        if (num === undefined) return `TFM.corruption.desc.00`;
        var sNum = String(sysUtil.clamp(num, 0, 10));
        return `TFM.corruption.desc.${sNum.padStart(2, '0')}`;
    }
};

TFM.creature = {
    beast: "TYPES.creature.beast",
    plant: "TYPES.creature.plant",
    monster: "TYPES.creature.monster",
    demon: "TYPES.creature.demon",
    construct: "TYPES.creature.construct",
    abomination: "TYPES.creature.abomination",
    aberration: "TYPES.creature.aberration",
    humanoid: "TYPES.creature.humanoid",
    undead: "TYPES.creature.undead",
};

TFM.generic = {
    hp: "TFM.attribute.hp",
    lvl: "TFM.attribute.lvl",
    xp: "TFM.attribute.xp",

    abbr: {
        hp: "TFM.attribute.abbr.hp",
        lvl: "TFM.attribute.abbr.lvl",
        xp: "TFM.attribute.abbr.xp",
    }
};

TFM.quest = (num) => {
    if (num === undefined) return `TFM.quest.000`;
    var sNum = String(sysUtil.clamp(num, 1, 50));
    return `TFM.quest.${sNum.padStart(3, '0')}`;
}

TFM.job = {
    arrowmancer: "TFM.job.arrowmancer",
    astrologer: "TFM.job.astrologer",
    blademaster: "TFM.job.blademaster",
    chaos: "TFM.job.chaosKnight",
    duelist: "TFM.job.duelist",
    gladiator: "TFM.job.gladiator",
    hedgewitch: "TFM.job.hedgewitch",
    hunter: "TFM.job.hunter",
    juggler: "TFM.job.juggler",
    kitcheneer: "TFM.job.kitcheneer",
    marauder: "TFM.job.marauder",
    merchant: "TFM.job.merchant",
    mimic: "TFM.job.mimic",
    morpher: "TFM.job.morpher",
    nomad: "TFM.job.nomad",
    occultist: "TFM.job.occultist",
    performer: "TFM.job.performer",
    pistoleer: "TFM.job.pistoleer",
    rose: "TFM.job.roseKnight",
    sage: "TFM.job.sage",
    shade: "TFM.job.shade",
    theif: "TFM.job.theif",
    toxic: "TFM.job.toxicologist",
    weaver: "TFM.job.weaver",
    scholar: "TFM.job.scholar",
};

TFM.kindred = {
    human: "TFM.kindred.human",
    elf: "TFM.kindred.elf",
    animus: "TFM.kindred.animus",
    frog: "TFM.kindred.frog",
    bird: "TFM.kindred.bird",
    beast: "TFM.kindred.beast",
    gnome: "TFM.kindred.gnome",
    moth: "TFM.kindred.moth",
};

TFM.homeland = {
    luxion: "TFM.homeland.luxion",
    frogland: "TFM.homeland.frogland",
    swamp: "TFM.homeland.swamp",
    gobani: "TFM.homeland.gobani",
    polaris: "TFM.homeland.polaris",
    hills: "TFM.homeland.hills",
    forcosia: "TFM.homeland.forcosia",
    kingdom: "TFM.homeland.kingdom"
};

TFM.armour = {
    head: "TYPES.armour.head",
    shoulder: "TYPES.armour.shoulder",
    torso: "TYPES.armour.torso",
    back: "TYPES.armour.back",
    legs: "TYPES.armour.legs",
    feet: "TYPES.armour.feet",
    shield: "TYPES.armour.shield",
    tags: {
        minimal: "",
        light: "",
        medium: "",
        heavy: "",
        cursed: "",
        enchanted: ""
    },
    enchant: {
        label: (num) => {
            if (num === undefined) return `TFM.armour.enchant.label.000`;
            var sNum = String(num);
            return `TFM.armour.enchant.label.${sNum.padStart(3, '0')}`;
        },
        desc: (num) => {
            if (num === undefined) return `TFM.armour.enchant.desc.000`;
            var sNum = String(num);
            return `TFM.armour.enchant.desc.${sNum.padStart(3, '0')}`;
        }
    },
    curse: {
        label: (num) => {
            if (num === undefined) return `TFM.armour.curse.label.000`;
            var sNum = String(num);
            return `TFM.armour.curse.label.${sNum.padStart(3, '0')}`;
        },
        desc: (num) => {
            if (num === undefined) return `TFM.armour.curse.desc.000`;
            var sNum = String(num);
            return `TFM.armour.curse.desc.${sNum.padStart(3, '0')}`;
        }
    }
};

TFM.weapon = {
    axe: "TFM.weapon.axe",
    bow: "TFM.weapon.bow",
    dagger: "TFM.weapon.dagger",
    fist: "TFM.weapon.fist",
    flail: "TFM.weapon.flail",
    hammer: "TFM.weapon.hammer",
    katana: "TFM.weapon.katana",
    natural: "TFM.weapon.natural",
    pistol: "TFM.weapon.pistol",
    firearm: "TFM.weapon.firearm",
    polearm: "TFM.weapon.polearm",
    scythe: "TFM.weapon.scythe",
    sword: "TFM.weapon.sword",
    thrown: "TFM.weapon.thrown",
    unarmed: "TFM.weapon.unarmed",
    whip: "TFM.weapon.whip",

    tags: {
        thrown: "",
        reach: "",
        finesse: "",
        great: "",
        light: "",
        medium: "",
        heavy: "",
        ranged: "",
        cursed: "",
        enchanted: "",
    },
    enchant: {
        label: (num) => {
            if (num === undefined) return `TFM.weapon.enchant.label.000`;
            var sNum = String(num);
            return `TFM.weapon.enchant.label.${sNum.padStart(3, '0')}`;
        },
        desc: (num) => {
            if (num === undefined) return `TFM.weapon.enchant.desc.000`;
            var sNum = String(num);
            return `TFM.weapon.enchant.desc.${sNum.padStart(3, '0')}`;
        }
    },
    curse: {
        label: (num) => {
            if (num === undefined) return `TFM.weapon.curse.label.000`;
            var sNum = String(num);
            return `TFM.weapon.curse.label.${sNum.padStart(3, '0')}`;
        },
        desc: (num) => {
            if (num === undefined) return `TFM.weapon.curse.desc.000`;
            var sNum = String(num);
            return `TFM.weapon.curse.desc.${sNum.padStart(3, '0')}`;
        }
    }

};

TFM.magic = {
    arc: "TYPES.magic.arc",
    div: "TYPES.magic.div",
    nat: "TYPES.magic.nat",
    occ: "TYPES.magic.occ",
    per: "TYPES.magic.per",
};

TFM.damage = {
    physical: "TYPES.dmg.phy",
    elemental: "TYPES.dmg.ele",
    special: "TYPES.dmg.spe",
    cold: "TYPES.dmg.cld",
    fire: "TYPES.dmg.fir",
    sonic: "TYPES.dmg.thu",
    electric: "TYPES.dmg.lig",
    poison: "TYPES.dmg.poi",
    acid: "TYPES.dmg.acd",
    radiant: "TYPES.dmg.rad",
    necrotic: "TYPES.dmg.nec",
    force: "TYPES.dmg.frc",
    psychic: "TYPES.dmg.psy",
    slashing: "TYPES.dmg.sla",
    stabbing: "TYPES.dmg.stb",
    bludgeoning: "TYPES.dmg.blg",
};

TFM.poison = {
    simple: "TFM.poison.simple",
    ichor: "TFM.poison.ichor",
    silence: "TFM.poison.silence",
    leadbone: "TFM.poison.leadbone",
    slowdraw: "TFM.poison.slowdraw",
    miscast: "TFM.poison.miscast",
    graveroot: "TFM.poison.graveroot",
    enrage: "TFM.poison.enrage",
    sleeping: "TFM.poison.sleeping",
    desc: {
        simple: "TFM.poison.desc.simple",
        ichor: "TFM.poison.desc.ichor",
        silence: "TFM.poison.desc.silence",
        leadbone: "TFM.poison.desc.leadbone",
        slowdraw: "TFM.poison.desc.slowdraw",
        miscast: "TFM.poison.desc.miscast",
        graveroot: "TFM.poison.desc.graveroot",
        enrage: "TFM.poison.desc.enrage",
        sleeping: "TFM.poison.desc.sleeping",
    }
};

TFM.potion = {
    health: "TFM.potion.health",
    aptitude: "TFM.potion.aptitude",
    sorcery: "TFM.potion.sorcery",
    focus: "TFM.potion.focus",
    truesight: "TFM.potion.truesight",
    waterBreath: "TFM.potion.waterBreath",
    polymorph: "TFM.potion.polymorph",
    revive: "TFM.potion.revive",
    ghostify: "TFM.potion.ghostify",
    cure: "TFM.potion.cure",
    mislead: "TFM.potion.mislead",
    divination: "TFM.potion.divination",
    luck: "TFM.potion.luck",
    desc: {
        health: "TFM.potion.desc.health",
        aptitude: "TFM.potion.desc.aptitude",
        sorcery: "TFM.potion.desc.sorcery",
        focus: "TFM.potion.desc.focus",
        truesight: "TFM.potion.desc.truesight",
        waterBreath: "TFM.potion.desc.waterBreath",
        polymorph: "TFM.potion.desc.polymorph",
        revive: "TFM.potion.desc.revive",
        ghostify: "TFM.potion.desc.ghostify",
        cure: "TFM.potion.desc.cure",
        mislead: "TFM.potion.desc.mislead",
        divination: "TFM.potion.desc.divination",
        luck: "TFM.potion.desc.luck",
    }
}