// Battle System

class BattleManager {
    constructor() {
        this.playerPokemon = null;
        this.enemyPokemon = null;
        this.currentQuestion = null;
        this.isPlayerTurn = true;
        this.battleActive = false;
    }

    startBattle(playerPokemon, enemyPokemon, floor) {
        this.playerPokemon = playerPokemon;
        this.enemyPokemon = enemyPokemon;
        this.isPlayerTurn = true;
        this.battleActive = true;

        // Get question based on floor
        const questionLevel = getQuestionLevelForFloor(floor);
        this.currentQuestion = getQuestionByLevel(questionLevel);

        // Update UI
        this.updateBattleUI();
        this.showMessage(`野生の${this.enemyPokemon.name}が現れた！`);

        // Draw sprites
        setTimeout(() => {
            spriteLoader.drawToCanvas(
                document.getElementById('player-sprite'),
                this.playerPokemon.id
            );
            spriteLoader.drawToCanvas(
                document.getElementById('enemy-sprite'),
                this.enemyPokemon.id
            );

            // Show question after a delay
            setTimeout(() => {
                this.displayQuestion();
            }, 1000);
        }, 100);
    }

    updateBattleUI() {
        // Player stats
        document.getElementById('battle-player-name').textContent = this.playerPokemon.name;
        document.getElementById('battle-player-level').textContent = this.playerPokemon.level;
        document.getElementById('player-hp').textContent = this.playerPokemon.hp;
        document.getElementById('player-max-hp').textContent = this.playerPokemon.maxHp;

        const playerHpPercent = (this.playerPokemon.hp / this.playerPokemon.maxHp) * 100;
        const playerHpFill = document.getElementById('player-hp-fill');
        playerHpFill.style.width = playerHpPercent + '%';

        // Update HP bar color
        if (playerHpPercent > 50) {
            playerHpFill.className = 'hp-fill';
        } else if (playerHpPercent > 25) {
            playerHpFill.className = 'hp-fill medium';
        } else {
            playerHpFill.className = 'hp-fill low';
        }

        // Experience bar
        const expPercent = (this.playerPokemon.exp / this.playerPokemon.expToNext) * 100;
        document.getElementById('player-exp-fill').style.width = expPercent + '%';

        // Enemy stats
        document.getElementById('enemy-name').textContent = this.enemyPokemon.name;
        document.getElementById('enemy-level').textContent = this.enemyPokemon.level;
        document.getElementById('enemy-hp').textContent = this.enemyPokemon.hp;
        document.getElementById('enemy-max-hp').textContent = this.enemyPokemon.maxHp;

        const enemyHpPercent = (this.enemyPokemon.hp / this.enemyPokemon.maxHp) * 100;
        const enemyHpFill = document.getElementById('enemy-hp-fill');
        enemyHpFill.style.width = enemyHpPercent + '%';

        // Update HP bar color
        if (enemyHpPercent > 50) {
            enemyHpFill.className = 'hp-fill';
        } else if (enemyHpPercent > 25) {
            enemyHpFill.className = 'hp-fill medium';
        } else {
            enemyHpFill.className = 'hp-fill low';
        }
    }

