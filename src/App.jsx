import { useMemo, useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import FormationSelector, {
  FORMATION_KEYS,
  getFormationPositions,
  getPositionCounts,
} from './components/FormationSelector';
import TeamPanel from './components/TeamPanel';
import FootballField from './components/FootballField';
import PlayerCard from './components/PlayerCard';
import players from './data/players';
import './App.css';

const POSITION_TO_ROLE = {
  Portero: 'GK',
  Defensa: 'DEF',
  Mediocampista: 'MID',
  Delantero: 'FWD',
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [formation, setFormation] = useState(FORMATION_KEYS[0]);
  const [selectedSelection, setSelectedSelection] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [draftPlayer, setDraftPlayer] = useState(null);

  const availableSlots = useMemo(() => {
    const counts = getPositionCounts(formation);
    const used = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const item of selectedPlayers) {
      const role = POSITION_TO_ROLE[item.player.position];
      if (role) {
        used[role] += 1;
      }
    }
    return {
      GK: counts.GK - used.GK,
      DEF: counts.DEF - used.DEF,
      MID: counts.MID - used.MID,
      FWD: counts.FWD - used.FWD,
    };
  }, [formation, selectedPlayers]);

  const usedIndices = useMemo(
    () => new Set(selectedPlayers.map((item) => item.positionIndex)),
    [selectedPlayers]
  );

  function handleStartGame() {
    setGameStarted(true);
  }

  function handleGoHome() {
    setGameStarted(false);
    setFormation(FORMATION_KEYS[0]);
    setSelectedSelection(null);
    setSelectedPlayers([]);
    setDraftPlayer(null);
  }

  function handleDraftPlayer(player) {
    setDraftPlayer(player);
  }

  function handleCancelDraft() {
    setDraftPlayer(null);
  }

  function handlePlacePlayer(positionIndex) {
    if (!draftPlayer) return;
    const role = POSITION_TO_ROLE[draftPlayer.position];
    const positions = getFormationPositions(formation);
    const targetRole = positions[positionIndex];
    if (role !== targetRole) return;
    if (usedIndices.has(positionIndex)) return;

    setSelectedPlayers((current) => {
      const alreadySelected = current.find(
        (item) => item.player.id === draftPlayer.id
      );
      if (alreadySelected) return current;
      return [...current, { player: draftPlayer, positionIndex }];
    });
    setDraftPlayer(null);
  }

  function handleSelectionChange(selection) {
    setSelectedSelection(selection);
    setDraftPlayer(null);
  }

  function handleRemovePlayer(playerId) {
    setSelectedPlayers((current) =>
      current.filter((item) => item.player.id !== playerId)
    );
    if (draftPlayer && draftPlayer.id === playerId) {
      setDraftPlayer(null);
    }
  }

  return (
    <div className="app-layout">
      <Header
        gameStarted={gameStarted}
        onStartGame={handleStartGame}
        onGoHome={handleGoHome}
      />

      {!gameStarted ? (
        <HomePage />
      ) : (
        <div className="app-body game-body">
          <TeamPanel
            formation={formation}
            selectedPlayers={selectedPlayers}
            draftPlayer={draftPlayer}
            onDraftPlayer={handleDraftPlayer}
            onCancelDraft={handleCancelDraft}
            selectedSelection={selectedSelection}
            onSelectionChange={handleSelectionChange}
            availableSlots={availableSlots}
          />
          <div className="game-main">
            <div className="game-toolbar">
              <FormationSelector value={formation} onChange={setFormation} />
              <p className="team-progress">
                {selectedPlayers.length}/11 jugadores
              </p>
            </div>
            <main className="field-area">
              <FootballField
                formation={formation}
                players={selectedPlayers}
                draftPlayer={draftPlayer}
                onPlacePlayer={handlePlacePlayer}
                onRemovePlayer={handleRemovePlayer}
              />
            </main>
          </div>
          {draftPlayer && (
            <div className="draft-card-overlay">
              <PlayerCard player={draftPlayer} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
