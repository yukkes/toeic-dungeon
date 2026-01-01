// Main Game Controller

class Game {
    constructor() {
        this.currentScreen = 'title';
        this.playerPokemon = null;
        this.currentFloor = 1;
        this.party = [];
        this.dungeon = null;
        this.dungeonSeed = Date.now();
        this.battleManager = new BattleManager();
        this.saveManager = new SaveManager();

        // Stats
        this.stats = {
            totalBattles: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            badges: 0,
            potions: 1,
            balls: 0
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
        const potionBtn = document.getElementById('dungeon-potion-btn');
        if (potionBtn) potionBtn.addEventListener('click', () => this.usePotion());

        const partyBtn = document.getElementById('dungeon-party-btn');
        if (partyBtn) partyBtn.addEventListener('click', () => this.switchLeader());

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
        this.party = [this.playerPokemon];
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

        const playerSpriteCanvas = document.getElementById('dungeon-player-sprite');
        if (playerSpriteCanvas) {
            spriteLoader.drawToCanvas(playerSpriteCanvas, this.playerPokemon.id, true);
        }

        const hpEl = document.getElementById('dungeon-player-hp');
        const maxHpEl = document.getElementById('dungeon-player-max-hp');
        if (hpEl) hpEl.textContent = this.playerPokemon.hp;
        if (maxHpEl) maxHpEl.textContent = this.playerPokemon.maxHp;

        document.getElementById('floor-display').textContent = `${this.currentFloor}F`;
        document.getElementById('badge-count').textContent = this.stats.badges;
        document.getElementById('dungeon-potion-count').textContent = this.stats.potions;
        const ballCount = document.getElementById('dungeon-ball-count');
        if (ballCount) ballCount.textContent = this.stats.balls;

        const partyCount = document.getElementById('party-count');
        if (partyCount) partyCount.textContent = this.party.length;
    }

    switchLeader() {
        if (this.party.length <= 1) {
            this.showDungeonMessage("交代するポケモンがいません！");
            return;
        }

        // Rotate party
        const first = this.party.shift();
        this.party.push(first);
        this.playerPokemon = this.party[0];

        this.showDungeonMessage(`${this.playerPokemon.name}に交代した！`);
        this.updateDungeonUI();
        // Redraw dungeon to update sprite
        if (this.dungeon) this.dungeon.draw(document.getElementById('dungeon-canvas').getContext('2d'), 640, 480);
    }

    addToParty(pokemon) {
        if (this.party.length < 6) {
            this.party.push(pokemon);
            this.showDungeonMessage(`${pokemon.name}が仲間になった！`);
        } else {
            this.showDungeonMessage(`${pokemon.name}を捕まえたが、手持ちがいっぱいなので逃がした... (PC機能未実装)`);
        }
        this.updateDungeonUI();
    }

    usePotion() {
        if (this.stats.potions > 0) {
            if (this.playerPokemon.hp < this.playerPokemon.maxHp) {
                this.stats.potions--;
                const healAmount = Math.floor(this.playerPokemon.maxHp / 2);
                this.playerPokemon.heal(healAmount);
                this.updateDungeonUI();
                this.showDungeonMessage(`キズぐすりを つかった！ HPが${healAmount}かいふくした！`);
            } else {
                this.showDungeonMessage("HPは まんたんだ！");
            }
        } else {
            this.showDungeonMessage("キズぐすりを もっていない！");
        }
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
        } else if (result && result.type === 'item') {
            this.pickupItem(result.item);
        }

        this.autoSave();
    }

    pickupItem(item) {
        if (item.type === 'potion') {
            if (this.stats.potions < 3) {
                this.stats.potions++;
                this.showDungeonMessage("キズぐすりを拾った！");
                this.updateDungeonUI();
            } else {
                this.showDungeonMessage("持ち物がいっぱいで拾えない！");
            }
        } else if (item.type === 'ball') {
            if (this.stats.balls < 5) {
                this.stats.balls++;
                this.showDungeonMessage("モンスターボールを拾った！");
                this.updateDungeonUI();
            } else {
                this.showDungeonMessage("持ち物がいっぱいで拾えない！");
            }
        }
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
        this.party = [];
        this.playerPokemon = null;
        this.stats = {
            totalBattles: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            badges: 0,
            potions: 1,
            balls: 0
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

    showDungeonMessage(text) {
        const log = document.getElementById('dungeon-message-log');
        if (log) {
            log.textContent = text;
            log.style.display = 'block';

            // Clear previous timeout if exists
            if (this.messageTimeout) clearTimeout(this.messageTimeout);

            this.messageTimeout = setTimeout(() => {
                log.style.display = 'none';
            }, 3000);
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
