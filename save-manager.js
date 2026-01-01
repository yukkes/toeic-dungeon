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
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    saveToBox(pokemon) {
        let box = this.getBox();
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

        // Check if starter (Unique rule)
        if (starterIds.includes(pokemon.id)) {
            // Find root species (e.g. 1, 2, 3 are Bulbasaur line)
            // Actually simpler: Just check if any box pokemon is in the same evolution line?
            // User requested: "御三家はボックスに重複しないようにして"
            // Let's assume unique by exact ID or Line.
            // Simplified: Unique by Starter Line.
            const isBulba = [1, 2, 3].includes(pokemon.id);
            const isChar = [4, 5, 6].includes(pokemon.id);
            const isSquirt = [7, 8, 9].includes(pokemon.id);

            const index = box.findIndex(p => {
                if (isBulba && [1, 2, 3].includes(p.id)) return true;
                if (isChar && [4, 5, 6].includes(p.id)) return true;
                if (isSquirt && [7, 8, 9].includes(p.id)) return true;
                return false;
            });

            if (index >= 0) {
                // Overwrite (Update)
                console.log("Updating starter in box...");
                box[index] = pData;
            } else {
                // Add new if box not full
                if (box.length < 16) {
                    box.push(pData);
                } else {
                    return false; // Box full
                }
            }
        } else {
            // Regular Pokemon
            if (box.length < 16) {
                box.push(pData);
            } else {
                return false;
            }
        }

        localStorage.setItem(this.boxKey, JSON.stringify(box));
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
}