    displayQuestion() {
        if (!this.currentQuestion) return;

        document.getElementById('question-text').textContent = this.currentQuestion.question;

        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';

        this.currentQuestion.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn pixel-btn';
            button.dataset.index = index;

            const label = document.createElement('span');
            label.className = 'choice-label';
            label.textContent = String.fromCharCode(65 + index); // A, B, C, D

            const text = document.createElement('span');
            text.className = 'choice-text';
            text.textContent = choice.text;

            const moveInfo = document.createElement('span');
            moveInfo.className = 'move-info';
            moveInfo.textContent = choice.move;

            button.appendChild(label);
            button.appendChild(text);
            button.appendChild(moveInfo);

            button.addEventListener('click', () => this.handleChoice(index));

            choicesContainer.appendChild(button);
        });
    }

    handleChoice(choiceIndex) {
        const choice = this.currentQuestion.choices[choiceIndex];
        const buttons = document.querySelectorAll('.choice-btn');

        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);

        // Mark correct/incorrect
        buttons[choiceIndex].classList.add(choice.correct ? 'correct' : 'incorrect');

        // Show correct answer if wrong
        if (!choice.correct) {
            const correctIndex = this.currentQuestion.choices.findIndex(c => c.correct);
            if (correctIndex >= 0) {
                buttons[correctIndex].classList.add('correct');
            }
        }

        // Execute turn after a delay
        setTimeout(() => {
            if (choice.correct) {
                this.executePlayerAttack(choice.move);
            } else {
                this.showMessage(`${choice.move}は失敗した！`);
                // Track stats
                if (window.game) {
                    window.game.stats.totalQuestions++;
                }
                // Enemy turn
                setTimeout(() => {
                    this.executeEnemyTurn();
                }, 1500);
            }
        }, 1500);
    }

    executePlayerAttack(moveName) {
        const result = calculateDamage(this.playerPokemon, this.enemyPokemon, moveName);

        this.showMessage(`${this.playerPokemon.name}の${moveName}！`);

        // Animate player sprite
        spriteLoader.animateShake(document.getElementById('enemy-sprite'), this.enemyPokemon.id);

        setTimeout(() => {
            const defeated = this.enemyPokemon.takeDamage(result.damage);

            let message = `${result.damage}のダメージ！ `;
            message += getEffectivenessMessage(result.effectiveness);

            this.showMessage(message);
            this.updateBattleUI();

            // Track stats
            if (window.game) {
                window.game.stats.totalQuestions++;
                window.game.stats.correctAnswers++;
            }

            if (defeated) {
                setTimeout(() => {
                    this.handleVictory();
                }, 1500);
            } else {
                setTimeout(() => {
                    this.executeEnemyTurn();
                }, 1500);
            }
        }, 800);
    }

    executeEnemyTurn() {
        // AI picks random move (simplified)
        const moves = ["たいあたり", "ひっかく", "はたく"];
        const moveName = moves[Math.floor(Math.random() * moves.length)];

        const result = calculateDamage(this.enemyPokemon, this.playerPokemon, moveName);

        this.showMessage(`${this.enemyPokemon.name}の${moveName}！`);

        // Animate enemy sprite
        spriteLoader.animateShake(document.getElementById('player-sprite'), this.playerPokemon.id);

        setTimeout(() => {
            const defeated = this.playerPokemon.takeDamage(result.damage);

            let message = `${result.damage}のダメージ！ `;
            message += getEffectivenessMessage(result.effectiveness);

            this.showMessage(message);
            this.updateBattleUI();

            if (defeated) {
                setTimeout(() => {
                    this.handleDefeat();
                }, 1500);
            } else {
                setTimeout(() => {
                    // New question for next turn
                    const questionLevel = getQuestionLevelForFloor(window.game ? window.game.currentFloor : 1);
                    this.currentQuestion = getQuestionByLevel(questionLevel);
                    this.displayQuestion();
                }, 1500);
            }
        }, 800);
    }

    handleVictory() {
        this.battleActive = false;

        // Calculate exp
        const expGained = Math.floor(this.enemyPokemon.level * 50 * 1.5);
        this.playerPokemon.gainExp(expGained);

        this.showMessage(`${this.enemyPokemon.name}を倒した！ ${expGained}の経験値を獲得！`);

        // Track stats
        if (window.game) {
            window.game.stats.totalBattles++;
        }

        // Check for level up
        setTimeout(() => {
            this.updateBattleUI();

            setTimeout(() => {
                if (window.game) {
                    window.game.endBattle(true);
                }
            }, 2000);
        }, 1500);
    }

    handleDefeat() {
        this.battleActive = false;
        this.showMessage(`${this.playerPokemon.name}は倒れた...`);

        setTimeout(() => {
            if (window.game) {
                window.game.gameOver();
            }
        }, 2000);
    }

    showMessage(message) {
        document.getElementById('message-log').textContent = message;
    }
}
