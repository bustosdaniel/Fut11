import { useMemo } from 'react';
import { getFormationPositions } from './FormationSelector';

const FIELD_WIDTH = 400;
const FIELD_HEIGHT = 600;

const ROLE_ROWS = {
  GK: { y: 0.88, color: '#f59e0b', label: 'GK' },
  DEF: { y: 0.68, color: '#3b82f6', label: 'DEF' },
  MID: { y: 0.45, color: '#22c55e', label: 'MID' },
  FWD: { y: 0.18, color: '#ef4444', label: 'FWD' },
};

function distributeRow(count) {
  if (count <= 0) return [];
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push((i + 1) / (count + 1));
  }
  return positions;
}

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildFormationSlots(formation) {
  const roles = getFormationPositions(formation);
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  roles.forEach((role) => {
    if (counts[role] !== undefined) counts[role]++;
  });

  const rowSlots = {
    GK: distributeRow(counts.GK),
    DEF: distributeRow(counts.DEF),
    MID: distributeRow(counts.MID),
    FWD: distributeRow(counts.FWD),
  };

  const indices = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  return roles.map((role) => {
    const row = ROLE_ROWS[role];
    const slotIndex = indices[role]++;
    const x = rowSlots[role][slotIndex] ?? 0.5;
    return {
      role,
      x,
      y: row.y,
      color: row.color,
      label: row.label,
    };
  });
}

const POSITION_TO_ROLE = {
  Portero: 'GK',
  Defensa: 'DEF',
  Mediocampista: 'MID',
  Delantero: 'FWD',
};

export default function FootballField({
  formation,
  players = [],
  draftPlayer,
  onPlacePlayer,
  onRemovePlayer,
}) {
  const slots = useMemo(() => buildFormationSlots(formation), [formation]);
  const draftRole = draftPlayer ? POSITION_TO_ROLE[draftPlayer.position] : null;

  function handleRemoveClick(event, playerId) {
    event.stopPropagation();
    onRemovePlayer?.(playerId);
  }

  function handleSlotClick(index, player) {
    if (player) return;
    onPlacePlayer?.(index);
  }

  return (
    <div
      className="football-field"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="football-field-inner"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '100%',
          aspectRatio: `${FIELD_WIDTH} / ${FIELD_HEIGHT}`,
        }}
      >
      <svg
        viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        role="img"
        aria-label="Campo de fútbol"
      >
        <defs>
          <pattern id="grass" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#15803d" />
            <rect width="10" height="10" fill="#166534" />
            <rect x="10" y="10" width="10" height="10" fill="#166534" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="url(#grass)" />

        <g stroke="rgba(255,255,255,0.85)" strokeWidth="2" fill="none">
          <rect x="10" y="10" width={FIELD_WIDTH - 20} height={FIELD_HEIGHT - 20} />

          <line x1={10} y1={FIELD_HEIGHT / 2} x2={FIELD_WIDTH - 10} y2={FIELD_HEIGHT / 2} />

          <circle
            cx={FIELD_WIDTH / 2}
            cy={FIELD_HEIGHT / 2}
            r="55"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2"
          />
          <circle
            cx={FIELD_WIDTH / 2}
            cy={FIELD_HEIGHT / 2}
            r="3"
            fill="rgba(255,255,255,0.85)"
            stroke="none"
          />

          <rect x={90} y={10} width={FIELD_WIDTH - 180} height="80" />
          <rect x={160} y={10} width={FIELD_WIDTH - 320} height="32" />
          <circle cx={FIELD_WIDTH / 2} cy="86" r="3" fill="rgba(255,255,255,0.85)" stroke="none" />

          <rect
            x={90}
            y={FIELD_HEIGHT - 90}
            width={FIELD_WIDTH - 180}
            height="80"
          />
          <rect
            x={160}
            y={FIELD_HEIGHT - 42}
            width={FIELD_WIDTH - 320}
            height="32"
          />
          <circle
            cx={FIELD_WIDTH / 2}
            cy={FIELD_HEIGHT - 86}
            r="3"
            fill="rgba(255,255,255,0.85)"
            stroke="none"
          />

          <line
            x1={FIELD_WIDTH / 2 - 60}
            y1={FIELD_HEIGHT - 10}
            x2={FIELD_WIDTH / 2 + 60}
            y2={FIELD_HEIGHT - 10}
            strokeDasharray="4 4"
          />
        </g>
      </svg>

      {slots.map((slot, index) => {
        const player = players.find((item) => item.positionIndex === index);
        const displayText = player ? getInitials(player.player.name) : slot.label;
        const title = player ? player.player.name : slot.label;
        const isDraftTarget =
          draftPlayer && !player && slot.role === draftRole;

        return (
          <div
            key={`${slot.role}-${index}`}
            className={`field-token ${player ? 'filled' : ''} ${isDraftTarget ? 'draft-target' : ''}`}
            title={title}
            onClick={() => handleSlotClick(index, player)}
            style={{
              position: 'absolute',
              left: `${slot.x * 100}%`,
              top: `${slot.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 'clamp(36px, 9%, 56px)',
              height: 'clamp(36px, 9%, 56px)',
              borderRadius: '50%',
              backgroundColor: slot.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'clamp(10px, 2.2vw, 14px)',
              textAlign: 'center',
              boxShadow: isDraftTarget
                ? '0 0 0 4px #fbbf24, 0 2px 6px rgba(0,0,0,0.35)'
                : '0 2px 6px rgba(0,0,0,0.35)',
              border: '2px solid rgba(255,255,255,0.9)',
              cursor: isDraftTarget ? 'pointer' : player ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            {displayText}
            {player && (
              <button
                type="button"
                className="field-token-remove"
                aria-label={`Quitar a ${player.player.name}`}
                onClick={(event) => handleRemoveClick(event, player.player.id)}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
