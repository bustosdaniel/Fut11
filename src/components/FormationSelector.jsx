import './FormationSelector.css';

export const FORMATIONS = {
  '4-3-3': { label: '4-3-3', gk: 1, def: 4, mid: 3, fwd: 3 },
  '4-4-2': { label: '4-4-2', gk: 1, def: 4, mid: 4, fwd: 2 },
  '3-5-2': { label: '3-5-2', gk: 1, def: 3, mid: 5, fwd: 2 },
  '4-2-3-1': { label: '4-2-3-1', gk: 1, def: 4, mid: 5, fwd: 1 },
  '5-3-2': { label: '5-3-2', gk: 1, def: 5, mid: 3, fwd: 2 },
  '3-4-3': { label: '3-4-3', gk: 1, def: 3, mid: 4, fwd: 3 },
};

export const FORMATION_KEYS = Object.keys(FORMATIONS);

export function getFormationPositions(formation) {
  const config = FORMATIONS[formation];
  if (!config) {
    return [];
  }

  const positions = [];
  for (let i = 0; i < config.gk; i++) positions.push('GK');
  for (let i = 0; i < config.def; i++) positions.push('DEF');
  for (let i = 0; i < config.mid; i++) positions.push('MID');
  for (let i = 0; i < config.fwd; i++) positions.push('FWD');
  return positions;
}

export function getPositionCounts(formation) {
  const config = FORMATIONS[formation];
  if (!config) {
    return { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  }
  return {
    GK: config.gk,
    DEF: config.def,
    MID: config.mid,
    FWD: config.fwd,
  };
}

export function getFormationSummary(formation) {
  const config = FORMATIONS[formation];
  if (!config) return '';
  return `${config.gk}P · ${config.def}D · ${config.mid}M · ${config.fwd}D`;
}

export default function FormationSelector({ value, onChange }) {
  return (
    <label className="formation-selector">
      <span>Formación táctica</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Formación táctica"
      >
        {FORMATION_KEYS.map((key) => (
          <option key={key} value={key}>
            {FORMATIONS[key].label} ({getFormationSummary(key)})
          </option>
        ))}
      </select>
    </label>
  );
}
