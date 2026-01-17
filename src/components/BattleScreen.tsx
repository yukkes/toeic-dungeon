
import { Component, createEffect, createSignal, onMount, Show } from 'solid-js';
import { state, setState, saveManager, logBattle } from '../store';
import { spriteLoader } from '../utils/SpriteLoader';
import { calculateDamage, getEffectivenessMessage, isStatusMove } from '../game/BattleLogic';
import TOEIC_QUESTIONS_JSON from '../data/toeic-questions.json';

const TOEIC_QUESTIONS = TOEIC_QUESTIONS_JSON as any[];

const BattleScreen: Component = () => {
    const [phase, setPhase] = createSignal<'question' | 'move' | 'animating' | 'end'>('question');
    const [currentQuestion, setCurrentQuestion] = createSignal<any>(null);
    const [questionResult, setQuestionResult] = createSignal<'correct' | 'wrong' | null>(null);
    const [selectedChoice, setSelectedChoice] = createSignal<any>(null);

    // Initial Setup
    onMount(() => {
        // Prepare Question
        const q = getQuestionByFloor(state.currentFloor);
        setCurrentQuestion(q);
        setPhase('question');
        logBattle(`${state.battle.enemy?.name} が現れた！`);
    });

    const getQuestionByFloor = (floor: number) => {
        // Simplified level mapping
        let rangeStart = 100;
        let rangeEnd = 199;
        // Logic from toeic-questions.js (simplified for port)
        if (state.mode === 'gym') { rangeStart = 700; rangeEnd = 799; } // Quota for Gym? Original game uses floor/level logic. Let's use high.
        else if (floor <= 2) { rangeStart = 100; rangeEnd = 199; }
        else if (floor <= 4) { rangeStart = 200; rangeEnd = 299; }
        else if (floor <= 6) { rangeStart = 300; rangeEnd = 399; }
        else if (floor <= 8) { rangeStart = 400; rangeEnd = 499; }
        else if (floor <= 9) { rangeStart = 600; rangeEnd = 699; }
        else { rangeStart = 700; rangeEnd = 799; }

        const pool = TOEIC_QUESTIONS.filter(q => q.id >= rangeStart && q.id <= rangeEnd);
        if (pool.length === 0) return TOEIC_QUESTIONS[0]; // Fallback
        return pool[Math.floor(Math.random() * pool.length)];
    };

    const handleAnswer = (choice: any) => {
        if (phase() !== 'question') return;

        setSelectedChoice(choice);
        if (choice.correct) {
            setQuestionResult('correct');
            logBattle("正解！最も威力の高い技で攻撃！");
            setTimeout(() => {
                performPlayerTurn(true);
            }, 1000);
        } else {
            setQuestionResult('wrong');
            logBattle("不正解... 補助技しか出せない！");
            setTimeout(() => {
                performPlayerTurn(false);
            }, 1000);
        }
        setPhase('animating');
    };

    const performPlayerTurn = (allowedAttack: boolean) => {
        if (!state.player || !state.battle.enemy) return;
        // Select Move Logic
        let moveName = "たいあたり";

        if (allowedAttack) {
            let maxDmg = -1;
            state.player.moves.forEach(m => {
                const res = calculateDamage(state.player!, state.battle.enemy!, m);
                if (res.damage > maxDmg) {
                    maxDmg = res.damage;
                    moveName = m;
                }
            });
            executeMove(state.player, state.battle.enemy, moveName, true);
        } else {
            const statusMoves = state.player.moves.filter(m => isStatusMove(m));
            if (statusMoves.length > 0) {
                moveName = statusMoves[Math.floor(Math.random() * statusMoves.length)];
                executeMove(state.player, state.battle.enemy, moveName, true);
            } else {
                logBattle("しかし、繰り出せる技がない！");
                setTimeout(() => performEnemyTurn(), 1000);
            }
        }
    };

    const executeMove = (attacker: any, defender: any, moveName: string, isPlayer: boolean) => {
        logBattle(`${attacker.name} の ${moveName}！`);

        // Visual shake
        const targetId = isPlayer ? 'enemy-sprite' : 'player-sprite';
        const canvas = document.getElementById(targetId) as HTMLCanvasElement;
        if (canvas) spriteLoader.animateShake(canvas, defender.id);

        setTimeout(() => {
            const res = calculateDamage(attacker, defender, moveName);

            // Apply Damage
            const newHp = Math.max(0, defender.hp - res.damage);
            const fainted = newHp === 0;

            // Update HP with reactive approach - create new instance to trigger reactivity
            if (isPlayer) {
                // Player attacking Enemy -> Update Enemy HP
                setState('battle', 'enemy', (enemy) => {
                    if (!enemy) return enemy;
                    // Create new instance with same prototype to preserve Pokemon class methods
                    const updated = Object.create(Object.getPrototypeOf(enemy));
                    Object.assign(updated, enemy);
                    updated.hp = newHp;
                    return updated;
                });
            } else {
                // Enemy attacking Player -> Update Player HP
                setState('player', (player) => {
                    if (!player) return player;
                    // Create new instance with same prototype to preserve Pokemon class methods
                    const updated = Object.create(Object.getPrototypeOf(player));
                    Object.assign(updated, player);
                    updated.hp = newHp;
                    return updated;
                });
            }

            let msg = "";
            if (res.critical) msg += "急所にあたった！ ";
            msg += getEffectivenessMessage(res.effectiveness);
            if (msg) logBattle(msg);

            if (fainted) {
                // isPlayer indicates the attacker, but handleFaint needs to know if the LOSER is the player
                // If player attacked (isPlayer=true), enemy fainted (isPlayerLoser=false)
                // If enemy attacked (isPlayer=false), player fainted (isPlayerLoser=true)
                setTimeout(() => handleFaint(defender, !isPlayer), 1000);
            } else {
                if (isPlayer) {
                    setTimeout(() => performEnemyTurn(), 1000);
                } else {
                    setTimeout(() => {
                        const q = getQuestionByFloor(state.currentFloor);
                        setCurrentQuestion(q);
                        setPhase('question');
                        setQuestionResult(null);
                        setSelectedChoice(null);
                        logBattle("どうする？");
                    }, 1000);
                }
            }
        }, 800);
    };

    const performEnemyTurn = () => {
        if (!state.battle.enemy || !state.player) return;

        // 敵は常に最大ダメージの技を選択
        let maxDmg = -1;
        let moveName = state.battle.enemy.moves[0]; // デフォルト

        state.battle.enemy.moves.forEach(m => {
            const res = calculateDamage(state.battle.enemy!, state.player!, m);
            if (res.damage > maxDmg) {
                maxDmg = res.damage;
                moveName = m;
            }
        });

        executeMove(state.battle.enemy, state.player, moveName, false);
    };

    const handleFaint = (loser: any, isPlayerLoser: boolean) => {
        if (isPlayerLoser) {
            logBattle(`${loser.name} は倒れた...`);

            if (state.mode === 'gym') {
                // Determine if we have other pokemon
                // current player is state.player. 
                // We need to find next in state.party
                const currentIdx = state.party.findIndex(p => p === state.player);
                if (currentIdx >= 0 && currentIdx < state.party.length - 1) {
                    const nextP = state.party[currentIdx + 1];
                    logBattle(`いけ！ ${nextP.name}！`);
                    setTimeout(() => {
                        setState('player', nextP);
                        // Continue battle
                        setPhase('question');
                        setQuestionResult(null);
                    }, 2000);
                    return;
                }
            }

            setTimeout(() => {
                alert("ゲームオーバー...");
                setState({ screen: 'title', mode: 'training', battle: { ...state.battle, active: false } });
            }, 1000);
        } else {
            logBattle(`${loser.name} を倒した！`);
            const exp = Math.floor(loser.baseStats.hp * loser.level / 7) * 5;
            logBattle(`${exp} の経験値獲得！`);

            // Update player with exp gain using reactive approach
            setState('player', (player) => {
                if (!player) return player;
                const updated = Object.create(Object.getPrototypeOf(player));
                Object.assign(updated, player);
                updated.gainExp(exp);
                return updated;
            });

            setTimeout(() => {
                if (state.mode === 'gym') {
                    // Check if leader has more pokemon
                    setState('battle', 'gymTeamIndex', (i: any) => (i || 0) + 1);
                    // Return to Gym Progress to Load next pokemon or finish
                    setState('screen', 'gym-progress');
                } else {
                    setState('battle', 'active', false);
                    setState('screen', 'dungeon');
                }
            }, 2000);
        }
    };

    const handleUseBall = () => {
        if (state.mode === 'gym') {
            logBattle("トレーナー戦では使えない！");
            return;
        }
        // Boss check
        if (state.battle.enemy?.id && state.battle.enemy.id >= 153) { // Rough check or use flag
            logBattle("捕まえられない！");
            return;
        }

        if (state.items.balls <= 0) {
            logBattle("ボールがない！");
            return;
        }
        if (phase() !== 'question') return;

        setState('items', 'balls', b => b - 1);
        logBattle("モンスターボールを投げた！");
        setPhase('animating');

        setTimeout(() => {
            if (Math.random() < 0.8) {
                logBattle(`${state.battle.enemy?.name} を捕まえた！`);
                saveManager.saveToBox(state.battle.enemy!);
                setTimeout(() => {
                    setState('battle', 'active', false);
                    setState('screen', 'dungeon');
                }, 1500);
            } else {
                logBattle("ああっ！ ポケモンが飛び出してきた！");
                setTimeout(() => performEnemyTurn(), 1000);
            }
        }, 1000);
    };

    // Commands
    const handleRun = () => {
        if (state.mode === 'gym') {
            logBattle("逃げられない！");
            return;
        }
        if (phase() !== 'question') return;
        logBattle("逃げ出した！");
        setTimeout(() => {
            setState('battle', 'active', false);
            setState('screen', 'dungeon');
        }, 1000);
    };

    const handleUsePotion = () => {
        if (state.mode === 'gym') {
            logBattle("トレーナー戦では使えない！"); // Or allowed? Original allowed? Assuming no for challenge.
            return;
        }
        if (state.items.potions <= 0) {
            logBattle("傷薬がない！");
            return;
        }
        if (!state.player) return;
        if (state.player.hp >= state.player.maxHp) {
            logBattle("HPは満タンだ！");
            return;
        }

        if (phase() !== 'question') return;

        setState('items', 'potions', p => p - 1);
        const healAmount = Math.floor(state.player.maxHp / 2);
        const newHp = Math.min(state.player.maxHp, state.player.hp + healAmount);

        // Update HP with reactive approach
        setState('player', (player) => {
            if (!player) return player;
            const updated = Object.create(Object.getPrototypeOf(player));
            Object.assign(updated, player);
            updated.hp = newHp;
            return updated;
        });

        logBattle("傷薬を使った！ HPが回復した！");

        // Use up turn?
        setPhase('animating');
        setTimeout(() => performEnemyTurn(), 1000);
    };

    return (
        <div class="screen battle-screen active">
            <div class="battle-scene">
                {/* Enemy */}
                <div class="enemy-area">
                    <div class="stat-box">
                        <div class="name-line">{state.battle.enemy?.name} <small>Lv.{state.battle.enemy?.level}</small></div>
                        <div class="hp-bar">
                            <div class="fill" style={{ width: `${(state.battle.enemy?.hp || 0) / (state.battle.enemy?.maxHp || 1) * 100}%` }}></div>
                        </div>
                    </div>
                    <div class="sprite-area">
                        <CanvasSprite id={state.battle.enemy?.id || 1} domId="enemy-sprite" size={128} />
                    </div>
                </div>

                {/* Player */}
                <div class="player-area">
                    <div class="sprite-area">
                        <CanvasSprite id={state.player?.id || 1} domId="player-sprite" />
                    </div>
                    <div class="stat-box">
                        <div class="name-line">{state.player?.name} <small>Lv.{state.player?.level}</small></div>
                        <div class="hp-bar">
                            <div class="fill" style={{ width: `${(state.player?.hp || 0) / (state.player?.maxHp || 1) * 100}%` }}></div>
                        </div>
                        <div class="hp-text">{state.player?.hp} / {state.player?.maxHp}</div>
                        <div class="exp-bar">
                            <div class="fill" style={{ width: `${state.player ? (state.player.exp / state.player.expToNext * 100) : 0}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="battle-ui">
                <div class="ui-top-row">
                    <div class="message-box">
                        {state.battle.message}
                    </div>
                    <div class="command-box" style={{ gap: "4px" }}>
                        <div style={{ display: "flex", gap: "4px", flex: "1" }}>
                            <button class="cmd-btn" onClick={handleUsePotion} style={{ flex: "1", display: "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center", "font-size": "10px", "line-height": "1.2" }}>
                                <span style={{ "font-size": "18px" }}>💊</span>
                                <span>傷薬</span>
                            </button>
                            <button class="cmd-btn" onClick={handleUseBall} disabled={state.mode === 'gym'} style={{ flex: "1", display: "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center", "font-size": "10px", "line-height": "1.2" }}>
                                <span style={{ "font-size": "18px" }}>🔴</span>
                                <span>ボール</span>
                            </button>
                        </div>
                        <button class="cmd-btn" onClick={handleRun} disabled={state.mode === 'gym'} style={{ height: "30px" }}>
                            逃げる
                        </button>
                    </div>
                </div>

                <div class="action-menu">
                    <Show when={currentQuestion()} fallback={<div></div>}>
                        <div class="question-area">
                            <div id="question-text" class="q-text">{currentQuestion().question}</div>
                            <div class="choices-grid">
                                {currentQuestion().choices.map((c: any) => (
                                    <button
                                        class={`choice-btn ${selectedChoice() === c ? (questionResult() === 'correct' ? 'correct' : 'wrong') : ''}`}
                                        onClick={() => handleAnswer(c)}
                                    >
                                        {c.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

const CanvasSprite: Component<{ id: number, domId: string, size?: number }> = (props) => {
    let canvasRef: HTMLCanvasElement | undefined;
    createEffect(() => {
        if (canvasRef) {
            spriteLoader.drawToCanvas(canvasRef, props.id);
        }
    });
    const canvasSize = props.size || 160;
    return <canvas id={props.domId} ref={canvasRef} width={canvasSize} height={canvasSize} />;
};

export default BattleScreen;
