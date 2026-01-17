
export interface PokemonBaseStats {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
}

export interface PokemonDef {
    name: string;
    emoji: string;
    type1: string;
    type2: string | null;
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
}

export interface MoveDef {
    type: string;
    power?: number;
    category: "physical" | "special" | "status";
    effect?: {
        stat: string;
        amount: number;
        statJP: string;
    };
    isParalyze?: boolean;
    isLeechSeed?: boolean;
    priority?: number;
    highCrit?: boolean;
}

export interface DamageResult {
    damage: number;
    effectiveness: number;
    critical: boolean;
}

export interface PokemonInstance {
    id: number;
    name: string;
    level: number;
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
    baseStats: PokemonBaseStats;
    type1: string;
    type2: string | null;
}
