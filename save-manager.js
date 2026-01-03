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
        if (starterIds.includes(pokemon.id)) {
            // Starters: Use evolution line as key
            if ([1, 2, 3].includes(pokemon.id)) key = 'starter_bulbasaur';
            else if ([4, 5, 6].includes(pokemon.id)) key = 'starter_charmander';
            else if ([7, 8, 9].includes(pokemon.id)) key = 'starter_squirtle';
        } else {
            // Regular Pokemon: Use species ID as key
            key = `pokemon_${pokemon.id}`;
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
