import POKEMON_DATA_JSON from '../data/pokemon.json';
import LEARNSETS_JSON from '../data/learnsets.json';
import EVOLUTIONS_JSON from '../data/evolutions.json';
import { PokemonDef, PokemonBaseStats } from '../types';

const POKEMON_DATA: Record<string, PokemonDef> = POKEMON_DATA_JSON as any;
const LEARNSETS: Record<string, Record<string, string | string[]>> = LEARNSETS_JSON as any;
const EVOLUTIONS: Record<string, { level: number; to: number }> = EVOLUTIONS_JSON as any;

export class Pokemon {
    id: number;
    name: string;
    type1: string;
    type2: string | null;
    level: number;
    baseStats: PokemonBaseStats;
    maxHp: number;
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    exp: number;
    expToNext: number;
    moves: string[];
    stages: Record<string, number>;

    constructor(id: number, level = 5) {
        let data = POKEMON_DATA[String(id)];
        if (!data) data = POKEMON_DATA["25"]; // Fallback to Pikachu

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

    calculateStat(base: number, level: number, isHp = false): number {
        if (isHp) {
            return Math.floor(((2 * base + 31) * level / 100) + level + 10);
        }
        return Math.floor(((2 * base + 31) * level / 100) + 5);
    }

    initializeMoves() {
        let availableMoves: string[] = [];
        const learnset = LEARNSETS[String(this.id)] || LEARNSETS["default"];

        for (let l = 1; l <= this.level; l++) {
            if (learnset[String(l)]) {
                const movesAtLevel = learnset[String(l)];
                const m = Array.isArray(movesAtLevel) ? movesAtLevel : [movesAtLevel];
                m.forEach((move: string) => {
                    if (!availableMoves.includes(move)) availableMoves.push(move);
                });
            }
        }

        this.moves = availableMoves.slice(-4);
        if (this.moves.length === 0) this.moves.push("たいあたり");
    }

    learnMove(moveName: string) {
        if (this.moves.includes(moveName)) return;
        if (this.moves.length < 4) {
            this.moves.push(moveName);
        } else {
            this.moves.shift();
            this.moves.push(moveName);
        }
    }

    gainExp(amount: number): boolean {
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

        const oldMaxHp = this.maxHp;
        this.maxHp = this.calculateStat(this.baseStats.hp, this.level, true);
        this.hp += (this.maxHp - oldMaxHp);
        this.attack = this.calculateStat(this.baseStats.attack, this.level);
        this.defense = this.calculateStat(this.baseStats.defense, this.level);
        this.spAttack = this.calculateStat(this.baseStats.spAttack, this.level);
        this.spDefense = this.calculateStat(this.baseStats.spDefense, this.level);
        this.speed = this.calculateStat(this.baseStats.speed, this.level);

        const learnset = LEARNSETS[String(this.id)];
        if (learnset && learnset[String(this.level)]) {
            const movesAtLevel = learnset[String(this.level)];
            const m = Array.isArray(movesAtLevel) ? movesAtLevel : [movesAtLevel];
            m.forEach((move: string) => this.learnMove(move));
        }

        // Evolution
        const evo = EVOLUTIONS[String(this.id)];
        if (evo && this.level >= evo.level) {
            this.id = evo.to;
            const newData = POKEMON_DATA[String(this.id)];
            if (newData) {
                this.name = newData.name;
                this.baseStats = {
                    hp: newData.hp,
                    attack: newData.attack,
                    defense: newData.defense,
                    spAttack: newData.spAttack,
                    spDefense: newData.spDefense,
                    speed: newData.speed
                };

                this.maxHp = this.calculateStat(this.baseStats.hp, this.level, true);
                this.attack = this.calculateStat(this.baseStats.attack, this.level);
                this.defense = this.calculateStat(this.baseStats.defense, this.level);
                this.spAttack = this.calculateStat(this.baseStats.spAttack, this.level);
                this.spDefense = this.calculateStat(this.baseStats.spDefense, this.level);
                this.speed = this.calculateStat(this.baseStats.speed, this.level);
            }
        }
    }

    changeStage(stat: string, amount: number): boolean {
        if (this.stages[stat] === undefined) return false;
        const old = this.stages[stat];
        this.stages[stat] = Math.max(-6, Math.min(6, this.stages[stat] + amount));
        return this.stages[stat] !== old;
    }

    getStatWithStage(statName: string): number {
        const stat = (this as any)[statName] as number;
        const stage = this.stages[statName];
        if (stage === undefined || stage === 0) return stat;
        const mult = stage > 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
        return Math.floor(stat * mult);
    }

    takeDamage(damage: number): boolean {
        this.hp = Math.max(0, this.hp - damage);
        return this.hp === 0;
    }

    heal(amount: number) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    getTypes(): string[] {
        return this.type2 ? [this.type1, this.type2] : [this.type1];
    }
}
