
import { Pokemon } from '../game/Pokemon';
import POKEMON_DATA_JSON from '../data/pokemon.json';
import { PokemonDef } from '../types';

const POKEMON_DATA: Record<string, PokemonDef> = POKEMON_DATA_JSON as any;

export class SaveManager {
    saveKey = 'moemon_toeic_v1';
    boxKey = 'moemon_box_v1';

    // --- Box Management (Long-term Persistence) ---
    getBox(): any[] {
        try {
            const data = localStorage.getItem(this.boxKey);
            if (!data) return [];
            const boxMap = JSON.parse(data);
            return Object.values(boxMap);
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    saveToBox(pokemon: Pokemon): boolean {
        let boxMap: Record<string, any> = {};
        try {
            const data = localStorage.getItem(this.boxKey);
            if (data) {
                boxMap = JSON.parse(data);
            }
        } catch (e) {
            console.error(e);
        }

        const starterIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        const pData = {
            id: pokemon.id,
            level: pokemon.level,
            exp: pokemon.exp,
            moves: pokemon.moves,
            baseStats: pokemon.baseStats,
            hp: pokemon.maxHp, // Heal on entering box
            timestamp: Date.now()
        };

        const getBaseId = (id: number): number => {
            if ([1, 2, 3].includes(id)) return 1;
            if ([4, 5, 6].includes(id)) return 4;
            if ([7, 8, 9].includes(id)) return 7;
            if ([10, 11, 12].includes(id)) return 10;
            if ([13, 14, 15].includes(id)) return 13;
            if ([16, 17, 18].includes(id)) return 16;
            if ([19, 20].includes(id)) return 19;
            if ([21, 22].includes(id)) return 21;
            if ([25, 26].includes(id)) return 25;
            if ([29, 30, 31].includes(id)) return 29;
            if ([32, 33, 34].includes(id)) return 32;
            if ([35, 36].includes(id)) return 35;
            if ([37, 38].includes(id)) return 37;
            if ([39, 40].includes(id)) return 39;
            if ([41, 42].includes(id)) return 41;
            if ([50, 51].includes(id)) return 50;
            if ([58, 59].includes(id)) return 58;
            if ([60, 61, 62].includes(id)) return 60;
            if ([63, 64, 65].includes(id)) return 63;
            if ([69, 70, 71].includes(id)) return 69;
            if ([74, 75, 76].includes(id)) return 74;
            if ([100, 101].includes(id)) return 100;
            if ([109, 110].includes(id)) return 109;
            if ([111, 112].includes(id)) return 111;
            if ([120, 121].includes(id)) return 120;
            if ([133, 134, 135, 136].includes(id)) return 133;
            return id;
        };

        const baseId = getBaseId(pokemon.id);
        let key = `pokemon_family_${baseId}`;

        if (starterIds.includes(baseId)) {
            if (baseId === 1) key = 'starter_bulbasaur';
            else if (baseId === 4) key = 'starter_charmander';
            else if (baseId === 7) key = 'starter_squirtle';
        }

        const existing = boxMap[key];
        if (existing) {
            if (pokemon.level > existing.level) {
                console.log(`Updating ${POKEMON_DATA[String(pokemon.id)]?.name} in box with higher level (${existing.level} -> ${pokemon.level})`);
                boxMap[key] = pData;
            } else {
                console.log(`${POKEMON_DATA[String(pokemon.id)]?.name} already in box with equal or higher level (${existing.level}), skipping...`);
                return true;
            }
        } else {
            console.log(`Adding ${POKEMON_DATA[String(pokemon.id)]?.name} Lv.${pokemon.level} to box`);
            boxMap[key] = pData;
        }

        localStorage.setItem(this.boxKey, JSON.stringify(boxMap));
        return true;
    }

    // --- Dungeon Run State (Short-term Persistence) ---
    // Note: Reusing generic gameState object or specific interface?
    // In Solid port, we might store this differently or just assume simple object.
    saveRun(gameState: any) {
        if (!gameState.playerPokemon) return;

        const data = {
            player: {
                id: gameState.playerPokemon.id,
                level: gameState.playerPokemon.level,
                hp: gameState.playerPokemon.hp,
                exp: gameState.playerPokemon.exp,
                moves: gameState.playerPokemon.moves
            },
            floor: gameState.currentFloor,
            items: gameState.items, // Original had stats? 'items' is likely what we want
            party: (gameState.party || []).map((p: Pokemon) => ({
                id: p.id,
                level: p.level,
                hp: p.hp,
                exp: p.exp,
                moves: p.moves
            }))
        };
        sessionStorage.setItem(this.saveKey, JSON.stringify(data));
    }

    loadRun(): any | null {
        const data = sessionStorage.getItem(this.saveKey);
        if (!data) return null;
        const json = JSON.parse(data);

        // Rehydrate
        const player = this.rehydrate(json.player);
        const party = (json.party || []).map((p: any) => this.rehydrate(p));

        return {
            playerPokemon: player,
            currentFloor: json.floor,
            items: json.items,
            party: party
        };
    }

    rehydrate(data: any): Pokemon {
        const p = new Pokemon(data.id, data.level);
        p.hp = data.hp;
        p.exp = data.exp;
        if (data.moves) p.moves = data.moves;
        return p;
    }

    hasRunData(): boolean {
        return !!sessionStorage.getItem(this.saveKey);
    }

    clearRun() {
        sessionStorage.removeItem(this.saveKey);
    }

    clearAllData() {
        localStorage.removeItem(this.boxKey);
        localStorage.removeItem('gymProgress');
        sessionStorage.removeItem(this.saveKey);
        console.log('All save data cleared');
    }
}
