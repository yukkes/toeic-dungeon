
import { createStore } from "solid-js/store";
import { Pokemon } from "./game/Pokemon";
import { SaveManager } from "./game/SaveManager";

export const saveManager = new SaveManager();

export interface ItemState {
    potions: number;
    maxPotions: number;
    balls: number;
    maxBalls: number;
}

export interface GameState {
    screen: 'title' | 'dungeon' | 'battle' | 'starter' | 'result' | 'gym-setup' | 'gym-progress' | 'party-select';
    mode: 'training' | 'gym';
    player: Pokemon | null; // Determines the active pokemon (leader)
    party: Pokemon[]; // Active party
    currentFloor: number;
    items: ItemState;

    // Battle specific
    battle: {
        enemy: Pokemon | null;
        active: boolean;
        gymLeaderId?: number;
        gymStage?: number; // Index in GYM_LEADER_TEAMS
        gymTeamIndex?: number; // Enemy team index
        message: string;
        question: any;
        log: string[]; // Battle log
    };
}

export const [state, setState] = createStore<GameState>({
    screen: 'title',
    mode: 'training',
    player: null,
    party: [],
    currentFloor: 1,
    items: { potions: 0, maxPotions: 5, balls: 0, maxBalls: 5 },
    battle: {
        enemy: null,
        active: false,
        message: "",
        question: null,
        log: []
    }
});

export function logBattle(msg: string) {
    setState("battle", "log", (l) => [...l, msg]);
    setState("battle", "message", msg);
}
