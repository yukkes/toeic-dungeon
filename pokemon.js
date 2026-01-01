// Pokemon Data and Battle System using Gen 1 Mechanics

// Type effectiveness chart (Gen 1 Style roughly)
const TYPE_CHART = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2, bug: 2 }, // Poison was strong against Bug in Gen 1
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5, ghost: 0 }, // Ghost had 0 effect on Psychic in Gen 1 (bug)
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 2, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 }, // Bug beats poison in Gen 1
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// Pokemon base stats database
const POKEMON_DATA = {
    // Starters
    1: { name: "フシギダネ", emoji: "🌱", type1: "grass", type2: "poison", hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    4: { name: "ヒトカゲ", emoji: "🔥", type1: "fire", type2: null, hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
    7: { name: "ゼニガメ", emoji: "💧", type1: "water", type2: null, hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },

    // Evolutions
    2: { name: "フシギソウ", emoji: "🌺", type1: "grass", type2: "poison", hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 },
    3: { name: "フシギバナ", emoji: "🌸", type1: "grass", type2: "poison", hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 },
    5: { name: "リザード", emoji: "🦎", type1: "fire", type2: null, hp: 58, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80 },
    6: { name: "リザードン", emoji: "🐉", type1: "fire", type2: "flying", hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
    8: { name: "カメール", emoji: "🐢", type1: "water", type2: null, hp: 59, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58 },
    9: { name: "カメックス", emoji: "🐢", type1: "water", type2: null, hp: 79, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78 },

    // Common
    10: { name: "キャタピー", emoji: "🐛", type1: "bug", type2: null, hp: 45, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45 },
    16: { name: "ポッポ", emoji: "🐦", type1: "normal", type2: "flying", hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 },
    17: { name: "ピジョン", emoji: "🦅", type1: "normal", type2: "flying", hp: 63, attack: 60, defense: 55, spAttack: 50, spDefense: 50, speed: 71 },
    19: { name: "コラッタ", emoji: "🐀", type1: "normal", type2: null, hp: 30, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72 },
    25: { name: "ピカチュウ", emoji: "⚡", type1: "electric", type2: null, hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
    26: { name: "ライチュウ", emoji: "⚡", type1: "electric", type2: null, hp: 60, attack: 90, defense: 55, spAttack: 90, spDefense: 80, speed: 110 },
    38: { name: "キュウコン", emoji: "🦊", type1: "fire", type2: null, hp: 73, attack: 76, defense: 75, spAttack: 81, spDefense: 100, speed: 100 },
    39: { name: "プリン", emoji: "🎤", type1: "normal", type2: "fairy", hp: 115, attack: 45, defense: 20, spAttack: 45, spDefense: 25, speed: 20 },
    65: { name: "フーディン", emoji: "🥄", type1: "psychic", type2: null, hp: 55, attack: 50, defense: 45, spAttack: 135, spDefense: 95, speed: 120 },
    133: { name: "イーブイ", emoji: "🦊", type1: "normal", type2: null, hp: 55, attack: 55, defense: 55, spAttack: 45, spDefense: 65, speed: 55 },
    150: { name: "ミュウツー", emoji: "👽", type1: "psychic", type2: null, hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130 },

    // Gatekeeper (9F) - Dragonite substitute or just strong
    149: { name: "カイリュー", emoji: "🐲", type1: "dragon", type2: "flying", hp: 91, attack: 134, defense: 95, spAttack: 100, spDefense: 100, speed: 80 },

    // Gym Leaders (Pseudo-Pokemon)
    153: { name: "タケシ", emoji: "🗿", type1: "rock", type2: "ground", hp: 80, attack: 80, defense: 100, spAttack: 30, spDefense: 30, speed: 50 },
    154: { name: "カスミ", emoji: "🧜‍♀️", type1: "water", type2: null, hp: 80, attack: 60, defense: 60, spAttack: 90, spDefense: 90, speed: 100 },
    155: { name: "マチス", emoji: "⚡", type1: "electric", type2: null, hp: 80, attack: 90, defense: 60, spAttack: 80, spDefense: 60, speed: 100 },
    156: { name: "エリカ", emoji: "🌺", type1: "grass", type2: null, hp: 90, attack: 60, defense: 80, spAttack: 90, spDefense: 100, speed: 60 },
    157: { name: "キョウ", emoji: "🥷", type1: "poison", type2: null, hp: 90, attack: 90, defense: 80, spAttack: 70, spDefense: 70, speed: 90 },
    158: { name: "ナツメ", emoji: "🔮", type1: "psychic", type2: null, hp: 70, attack: 50, defense: 50, spAttack: 120, spDefense: 100, speed: 110 },
    159: { name: "カツラ", emoji: "🔥", type1: "fire", type2: null, hp: 80, attack: 90, defense: 70, spAttack: 100, spDefense: 80, speed: 90 },
    160: { name: "サカキ", emoji: "🌍", type1: "ground", type2: null, hp: 100, attack: 100, defense: 100, spAttack: 60, spDefense: 60, speed: 80 }
};

const LEARNSETS = {
    1: { 1: ["たいあたり", "なきごえ"], 7: "やどりぎのタネ", 13: "つるのムチ", 20: "はっぱカッター", 27: "せいちょう", 34: "ソーラービーム" },
    2: { 20: "はっぱカッター", 30: "せいちょう", 38: "ソーラービーム" },
    3: { 30: "せいちょう", 50: "ソーラービーム" },
    4: { 1: ["ひっかく", "なきごえ"], 9: "ひのこ", 15: "にらみつける", 22: "きりさく", 30: "かえんほうしゃ" },
    5: { 24: "きりさく", 32: "かえんほうしゃ" },
    6: { 36: "つばさでうつ", 45: "だいもんじ" },
    7: { 1: ["たいあたり", "しっぽをふる"], 8: "あわ", 15: "みずでっぽう", 24: "かみつく", 31: "ロケットずつき", 42: "ハイドロポンプ" },
    8: { 24: "かみつく", 31: "ロケットずつき" },
    9: { 42: "ハイドロポンプ" },
    16: { 1: ["かぜおこし", "すなかけ"], 5: "すなかけ", 12: "でんこうせっか", 21: "ふきとばし" },
    19: { 1: ["たいあたり", "しっぽをふる"], 7: "でんこうせっか", 14: "ひっさつまえば" },
    25: { 1: ["でんきショック", "なきごえ"], 9: "でんじは", 26: "10まんボルト" },
    149: { 1: ["たいあたり", "はかいこうせん"] },
    "default": { 1: ["たいあたり"] }
};

class Pokemon {
    constructor(id, level = 5) {
        let data = POKEMON_DATA[id];
        if (!data) data = POKEMON_DATA[25]; // Fallback

        this.id = id;
        this.name = data.name;
        this.type1 = data.type1;
        this.type2 = data.type2;
        this.level = level;

        // Base Stats
        this.baseStats = {
            hp: data.hp,
            attack: data.attack,
            defense: data.defense,
            spAttack: data.spAttack,
            spDefense: data.spDefense,
            speed: data.speed
        };

        // Current Stats
        this.maxHp = this.calculateStat(this.baseStats.hp, level, true);
        this.hp = this.maxHp;
        this.attack = this.calculateStat(this.baseStats.attack, level);
        this.defense = this.calculateStat(this.baseStats.defense, level);
        this.spAttack = this.calculateStat(this.baseStats.spAttack, level);
        this.spDefense = this.calculateStat(this.baseStats.spDefense, level);
        this.speed = this.calculateStat(this.baseStats.speed, level);

        this.exp = 0;
        this.expToNext = Math.floor(Math.pow(level + 1, 3));

        // Moves
        this.moves = [];
        this.initializeMoves();

        // Stages
        this.stages = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, accuracy: 0, evasion: 0 };
    }

    calculateStat(base, level, isHp = false) {
        if (isHp) {
            return Math.floor(((2 * base + 31) * level / 100) + level + 10);
        }
        return Math.floor(((2 * base + 31) * level / 100) + 5);
    }

    initializeMoves() {
        // Collect available moves
        let availableMoves = [];
        const learnset = LEARNSETS[this.id] || LEARNSETS["default"];

        for (let l = 1; l <= this.level; l++) {
            if (learnset[l]) {
                const m = Array.isArray(learnset[l]) ? learnset[l] : [learnset[l]];
                m.forEach(move => {
                    if (!availableMoves.includes(move)) availableMoves.push(move);
                });
            }
        }

        this.moves = availableMoves.slice(-4);
        if (this.moves.length === 0) this.moves.push("たいあたり");
    }

    learnMove(moveName) {
        if (this.moves.includes(moveName)) return;
        if (this.moves.length < 4) {
            this.moves.push(moveName);
        } else {
            // Replace first (FIFO)
            this.moves.shift();
            this.moves.push(moveName);
        }
    }

    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        while (this.exp >= this.expToNext) {
            this.levelUp();
            leveledUp = true;
        }
        return leveledUp;
    }

    levelUp() {
        this.level++;
        this.expToNext = Math.floor(Math.pow(this.level + 1, 3));

        // Stats
        const oldMaxHp = this.maxHp;
        this.maxHp = this.calculateStat(this.baseStats.hp, this.level, true);
        this.hp += (this.maxHp - oldMaxHp);
        this.attack = this.calculateStat(this.baseStats.attack, this.level);
        this.defense = this.calculateStat(this.baseStats.defense, this.level);
        this.spAttack = this.calculateStat(this.baseStats.spAttack, this.level);
        this.spDefense = this.calculateStat(this.baseStats.spDefense, this.level);
        this.speed = this.calculateStat(this.baseStats.speed, this.level);

        // Moves
        const learnset = LEARNSETS[this.id];
        if (learnset && learnset[this.level]) {
            const m = Array.isArray(learnset[this.level]) ? learnset[this.level] : [learnset[this.level]];
            m.forEach(move => this.learnMove(move));
        }

        // Evolution
        if (EVOLUTIONS[this.id] && this.level >= EVOLUTIONS[this.id].level) {
            this.id = EVOLUTIONS[this.id].to;
            const newData = POKEMON_DATA[this.id];
            if (newData) {
                this.name = newData.name;
                this.baseStats = { hp: newData.hp, attack: newData.attack, defense: newData.defense, spAttack: newData.spAttack, spDefense: newData.spDefense, speed: newData.speed };
                this.maxHp = this.calculateStat(this.baseStats.hp, this.level, true);
                this.attack = this.calculateStat(this.baseStats.attack, this.level);
                this.defense = this.calculateStat(this.baseStats.defense, this.level);
                this.spAttack = this.calculateStat(this.baseStats.spAttack, this.level);
                this.spDefense = this.calculateStat(this.baseStats.spDefense, this.level);
                this.speed = this.calculateStat(this.baseStats.speed, this.level);
            }
        }
    }

    changeStage(stat, amount) {
        if (this.stages[stat] === undefined) return false;
        const old = this.stages[stat];
        this.stages[stat] = Math.max(-6, Math.min(6, this.stages[stat] + amount));
        return this.stages[stat] !== old;
    }

    getStatWithStage(statName) {
        const stat = this[statName];
        const stage = this.stages[statName];
        if (stage === 0) return stat;
        const mult = stage > 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
        return Math.floor(stat * mult);
    }

    takeDamage(damage) {
        this.hp = Math.max(0, this.hp - damage);
        return this.hp === 0;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    getTypes() {
        return this.type2 ? [this.type1, this.type2] : [this.type1];
    }
}

const EVOLUTIONS = {
    1: { level: 16, to: 2 }, 2: { level: 32, to: 3 },
    4: { level: 16, to: 5 }, 5: { level: 36, to: 6 },
    7: { level: 16, to: 8 }, 8: { level: 36, to: 9 },
    16: { level: 18, to: 17 }
};

const MOVES = {
    // Basic
    "たいあたり": { type: "normal", power: 40, category: "physical" },
    "ひっかく": { type: "normal", power: 40, category: "physical" },
    "はたく": { type: "normal", power: 40, category: "physical" },
    "なきごえ": { type: "normal", category: "status", effect: { stat: "attack", amount: -1, statJP: "こうげき" } },
    "しっぽをふる": { type: "normal", category: "status", effect: { stat: "defense", amount: -1, statJP: "ぼうぎょ" } },
    "にらみつける": { type: "normal", category: "status", effect: { stat: "defense", amount: -1, statJP: "ぼうぎょ" } },
    "せいちょう": { type: "normal", category: "status", effect: { stat: "spAttack", amount: 1, statJP: "とくこう" } },
    "かぜおこし": { type: "normal", power: 40, category: "physical" },
    "すなかけ": { type: "normal", category: "status", effect: { stat: "accuracy", amount: -1, statJP: "めいちゅう" } },
    "でんこうせっか": { type: "normal", power: 40, category: "physical", priority: 1 },
    "ひっさつまえば": { type: "normal", power: 80, category: "physical" },
    "はかいこうせん": { type: "normal", power: 150, category: "physical" },

    // Grass
    "つるのムチ": { type: "grass", power: 45, category: "physical" },
    "はっぱカッター": { type: "grass", power: 55, category: "physical", highCrit: true },
    "ソーラービーム": { type: "grass", power: 120, category: "special" },
    "やどりぎのタネ": { type: "grass", category: "status", isLeechSeed: true },

    // Fire
    "ひのこ": { type: "fire", power: 40, category: "special" },
    "かえんほうしゃ": { type: "fire", power: 90, category: "special" },
    "だいもんじ": { type: "fire", power: 110, category: "special" },
    "つばさでうつ": { type: "flying", power: 35, category: "physical" },

    // Water
    "あわ": { type: "water", power: 20, category: "special" },
    "みずでっぽう": { type: "water", power: 40, category: "special" },
    "バブルこうせん": { type: "water", power: 65, category: "special" },
    "ハイドロポンプ": { type: "water", power: 110, category: "special" },
    "ロケットずつき": { type: "normal", power: 100, category: "physical" },
    "かみつく": { type: "normal", power: 60, category: "physical" },

    // Electric
    "でんきショック": { type: "electric", power: 40, category: "special" },
    "10まんボルト": { type: "electric", power: 90, category: "special" },
    "でんじは": { type: "electric", category: "status", isParalyze: true },

    // Others
    "いわおとし": { type: "rock", power: 50, category: "physical" },
    "じしん": { type: "ground", power: 100, category: "physical" },
    "サイコキネシス": { type: "psychic", power: 90, category: "special" }
};

function calculateDamage(attacker, defender, moveName) {
    const move = MOVES[moveName];
    if (!move) return { damage: 0, effectiveness: 0, critical: false };
    if (move.category === "status") return { damage: 0, effectiveness: 1, critical: false };

    // Crit 
    let critChance = attacker.baseStats.speed / 512;
    if (move.highCrit) critChance *= 8;
    if (critChance > 0.99) critChance = 0.99;

    // Always crit for test happiness if debug, but normal otherwise
    const isCritical = Math.random() < critChance;

    let attack, defense;
    if (isCritical) {
        attack = attacker.attack; // Simplified Gen 1 crit (ignore mods)
        defense = defender.defense;
    } else {
        attack = attacker.getStatWithStage(move.category === "physical" ? "attack" : "spAttack");
        defense = defender.getStatWithStage(move.category === "physical" ? "defense" : "spDefense");
    }

    const level = attacker.level;
    const levelFactor = isCritical ? (2 * level / 5 + 2) * 2 : (2 * level / 5 + 2);

    let damage = Math.floor((levelFactor * move.power * (attack / defense)) / 50) + 2;

    // STAB
    if (attacker.getTypes().includes(move.type)) {
        damage = Math.floor(damage * 1.5);
    }

    // Type
    let effectiveness = 1;
    defender.getTypes().forEach(t => {
        if (TYPE_CHART[move.type] && TYPE_CHART[move.type][t] !== undefined) {
            effectiveness *= TYPE_CHART[move.type][t];
        }
    });
    damage = Math.floor(damage * effectiveness);

    // Random
    if (effectiveness > 0) {
        const rnd = (Math.floor(Math.random() * 39) + 217) / 255;
        damage = Math.floor(damage * rnd);
    }

    return { damage: Math.max(1, damage), effectiveness, critical: isCritical };
}

function getEffectivenessMessage(eff) {
    if (eff === 0) return "効果がないようだ...";
    if (eff > 1) return "効果は抜群だ！";
    if (eff < 1) return "効果はいまひとつだ";
    return "";
}
