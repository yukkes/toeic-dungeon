// Save Manager - sessionStorage persistence

class SaveManager {
    constructor() {
        this.saveKey = 'moemon_toeic_save';
    }

    save(gameState) {
        try {
            const saveData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                player: {
                    pokemonId: gameState.playerPokemon.id,
                    level: gameState.playerPokemon.level,
                    hp: gameState.playerPokemon.hp,
                    exp: gameState.playerPokemon.exp
                },
                dungeon: {
                    currentFloor: gameState.currentFloor,
                    seed: gameState.dungeonSeed
                },
                stats: {
                    totalBattles: gameState.stats.totalBattles,
                    correctAnswers: gameState.stats.correctAnswers,
                    totalQuestions: gameState.stats.totalQuestions,
                    badges: gameState.stats.badges
                }
            };

            sessionStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    load() {
        try {
            const saveDataStr = sessionStorage.getItem(this.saveKey);
            if (!saveDataStr) {
                return null;
            }

            const saveData = JSON.parse(saveDataStr);

            // Reconstruct game state
            return {
                playerPokemon: this.reconstructPokemon(saveData.player),
                currentFloor: saveData.dungeon.currentFloor,
                dungeonSeed: saveData.dungeon.seed,
                stats: saveData.stats
            };
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    reconstructPokemon(playerData) {
        const pokemon = new Pokemon(playerData.pokemonId, playerData.level);
        pokemon.hp = playerData.hp;
        pokemon.exp = playerData.exp;
        return pokemon;
    }

    hasSaveData() {
        return sessionStorage.getItem(this.saveKey) !== null;
    }

    clearSave() {
        sessionStorage.removeItem(this.saveKey);
    }
}
