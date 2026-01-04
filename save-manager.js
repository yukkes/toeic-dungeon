// Save Manager - LocalStorage persistence for Box/Gym
// Switch to localStorage to persist across browser sessions for Box Features

class SaveManager {
    constructor() {
        this.saveKey = 'moemon_toeic_v1';
        this.boxKey = 'moemon_box_v1';
    }

    // --- Box Management (Long-term Persistence) ---
    getBox() {
        try {
            const data = localStorage.getItem(this.boxKey);
            if (!data) return [];

            // Data is stored as Map object {id: pokemonData}
            const boxMap = JSON.parse(data);
            // Convert to array for compatibility
            return Object.values(boxMap);
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    saveToBox(pokemon) {
        // Load box as Map
        let boxMap = {};
        try {
            const data = localStorage.getItem(this.boxKey);
            if (data) {
                boxMap = JSON.parse(data);
            }
        } catch (e) {
            console.error(e);
        }

        const starterIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        // Prepare data object
        const pData = {
            id: pokemon.id,
            level: pokemon.level,
            exp: pokemon.exp,
            moves: pokemon.moves,
            baseStats: pokemon.baseStats,
            hp: pokemon.maxHp, // Heal on entering box
            timestamp: Date.now()
        };

        // Determine the key for this Pokemon
        let key;

        // Helper to find base ID of evolution line
        // NOTE: This logic needs to match EVOLUTIONS structure or be hardcoded.
        // For simplicity, we hardcode common lines or check "EVOLUTIONS" but EVOLUTIONS is imported?
        // Assuming global access to EVOLUTIONS or just hardcoding typical ones for MVP simplicity.

        const getBaseId = (id) => {
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

            return id; // Default (Single stage or unlisted)
        };

        const baseId = getBaseId(pokemon.id);
        key = `pokemon_family_${baseId}`;

        if (starterIds.includes(baseId)) {
            // Keep legacy keys for starters if needed, or just migrate to new uniform key?
            // To prevent data loss for existing users, we should prob check legacy keys.
            // But for new saves this is fine.
            if (baseId === 1) key = 'starter_bulbasaur';
            else if (baseId === 4) key = 'starter_charmander';
            else if (baseId === 7) key = 'starter_squirtle';
        }

        // Check if we should save this Pokemon
        const existing = boxMap[key];
        if (existing) {
            // Only save if new level is higher
            if (pokemon.level > existing.level) {
                console.log(`Updating ${POKEMON_DATA[pokemon.id].name} in box with higher level (${existing.level} -> ${pokemon.level})`);
                boxMap[key] = pData;
            } else {
                console.log(`${POKEMON_DATA[pokemon.id].name} already in box with equal or higher level (${existing.level}), skipping...`);
                return true; // Don't save lower level
            }
        } else {
            // New Pokemon
            console.log(`Adding ${POKEMON_DATA[pokemon.id].name} Lv.${pokemon.level} to box`);
            boxMap[key] = pData;
        }

        localStorage.setItem(this.boxKey, JSON.stringify(boxMap));
        return true;
    }

    // --- Dungeon Run State (Short-term Persistence) ---
    saveRun(gameState) {
        const data = {
            player: {
                id: gameState.playerPokemon.id,
                level: gameState.playerPokemon.level,
                hp: gameState.playerPokemon.hp,
                exp: gameState.playerPokemon.exp,
                moves: gameState.playerPokemon.moves
            },
            floor: gameState.currentFloor,
            stats: gameState.stats,
            party: gameState.party.map(p => ({
                id: p.id,
                level: p.level,
                hp: p.hp,
                exp: p.exp,
                moves: p.moves
            }))
        };
        sessionStorage.setItem(this.saveKey, JSON.stringify(data));
    }

    loadRun() {
        const data = sessionStorage.getItem(this.saveKey);
        if (!data) return null;
        const json = JSON.parse(data);

        // Rehydrate
        const player = this.rehydrate(json.player);
        const party = (json.party || []).map(p => this.rehydrate(p));

        return {
            playerPokemon: player,
            currentFloor: json.floor,
            stats: json.stats,
            party: party
        };
    }

    rehydrate(data) {
        const p = new Pokemon(data.id, data.level);
        p.hp = data.hp;
        p.exp = data.exp;
        if (data.moves) p.moves = data.moves;
        return p;
    }

    hasRunData() {
        return !!sessionStorage.getItem(this.saveKey);
    }

    clearRun() {
        sessionStorage.removeItem(this.saveKey);
    }

    clearAllData() {
        // Clear box
        localStorage.removeItem(this.boxKey);
        // Clear gym progress
        localStorage.removeItem('gymProgress');
        // Clear session data
        sessionStorage.removeItem(this.saveKey);
        console.log('All save data cleared');
    }
}
