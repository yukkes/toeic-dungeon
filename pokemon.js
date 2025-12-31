// Pokemon Data and Battle System

// Type effectiveness chart (attacker type -> defender type -> multiplier)
const TYPE_CHART = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// Pokemon base stats database (simplified - showing key Pokemon)
const POKEMON_DATA = {
    // Starters
    1: { name: "フシギダネ", type1: "grass", type2: "poison", hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    4: { name: "ヒトカゲ", type1: "fire", type2: null, hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
    7: { name: "ゼニガメ", type1: "water", type2: null, hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },

    // Common weak Pokemon
    16: { name: "ポッポ", type1: "normal", type2: "flying", hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 },
    19: { name: "コラッタ", type1: "normal", type2: null, hp: 30, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72 },
    10: { name: "キャタピー", type1: "bug", type2: null, hp: 45, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45 },

    // Mid-tier Pokemon
    25: { name: "ピカチュウ", type1: "electric", type2: null, hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
    133: { name: "イーブイ", type1: "normal", type2: null, hp: 55, attack: 55, defense: 55, spAttack: 45, spDefense: 65, speed: 55 },
    39: { name: "プリン", type1: "normal", type2: "fairy", hp: 115, attack: 45, defense: 20, spAttack: 45, spDefense: 25, speed: 20 },

    // Evolutions
    2: { name: "フシギソウ", type1: "grass", type2: "poison", hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 },
    5: { name: "リザード", type1: "fire", type2: null, hp: 58, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80 },
    8: { name: "カメール", type1: "water", type2: null, hp: 59, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58 },

    // Strong Pokemon
    6: { name: "リザードン", type1: "fire", type2: "flying", hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
    9: { name: "カメックス", type1: "water", type2: null, hp: 79, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78 },
    65: { name: "フーディン", type1: "psychic", type2: null, hp: 55, attack: 50, defense: 45, spAttack: 135, spDefense: 95, speed: 120 },

    // Gym leader Pokemon
    95: { name: "イワーク", type1: "rock", type2: "ground", hp: 35, attack: 45, defense: 160, spAttack: 30, spDefense: 45, speed: 70 },
    121: { name: "スターミー", type1: "water", type2: "psychic", hp: 60, attack: 75, defense: 85, spAttack: 100, spDefense: 85, speed: 115 },
    26: { name: "ライチュウ", type1: "electric", type2: null, hp: 60, attack: 90, defense: 55, spAttack: 90, spDefense: 80, speed: 110 },
    38: { name: "キュウコン", type1: "fire", type2: null, hp: 73, attack: 76, defense: 75, spAttack: 81, spDefense: 100, speed: 100 },

    // Legendary starters (if encountered)
    150: { name: "ミュウツー", type1: "psychic", type2: null, hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130 },
    151: { name: "ミュウ", type1: "psychic", type2: null, hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 }
};

class Pokemon {
    constructor(id, level = 5) {
        const data = POKEMON_DATA[id];
        if (!data) {
            console.error(`Pokemon with ID ${id} not found`);
            return;
        }

        this.id = id;
        this.name = data.name;
        this.type1 = data.type1;
        this.type2 = data.type2;
        this.level = level;

        // Calculate stats based on level
        this.maxHp = this.calculateStat(data.hp, level);
        this.hp = this.maxHp;
        this.attack = this.calculateStat(data.attack, level);
        this.defense = this.calculateStat(data.defense, level);
        this.spAttack = this.calculateStat(data.spAttack, level);
        this.spDefense = this.calculateStat(data.spDefense, level);
        this.speed = this.calculateStat(data.speed, level);

        // Experience
        this.exp = 0;
        this.expToNext = this.calculateExpToNext(level);
    }

    calculateStat(base, level) {
        // Simplified stat formula: ((2 * Base + 31) * Level / 100) + Level + 10
        return Math.floor(((2 * base + 31) * level / 100) + level + 10);
    }

    calculateExpToNext(level) {
        // Medium-fast growth rate
        return Math.floor(Math.pow(level + 1, 3));
    }

    takeDamage(damage) {
        this.hp = Math.max(0, this.hp - damage);
        return this.hp <= 0;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    gainExp(amount) {
        this.exp += amount;

        // Check for level up
        while (this.exp >= this.expToNext && this.level < 100) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        const oldMaxHp = this.maxHp;

        // Recalculate stats
        const data = POKEMON_DATA[this.id];
        this.maxHp = this.calculateStat(data.hp, this.level);
        this.hp += (this.maxHp - oldMaxHp); // Heal the difference
        this.attack = this.calculateStat(data.attack, this.level);
        this.defense = this.calculateStat(data.defense, this.level);
        this.spAttack = this.calculateStat(data.spAttack, this.level);
        this.spDefense = this.calculateStat(data.spDefense, this.level);
        this.speed = this.calculateStat(data.speed, this.level);

        this.expToNext = this.calculateExpToNext(this.level);

        return true;
    }

    getTypes() {
        return this.type2 ? [this.type1, this.type2] : [this.type1];
    }
}

// Move database
const MOVES = {
    "たいあたり": { type: "normal", power: 40, category: "physical" },
    "ひっかく": { type: "normal", power: 40, category: "physical" },
    "はたく": { type: "normal", power: 40, category: "physical" },
    "つるのムチ": { type: "grass", power: 45, category: "physical" },
    "はっぱカッター": { type: "grass", power: 55, category: "physical" },
    "ソーラービーム": { type: "grass", power: 120, category: "special" },
    "ひのこ": { type: "fire", power: 40, category: "special" },
    "かえんほうしゃ": { type: "fire", power: 90, category: "special" },
    "みずでっぽう": { type: "water", power: 40, category: "special" },
    "バブルこうせん": { type: "water", power: 65, category: "special" },
    "ハイドロポンプ": { type: "water", power: 110, category: "special" },
    "でんきショック": { type: "electric", power: 40, category: "special" },
    "10まんボルト": { type: "electric", power: 90, category: "special" },
    "サイコキネシス": { type: "psychic", power: 90, category: "special" },
    "いわおとし": { type: "rock", power: 50, category: "physical" },
    "じしん": { type: "ground", power: 100, category: "physical" }
};

// Calculate damage
function calculateDamage(attacker, defender, moveName) {
    const move = MOVES[moveName];
    if (!move) return 0;

    // Determine attack and defense stats
    const attackStat = move.category === "physical" ? attacker.attack : attacker.spAttack;
    const defenseStat = move.category === "physical" ? defender.defense : defender.spDefense;

    // Base damage calculation
    const levelMod = (2 * attacker.level / 5) + 2;
    const baseDamage = (levelMod * move.power * (attackStat / defenseStat)) / 50;

    // Type effectiveness
    let effectiveness = 1;
    const defenderTypes = defender.getTypes();

    for (const defType of defenderTypes) {
        if (TYPE_CHART[move.type] && TYPE_CHART[move.type][defType] !== undefined) {
            effectiveness *= TYPE_CHART[move.type][defType];
        }
    }

    // Random factor (0.85 - 1.0)
    const randomFactor = 0.85 + Math.random() * 0.15;

    // STAB (Same Type Attack Bonus)
    const stab = attacker.getTypes().includes(move.type) ? 1.5 : 1;

    const finalDamage = Math.floor(baseDamage * effectiveness * randomFactor * stab) + 2;

    return {
        damage: Math.max(1, finalDamage),
        effectiveness: effectiveness
    };
}

// Get effectiveness message
function getEffectivenessMessage(effectiveness) {
    if (effectiveness === 0) return "効果がないようだ...";
    if (effectiveness < 0.5) return "効果はいまひとつだ...";
    if (effectiveness < 1) return "効果はいまひとつだ";
    if (effectiveness > 2) return "効果は抜群だ！";
    if (effectiveness > 1) return "効果は抜群だ！";
    return "";
}
