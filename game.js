// Main Game Controller

class Game {
    constructor() {
        this.currentScreen = 'title';
        this.playerPokemon = null;
        this.currentFloor = 1;
        this.dungeon = null;
        this.dungeonSeed = Date.now();
        this.battleManager = new BattleManager();
        this.saveManager = new SaveManager();

        // Stats
        this.stats = {
            totalBattles: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            badges: 0
        };

        // Make game globally accessible
        window.game = this;

        this.init();
    }

    init() {
        // Setup event listeners
        this.setupTitleScreen();
        this.setupStarterSelection();
        this.setupDungeonControls();
        this.setupResultScreens();

        // Check for existing save data
        if (this.saveManager.hasSaveData()) {
            document.getElementById('continue-btn').style.display = 'block';
        } else {
            document.getElementById('continue-btn').style.display = 'none';
        }
    }

    setupTitleScreen() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.saveManager.clearSave();
            this.showScreen('starter-screen');
            this.renderStarters();
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.loadGame();
        });
    }

    setupStarterSelection() {
        const starterCards = document.querySelectorAll('.starter-card');
        starterCards.forEach(card => {
            card.addEventListener('click', () => {
                const pokemonId = parseInt(card.dataset.id);
                this.selectStarter(pokemonId);
            });
        });
    }

    setupDungeonControls() {
        document.getElementById('move-up').addEventListener('click', () => this.movePlayer(0, -1));
        document.getElementById('move-down').addEventListener('click', () => this.movePlayer(0, 1));
        document.getElementById('move-left').addEventListener('click', () => this.movePlayer(-1, 0));
        document.getElementById('move-right').addEventListener('click', () => this.movePlayer(1, 0));

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen !== 'dungeon-screen') return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
            }
        });
    }

    setupResultScreens() {
        document.getElementById('return-title-btn').addEventListener('click', () => {
            this.returnToTitle();
        });

        document.getElementById('retry-btn').addEventListener('click', () => {
            this.returnToTitle();
        });
    }

    renderStarters() {
        // Draw starter sprites
        const starterIds = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle
        const starterSprites = document.querySelectorAll('.starter-sprite');

        starterSprites.forEach((canvas, index) => {
            spriteLoader.drawToCanvas(canvas, starterIds[index]);
        });
    }

    selectStarter(pokemonId) {
        this.playerPokemon = new Pokemon(pokemonId, 5);
        this.currentFloor = 1;
        this.dungeonSeed = Date.now();
        this.startDungeon();
    }

    startDungeon() {
        this.dungeon = new Dungeon(this.currentFloor, this.dungeonSeed);
        this.showScreen('dungeon-screen');
        this.updateDungeonUI();
        this.renderDungeon();
        this.autoSave();
    }

    updateDungeonUI() {
        document.getElementById('player-name').textContent = this.playerPokemon.name;
        document.getElementById('player-level').textContent = this.playerPokemon.level;
        document.getElementById('floor-display').textContent = `${this.currentFloor}F`;
        document.getElementById('badge-count').textContent = this.stats.badges;
    }

    renderDungeon() {
        const canvas = document.getElementById('dungeon-canvas');
        const ctx = canvas.getContext('2d');
        this.dungeon.draw(ctx, canvas.width, canvas.height);
    }

    movePlayer(dx, dy) {
        const result = this.dungeon.movePlayer(dx, dy);
        this.renderDungeon();

        if (result === 'encounter') {
            this.startEncounter();
        } else if (result === 'stairs') {
            this.nextFloor();
        }

        this.autoSave();
    }

    startEncounter() {
        const enemyId = getEnemyForFloor(this.currentFloor);
        const enemyLevel = getEnemyLevel(this.currentFloor);
        const enemyPokemon = new Pokemon(enemyId, enemyLevel);

        this.showScreen('battle-screen');
        this.battleManager.startBattle(this.playerPokemon, enemyPokemon, this.currentFloor);
    }

    endBattle(victory) {
        if (victory) {
            this.showScreen('dungeon-screen');
            this.updateDungeonUI();
            this.autoSave();
        }
    }

    nextFloor() {
        this.currentFloor++;

        // Check if this is a gym leader floor (every 10 floors)
        if (this.currentFloor % 10 === 0) {
            this.startGymBattle();
        } else {
            // Generate new dungeon
            this.dungeonSeed = Date.now();
            this.startDungeon();
        }
    }

    startGymBattle() {
        // Gym leader Pokemon (for now, use strong Pokemon)
        const gymLeaderPokemon = [95, 121, 26, 38, 65, 6, 9, 150]; // One for each gym
        const gymIndex = Math.floor(this.currentFloor / 10) - 1;

        if (gymIndex >= 8) {
            // Victory!
            this.victory();
            return;
        }

        const gymPokemonId = gymLeaderPokemon[gymIndex];
        const gymPokemon = new Pokemon(gymPokemonId, 25 + gymIndex * 5);

        this.showScreen('battle-screen');
        this.battleManager.startBattle(this.playerPokemon, gymPokemon, 10);

        // Mark as gym battle (could add special handling)
        this.isGymBattle = true;
    }

    victory() {
        this.showScreen('victory-screen');

        document.getElementById('defeated-gyms').textContent = Math.floor(this.currentFloor / 10);
        document.getElementById('total-badges').textContent = this.stats.badges;
        document.getElementById('total-battles').textContent = this.stats.totalBattles;

        const accuracy = this.stats.totalQuestions > 0
            ? Math.floor((this.stats.correctAnswers / this.stats.totalQuestions) * 100)
            : 0;
        document.getElementById('accuracy').textContent = accuracy;

        this.saveManager.clearSave();
    }

    gameOver() {
        this.showScreen('gameover-screen');

        document.getElementById('reached-floor').textContent = this.currentFloor;
        document.getElementById('go-total-battles').textContent = this.stats.totalBattles;

        const accuracy = this.stats.totalQuestions > 0
            ? Math.floor((this.stats.correctAnswers / this.stats.totalQuestions) * 100)
            : 0;
        document.getElementById('go-accuracy').textContent = accuracy;

        this.saveManager.clearSave();
    }

    returnToTitle() {
        this.currentFloor = 1;
        this.playerPokemon = null;
        this.stats = {
            totalBattles: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            badges: 0
        };

        this.showScreen('title-screen');

        // Update continue button visibility
        if (this.saveManager.hasSaveData()) {
            document.getElementById('continue-btn').style.display = 'block';
        } else {
            document.getElementById('continue-btn').style.display = 'none';
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    autoSave() {
        if (this.playerPokemon) {
            this.saveManager.save({
                playerPokemon: this.playerPokemon,
                currentFloor: this.currentFloor,
                dungeonSeed: this.dungeonSeed,
                stats: this.stats
            });
        }
    }

    loadGame() {
        const saveData = this.saveManager.load();

        if (saveData) {
            this.playerPokemon = saveData.playerPokemon;
            this.currentFloor = saveData.currentFloor;
            this.dungeonSeed = saveData.dungeonSeed;
            this.stats = saveData.stats;

            this.startDungeon();
        } else {
            alert('セーブデータの読み込みに失敗しました');
        }
    }
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
