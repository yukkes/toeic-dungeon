
import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { state, setState, saveManager } from '../store';
import { Pokemon } from '../game/Pokemon';
import POKEMON_DATA_JSON from '../data/pokemon.json';
import { PokemonDef } from '../types';
import { spriteLoader } from '../utils/SpriteLoader';

const POKEMON_DATA: Record<string, PokemonDef> = POKEMON_DATA_JSON as any;

const PartySelectScreen: Component = () => {
    const [box, setBox] = createSignal<any[]>([]);
    const [party, setParty] = createSignal<Pokemon[]>([]);

    // UI Selection
    const [selectedBoxIndex, setSelectedBoxIndex] = createSignal<number | null>(null);

    onMount(() => {
        const b = saveManager.getBox();
        setBox(b);

        // If explicitly in Gym mode, handle differently if needed, 
        // but for "Menu" from Dungeon, we should show current Party.
        if (state.mode === 'training' && state.party.length > 0) {
            setParty(state.party);
        } else {
            // Gym or fresh start
            setParty([]);
        }
    });

    // Swap Logic
    const [swapIndex, setSwapIndex] = createSignal<number | null>(null);

    const handleSlotClick = (index: number) => {
        if (state.mode === 'gym') {
            // Remove functionality
            removeFromParty(index);
            return;
        }

        // Training Mode: Swap
        if (swapIndex() === null) {
            setSwapIndex(index);
        } else {
            // Swap
            if (swapIndex() !== index) {
                const newParty = [...party()];
                const temp = newParty[swapIndex()!];
                newParty[swapIndex()!] = newParty[index];
                newParty[index] = temp;
                setParty(newParty);
                // Sync to global state immediately if in dungeon mode
                setState('party', newParty);
                setState('player', newParty[0]); // Lead change
            }
            setSwapIndex(null);
        }
    };


    const addToParty = () => {
        const idx = selectedBoxIndex();
        if (idx === null) return;

        if (party().length >= 6) {
            alert("手持ちはいっぱいです");
            return;
        }

        const pData = box()[idx];
        // Check if already in party (by unique ID? generated timestamp? or just allow duplicates?)
        // Original game filter logic: "removeFromParty" removed by index. "moveToParty" removed from box view?
        // Let's simplified: Add clone to party.

        const p = new Pokemon(pData.id, pData.level);
        // Be sure to sync moves and validation
        if (pData.moves) p.moves = pData.moves;

        setParty([...party(), p]);

        // Remove from box visual or keep? Original: "moveToParty(boxIdx)" implies moving.
        // We will just visually disable or remove. Removing is clearer.
        const newBox = [...box()];
        newBox.splice(idx, 1);
        setBox(newBox);
        setSelectedBoxIndex(null);
    };

    const removeFromParty = (index: number) => {
        const p = party()[index];
        const newParty = party().filter((_, i) => i !== index);
        setParty(newParty);

        // Add back to box (re-hydrate data structure)
        // We need to restore it to box list so player can re-select if they changed mind.
        setBox([...box(), {
            id: p.id,
            level: p.level,
            moves: p.moves,
            baseStats: p.baseStats,
            name: p.name
        }]);
    };

    const startChallenge = () => {
        if (party().length === 0) {
            alert("ポケモンを選んでください");
            return;
        }

        // Set State
        setState({
            mode: 'gym',
            screen: 'gym-progress', // Go to Gym Setup/Progress
            player: party()[0], // Leader
            party: party(),
            battle: {
                active: false,
                gymStage: 0, // Start at Gym 1
                enemy: null,
                message: "",
                question: null,
                log: []
            }
        });
    };

    return (
        <div class="screen party-select-screen active">
            <h2 class="screen-title">ジム挑戦メンバー選択</h2>

            <div class="party-layout">
                <div class="party-section">
                    <h3>手持ち ({party().length}/6)</h3>
                    <div class="party-list">
                        <For each={party()}>
                            {(p, i) => (
                                <div class={`party-slot ${swapIndex() === i() ? 'selected' : ''}`} onClick={() => handleSlotClick(i())}>
                                    <SpritePreview id={p.id} />
                                    <div class="info" style={{ "margin-left": "10px" }}>
                                        <div class="name">{p.name}</div>
                                        <div class="level">Lv.{p.level}</div>
                                    </div>
                                    <div class="remove-hint" style={{ "margin-left": "auto" }}>x</div>
                                </div>
                            )}
                        </For>
                        {/* Empty Slots */}
                        <For each={Array(6 - party().length).fill(0)}>
                            {() => <div class="party-slot empty" style={{ "justify-content": "center", color: "#888" }}>Empty</div>}
                        </For>
                    </div>
                </div>

                <div class="box-section">
                    <h3>ボックス</h3>
                    <Show when={box().length === 0}>
                        <div style={{ padding: "20px", "text-align": "center", color: "#aaa", "font-size": "12px" }}>
                            ポケモンがいません。<br />
                            特訓モードで捕まえてください。<br />
                            No Pokemon found.
                        </div>
                    </Show>
                    <div class="box-grid">
                        <For each={box()}>
                            {(p, i) => (
                                <div
                                    class={`box-slot ${selectedBoxIndex() === i() ? 'selected' : ''}`}
                                    onClick={() => setSelectedBoxIndex(i())}
                                >
                                    <SpritePreview id={p.id} />
                                    <span class="level" style={{ "font-size": "8px" }}>Lv.{p.level}</span>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </div>

            <div class="actions" style={{ padding: "10px", display: "flex", gap: "10px", "justify-content": "center" }}>
                <Show when={state.mode === 'gym'}>
                    <button class="pixel-btn" onClick={() => setState('screen', 'title')}>
                        戻る
                    </button>
                    <button class="pixel-btn" onClick={addToParty} disabled={selectedBoxIndex() === null || party().length >= 6}>
                        ↓ 加える
                    </button>
                    <button class="pixel-btn action-btn" onClick={startChallenge} disabled={party().length === 0}>
                        挑戦開始！
                    </button>
                </Show>
                <Show when={state.mode === 'training'}>
                    <button class="pixel-btn back-btn" onClick={() => setState('screen', 'dungeon')}>
                        戻る
                    </button>
                </Show>
            </div>
        </div>
    );
};

const SpritePreview: Component<{ id: number }> = (props) => {
    let canvasRef: HTMLCanvasElement | undefined;
    onMount(() => {
        if (canvasRef) spriteLoader.drawToCanvas(canvasRef, props.id);
    });
    return <canvas ref={canvasRef} width="64" height="64" />;
};

export default PartySelectScreen;
