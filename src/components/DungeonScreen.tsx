
import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import { state, setState, saveManager } from '../store';
import { Dungeon, DungeonCallbacks } from '../game/Dungeon';
import { Pokemon } from '../game/Pokemon';
import { spriteLoader } from '../utils/SpriteLoader';

const DungeonScreen: Component = () => {
    let canvasRef: HTMLCanvasElement | undefined;
    let dungeonInstance: Dungeon | null = null;
    let moveInterval: any = null;

    const callbacks: DungeonCallbacks = {
        onBattle: (enemy: Pokemon, originalEntity: any) => {
            setState('battle', {
                active: true,
                enemy: enemy,
                message: `あ！ 野生の ${enemy.name} が飛び出してきた！`,
                log: []
            });
            setState('screen', 'battle');
            // Stop movement loop if active
            stopMovement();
        },
        onClear: () => {
            // Next Floor logic
            const nextFloor = state.currentFloor + 1;
            if (state.mode === 'training' && nextFloor > 9) {
                alert("ダンジョン制覇！おめでとう！");
                // Save to box logic could be here or triggered via Result Screen
                // For now back to title or result
                setState({ screen: 'result' }); // We need a result screen
            } else {
                setState({ currentFloor: nextFloor });
                saveManager.saveRun(state);
                // Re-init dungeon
                initDungeon();
            }
        },
        onItem: (type) => {
            if (type === 'potion') {
                if (state.items.potions < state.items.maxPotions) {
                    setState('items', 'potions', p => p + 1);
                }
            } else {
                if (state.items.balls < state.items.maxBalls) {
                    setState('items', 'balls', b => b + 1);
                }
            }
        },
        canMove: () => {
            return state.screen === 'dungeon' && !state.battle.active;
        },
        getPlayerLevel: () => {
            return state.player ? state.player.level : 5;
        },
        onMessage: (msg) => {
            console.log(msg); // TODO: UI Log
        }
    };

    // Re-init or Restore
    createEffect(() => {
        if (state.screen === 'dungeon') {
            if (!dungeonInstance || dungeonInstance.floor !== state.currentFloor) {
                initDungeon();
            } else if (state.battle.active === false) {
                // Just returning from battle, instance exists
                dungeonInstance.resumeFromBattle(state.battle.enemy?.hp === 0);
                dungeonInstance.render();
            }
        } else {
            // Leaving dungeon screen
            stopMovement();
            for (const k in keysPressed) delete keysPressed[k];
        }
    });

    const initDungeon = () => {
        if (!canvasRef) return;
        // Stop movement and clear keys to prevent stuck inputs on floor transition
        stopMovement();
        for (const k in keysPressed) delete keysPressed[k];

        dungeonInstance = new Dungeon(state.currentFloor, canvasRef, callbacks);
        if (state.player) {
            setState('player', 'hp', state.player.maxHp);
        }
    };

    onMount(() => {
        // initDungeon handled by effect
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    });

    onCleanup(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        stopMovement();
    });

    // Movement Logic
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
        if (state.screen !== 'dungeon') return;
        keysPressed[e.key] = true;
        if (!moveInterval) {
            processMovement();
            moveInterval = setInterval(processMovement, 150); // Speed
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed[e.key] = false;
        if (!Object.values(keysPressed).some(v => v)) {
            stopMovement();
        }
    };

    const stopMovement = () => {
        if (moveInterval) {
            clearInterval(moveInterval);
            moveInterval = null;
        }
    };

    const processMovement = () => {
        if (!dungeonInstance) return;
        let dx = 0;
        let dy = 0;
        if (keysPressed['ArrowUp'] || keysPressed['w']) dy = -1;
        else if (keysPressed['ArrowDown'] || keysPressed['s']) dy = 1;
        else if (keysPressed['ArrowLeft'] || keysPressed['a']) dx = -1;
        else if (keysPressed['ArrowRight'] || keysPressed['d']) dx = 1;

        if (dx !== 0 || dy !== 0) {
            dungeonInstance.movePlayer(dx, dy);
        }
    };

    const usePotion = () => {
        if (state.items.potions > 0 && state.player) {
            const healAmount = Math.floor(state.player.maxHp / 2);
            setState('items', 'potions', p => p - 1);
            setState('player', (player) => {
                if (!player) return player;
                const updated = Object.create(Object.getPrototypeOf(player));
                Object.assign(updated, player);
                updated.hp = Math.min(updated.maxHp, updated.hp + healAmount);
                return updated;
            });
            alert("傷薬を使った！");
        }
    };

    return (
        <div id="dungeon-screen" classList={{ screen: true, active: state.screen === 'dungeon' }}>
            <div class="status-bar">
                <div class="player-status">
                    <div class="mini-sprite">
                        <CanvasMini id={state.player?.id || 1} />
                    </div>
                    <div style={{ "margin-left": "5px" }}>
                        <div style={{ color: "white", "font-size": "12px", "font-weight": "bold" }}>{state.player?.name} Lv.{state.player?.level}</div>
                        <div class="hp-bar-sm" style={{ "margin-top": "5px", "height": "10px" }}>
                            <div class="fill" style={{ width: `${(state.player?.hp || 1) / (state.player?.maxHp || 1) * 100}%` }}></div>
                        </div>
                        <div style={{ color: "#fff", "font-size": "10px", "margin-top": "2px", "font-family": "'Press Start 2P'" }}>HP: {state.player?.hp}/{state.player?.maxHp}</div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                    <button class="pixel-btn sm" onClick={usePotion} style={{ padding: "5px" }}>
                        💊 {state.items.potions}
                    </button>
                    <button class="pixel-btn sm menu-btn" onClick={() => setState('screen', 'party-select')} style={{ padding: "5px", "margin-right": "8px" }}>
                        Menu
                    </button>
                </div>

                <div class="floor-info" style={{ color: "var(--accent)", "font-family": "'Press Start 2P'" }}>B{state.currentFloor}F</div>
            </div>

            <canvas ref={canvasRef} id="dungeon-canvas"></canvas>

            <div class="controls-pad">
                <div class="dpad" style={{ display: "grid", "grid-template-columns": "repeat(3, 1fr)", gap: "5px" }}>
                    <div></div>
                    <button class="pad-btn up" onMouseDown={() => dungeonInstance?.movePlayer(0, -1)}>▲</button>
                    <div></div>
                    <button class="pad-btn left" onMouseDown={() => dungeonInstance?.movePlayer(-1, 0)}>◀</button>
                    <div></div>
                    <button class="pad-btn right" onMouseDown={() => dungeonInstance?.movePlayer(1, 0)}>▶</button>
                    <div></div>
                    <button class="pad-btn down" onMouseDown={() => dungeonInstance?.movePlayer(0, 1)}>▼</button>
                    <div></div>
                </div>
            </div>
        </div>
    );
};

const CanvasMini: Component<{ id: number }> = (props) => {
    let canvasRef: HTMLCanvasElement | undefined;
    createEffect(() => {
        if (canvasRef) spriteLoader.drawToCanvas(canvasRef, props.id);
    });
    return <canvas ref={canvasRef} width="48" height="48" style={{ width: "100%", height: "100%" }} />;
};

export default DungeonScreen;
