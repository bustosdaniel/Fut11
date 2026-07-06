import { useEffect, useMemo, useState } from 'react';
import { getFormationPositions } from './FormationSelector';
import players from '../data/players';
import './TeamPanel.css';

const POSITION_TO_ROLE = {
  Portero: 'GK',
  Defensa: 'DEF',
  Mediocampista: 'MID',
  Delantero: 'FWD',
};

const ROLE_LABELS = {
  GK: 'Portero',
  DEF: 'Defensa',
  MID: 'Mediocampista',
  FWD: 'Delantero',
};

function getUniqueSelections() {
  const map = new Map();
  for (const player of players) {
    const key = `${player.country}|${player.year}`;
    if (!map.has(key)) {
      map.set(key, { country: player.country, year: player.year });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.country !== b.country) {
      return a.country.localeCompare(b.country);
    }
    return a.year - b.year;
  });
}

function getPlayersBySelection(selection) {
  if (!selection) return [];
  return players.filter(
    (player) =>
      player.country === selection.country && player.year === selection.year
  );
}

export default function TeamPanel({
  formation,
  selectedPlayers,
  draftPlayer,
  onDraftPlayer,
  onCancelDraft,
  selectedSelection,
  onSelectionChange,
  availableSlots,
}) {
  const [drawnSelection, setDrawnSelection] = useState(
    selectedSelection || null
  );
  const [placedPlayerId, setPlacedPlayerId] = useState(null);

  const selections = useMemo(() => getUniqueSelections(), []);
  const selectionPlayers = useMemo(
    () => getPlayersBySelection(drawnSelection),
    [drawnSelection]
  );

  const assignedPlayerIds = useMemo(
    () => new Set(selectedPlayers.map((item) => item.player.id)),
    [selectedPlayers]
  );

  useEffect(() => {
    onCancelDraft();
    setPlacedPlayerId(null);
  }, [drawnSelection]);

  useEffect(() => {
    if (!drawnSelection) {
      setPlacedPlayerId(null);
      return;
    }
    const placedFromSelection = selectedPlayers.find(
      (item) =>
        item.player.country === drawnSelection.country &&
        item.player.year === drawnSelection.year
    );
    setPlacedPlayerId(placedFromSelection ? placedFromSelection.player.id : null);
  }, [selectedPlayers, drawnSelection]);

  function handleDrawSelection() {
    const randomSelection =
      selections[Math.floor(Math.random() * selections.length)];
    setDrawnSelection(randomSelection);
    onSelectionChange(randomSelection);
  }

  function handleSelectPlayer(player) {
    if (assignedPlayerIds.has(player.id)) {
      return;
    }
    if (draftPlayer && draftPlayer.id !== player.id) {
      return;
    }
    const role = POSITION_TO_ROLE[player.position];
    if (!role) {
      return;
    }
    if ((availableSlots[role] ?? 0) <= 0) {
      return;
    }
    onDraftPlayer(player);
  }

  const isDrafting = draftPlayer !== null;

  return (
    <aside className="team-panel">
      <header className="team-panel-header">
        <h2>Mi selección</h2>
        <button
          type="button"
          className="draw-button"
          onClick={handleDrawSelection}
          disabled={selections.length === 0}
        >
          🎲 Elegir selección al azar
        </button>
      </header>

      {drawnSelection && (
        <div className="country-info">
          <span className="country-label">Selección sorteada:</span>
          <strong className="country-name">
            {drawnSelection.country} {drawnSelection.year}
          </strong>
        </div>
      )}

      {selectionPlayers.length > 0 && (
        <section className="player-list-section">
          <h3>Jugadores disponibles</h3>
          {isDrafting && (
            <div className="draft-notice">
              <p>
                <strong>{draftPlayer.name}</strong> listo para colocar.
                Haz clic en una posición del campo.
              </p>
              <button
                type="button"
                className="cancel-draft-button"
                onClick={onCancelDraft}
              >
                Cancelar
              </button>
            </div>
          )}
          <div className="player-list-scroll">
            <ul className="player-list">
              {selectionPlayers.map((player) => {
                const isAssigned = assignedPlayerIds.has(player.id);
                const isDraft = draftPlayer?.id === player.id;
                const isPlaced = placedPlayerId === player.id;
                const isLocked = placedPlayerId !== null && !isPlaced;
                const role = POSITION_TO_ROLE[player.position];
                const hasSlot = role && (availableSlots[role] ?? 0) > 0;
                const isDisabled = isAssigned || isLocked || !hasSlot;
                const disabledReason = !hasSlot
                  ? `No hay cupo de ${ROLE_LABELS[role]}`
                  : isLocked
                  ? 'Ya elegiste un jugador de esta selección'
                  : null;

                return (
                  <li
                    key={player.id}
                    className={`player-item ${isDraft ? 'selected' : ''} ${isAssigned ? 'assigned' : ''} ${isLocked ? 'locked' : ''} ${!hasSlot ? 'no-slot' : ''}`}
                    title={disabledReason || undefined}
                  >
                    <button
                      type="button"
                      className="player-button"
                      onClick={() => handleSelectPlayer(player)}
                      disabled={isDisabled}
                      aria-pressed={isDraft || isAssigned}
                    >
                      <span className="player-name">{player.name}</span>
                      <span className="player-meta">
                        {player.year} · {player.position} · {player.club}
                      </span>
                      {isDraft && (
                        <span className="selected-badge">Por colocar</span>
                      )}
                      {isAssigned && !isDraft && (
                        <span className="assigned-badge">En el 11</span>
                      )}
                      {isLocked && (
                        <span className="locked-badge">Bloqueado</span>
                      )}
                      {!isAssigned && !isDraft && !isLocked && !hasSlot && (
                        <span className="no-slot-badge">{disabledReason}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {drawnSelection && selectionPlayers.length === 0 && (
        <p className="empty-message">No hay jugadores para esta selección.</p>
      )}

      {!drawnSelection && (
        <p className="empty-message">
          Sortea una selección para ver sus jugadores históricos.
        </p>
      )}
    </aside>
  );
}
