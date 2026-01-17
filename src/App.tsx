
import { Component, Switch, Match, Show } from 'solid-js';
import { state } from './store';

import TitleScreen from './components/TitleScreen';
import StarterSelection from './components/StarterSelection';
import DungeonScreen from './components/DungeonScreen';
import BattleScreen from './components/BattleScreen';
import PartySelectScreen from './components/PartySelectScreen';
import GymProgressScreen from './components/GymProgressScreen';

const App: Component = () => {
  return (
    <div id="game-container">
      {/* Persistent Dungeon Screen */}
      <div style={{ display: state.screen === 'dungeon' ? 'block' : 'none', width: '100%', height: '100%' }}>
        <DungeonScreen />
      </div>

      {/* Other Screens */}
      <Switch fallback={<TitleScreen />}>
        <Match when={state.screen === 'title'}>
          <TitleScreen />
        </Match>
        <Match when={state.screen === 'starter'}>
          <StarterSelection />
        </Match>
        <Match when={state.screen === 'battle'}>
          <BattleScreen />
        </Match>
        <Match when={state.screen === 'party-select'}>
          <PartySelectScreen />
        </Match>
        <Match when={state.screen === 'gym-progress'}>
          <GymProgressScreen />
        </Match>
        <Match when={state.screen === 'result'}>
          <div class="screen" style={{ display: 'flex', "justify-content": 'center', "align-items": 'center', "flex-direction": 'column' }}>
            <h1>Result</h1>
            <button onClick={() => location.reload()}>Return to Title</button>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
