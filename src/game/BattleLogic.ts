import MOVES_JSON from '../data/moves.json';
import TYPE_CHART_JSON from '../data/type-chart.json';
import { Pokemon } from './Pokemon';
import { MoveDef } from '../types';

const MOVES = MOVES_JSON as Record<string, MoveDef>;
const TYPE_CHART = TYPE_CHART_JSON as Record<string, Record<string, number>>;

export function getEffectivenessMessage(eff: number): string {
    if (eff === 0) return "効果がないようだ...";
    if (eff > 1) return "効果は抜群だ！";
    if (eff < 1) return "効果はいまひとつだ";
    return "";
}

export function isStatusMove(moveName: string): boolean {
    const move = MOVES[moveName];
    return move ? move.category === "status" : false;
}

export interface DamageResult {
    damage: number;
    effectiveness: number;
    critical: boolean;
}

export function calculateDamage(attacker: Pokemon, defender: Pokemon, moveName: string): DamageResult {
    const move = MOVES[moveName];
    if (!move) return { damage: 0, effectiveness: 0, critical: false };
    if (move.category === "status") return { damage: 0, effectiveness: 1, critical: false };

    // Critical Hit Chance
    let critChance = attacker.baseStats.speed / 512;
    if (move.highCrit) critChance *= 8;
    if (critChance > 0.99) critChance = 0.99;

    const isCritical = Math.random() < critChance;

    let attack: number, defense: number;
    if (isCritical) {
        // Gen 1 Crit ignores stages (simplified)
        attack = attacker.attack; // In original code it was using current stat but ignoring stages? 
        // Original: "attack = attacker.attack" (which is current stat calculated from level, without stages logic applied yet in getStatWithStage)
        defense = defender.defense;
    } else {
        attack = attacker.getStatWithStage(move.category === "physical" ? "attack" : "spAttack");
        defense = defender.getStatWithStage(move.category === "physical" ? "defense" : "spDefense");
    }

    const level = attacker.level;
    const levelFactor = isCritical ? (2 * level / 5 + 2) * 2 : (2 * level / 5 + 2);

    let damage = Math.floor((levelFactor * (move.power || 0) * (attack / defense)) / 50) + 2;

    // STAB
    if (attacker.getTypes().includes(move.type)) {
        damage = Math.floor(damage * 1.5);
    }

    // Type Effectiveness
    let effectiveness = 1;
    defender.getTypes().forEach(t => {
        if (t && TYPE_CHART[move.type] && TYPE_CHART[move.type][t] !== undefined) {
            effectiveness *= TYPE_CHART[move.type][t];
        }
    });
    damage = Math.floor(damage * effectiveness);

    // Random Variance (Gen 1: 217..255 / 255)
    if (effectiveness > 0) {
        const rnd = (Math.floor(Math.random() * 39) + 217) / 255;
        damage = Math.floor(damage * rnd);
    }

    return { damage: Math.max(1, damage), effectiveness, critical: isCritical };
}
