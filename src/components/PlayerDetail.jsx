import { useState, useEffect } from 'react';
import './PlayerDetail.css';
import { CountryFlag } from '../utils/countryFlags';
import { getPlayer, getTournament } from '../services/zafronixApi';

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatFinalPlace(place) {
  if (place === null || place === undefined) return 'N/A';
  if (place === 1) return 'Campeón';
  if (place === 2) return 'Subcampeón';
  if (place === 3) return '#3';
  return `#${place}`;
}

function PlayerDetailImage({ image, name }) {
  const [error, setError] = useState(false);

  if (!image || error) {
    return (
      <div className="player-detail__placeholder">
        <span>{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className="player-detail__image"
      onError={() => setError(true)}
    />
  );
}

function StatItem({ label, value, highlight = false }) {
  return (
    <div className={`player-detail__stat-item ${highlight ? 'player-detail__stat-item--highlight' : ''}`}>
      <span className="player-detail__stat-label">{label}</span>
      <span className="player-detail__stat-value">{value}</span>
    </div>
  );
}

function AppearanceItem({ appearance }) {
  return (
    <li className="player-detail__appearance-item">
      <div className="player-detail__appearance-main">
        <span className="player-detail__appearance-year">{appearance.year}</span>
        <div className="player-detail__appearance-team">
          <CountryFlag
            country={appearance.team}
            className="player-detail__appearance-flag"
            fallback="🏳️"
          />
          <span>{appearance.team}</span>
        </div>
        {appearance.captain && (
          <span className="player-detail__captain-badge">Capitán</span>
        )}
      </div>
      <div className="player-detail__appearance-meta">
        <span>Posición: {appearance.position}</span>
        <span>Camiseta: {appearance.jersey}</span>
        <span>Goles: {appearance.goals}</span>
        <span>Asistencias: {appearance.assists ?? '—'}</span>
      </div>
      {appearance.club && (
        <div className="player-detail__appearance-club">
          <span className="player-detail__appearance-club-label">Club</span>
          <span className="player-detail__appearance-club-value">
            {appearance.club.name}
            {appearance.club.country && ` (${appearance.club.country})`}
          </span>
        </div>
      )}
    </li>
  );
}

const FOOT_LABELS = {
  left: 'Izquierda',
  right: 'Derecha',
  both: 'Ambas',
};

function TechnicalInfo({ identity, appearances, playerCountry }) {
  if (!identity && !appearances) return null;

  const gridRows = [];

  gridRows.push({
    label: 'Altura',
    value: identity?.heightCm != null ? `${identity.heightCm} cm` : '—',
  });

  gridRows.push({
    label: 'Peso',
    value: identity?.weightKg != null ? `${identity.weightKg} kg` : '—',
  });

  gridRows.push({
    label: 'Pierna',
    value: FOOT_LABELS[identity?.dominantFoot] || '—',
  });

  const minutesList = (appearances || []).map((a) => a.minutes);
  const allNull =
    minutesList.length > 0 && minutesList.every((m) => m == null);
  const totalMinutes = minutesList.reduce(
    (sum, m) => sum + (m ?? 0),
    0
  );

  gridRows.push({
    label: 'Minutos',
    value: minutesList.length === 0 || allNull ? '—' : String(totalMinutes),
  });

  const nationality = identity?.nationality || playerCountry || '';
  const birthCountry =
    identity?.birthCountry || identity?.placeOfBirth?.country;
  const showBirthCountry =
    birthCountry &&
    birthCountry.trim().toLowerCase() !== nationality.trim().toLowerCase();

  return (
    <div className="player-detail__technical-sheet">
      <h3 className="player-detail__technical-title">Ficha técnica</h3>
      <div className="player-detail__technical-grid">
        {gridRows.map((row) => (
          <div key={row.label} className="player-detail__technical-row">
            <span className="player-detail__technical-label">{row.label}</span>
            <span className="player-detail__technical-value">{row.value}</span>
          </div>
        ))}
      </div>
      {showBirthCountry && (
        <div className="player-detail__technical-row player-detail__technical-row--full">
          <span className="player-detail__technical-label">País de nacimiento</span>
          <span className="player-detail__technical-value">{birthCountry}</span>
        </div>
      )}
    </div>
  );
}

function PlayerDetail({ player, onBack }) {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tournamentData, setTournamentData] = useState(null);
  const [tournamentLoading, setTournamentLoading] = useState(false);
  const [tournamentError, setTournamentError] = useState(null);
  const [finalPlace, setFinalPlace] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!player?.name) return;

      setLoading(true);
      setError(null);
      setApiData(null);
      setTournamentLoading(true);
      setTournamentError(null);
      setTournamentData(null);
      setFinalPlace(null);

      const playerPromise = getPlayer(player.name);
      const tournamentPromise = player?.year
        ? getTournament(player.year)
        : Promise.resolve(null);

      try {
        const data = await playerPromise;
        if (!cancelled) {
          setApiData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'No se pudieron cargar los datos de Zafronix.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

      try {
        const tournamentRes = await tournamentPromise;
        if (!cancelled) {
          setTournamentData(tournamentRes);
          const team = tournamentRes?.teams?.find(
            (t) => t.name === player.country
          );
          setFinalPlace(team?.finalPosition ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setTournamentError(err.message || 'No se pudo cargar el torneo.');
        }
      } finally {
        if (!cancelled) {
          setTournamentLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [player?.name, player?.year, player?.country]);

  if (!player) return null;

  const positions = player.specificPositions?.length
    ? player.specificPositions
    : [player.position];

  return (
    <div className="player-detail__overlay">
      <div className="player-detail__card">
        <button
          type="button"
          className="player-detail__back"
          onClick={onBack}
          aria-label="Volver al grid de jugadores"
        >
          ← Volver
        </button>

        <div className="player-detail__media">
          <PlayerDetailImage image={player.image} name={player.name} />

          <div className="player-detail__positions">
            {positions.map((pos) => (
              <span key={pos} className="player-detail__position-badge">
                {pos}
              </span>
            ))}
          </div>

          <TechnicalInfo
            identity={apiData?.identity}
            appearances={apiData?.appearances}
            playerCountry={player.country}
          />
        </div>

        <div className="player-detail__content">
          <div className="player-detail__header">
            <h2 className="player-detail__name">{player.name}</h2>

            <div className="player-detail__country">
              <CountryFlag
                country={player.country}
                className="player-detail__country-flag"
                fallback={player.flag || '🏳️'}
              />
              <span>{player.country}</span>
            </div>

            {loading && (
              <span className="player-detail__loading">
                Cargando datos de Zafronix…
              </span>
            )}
            {error && (
              <span className="player-detail__error">
                {error}
              </span>
            )}
          </div>

          <div className="player-detail__info-grid">
            <StatItem label="Mundial" value={player.year} highlight />
            <StatItem label="Edad" value={`${player.age} años`} />
            <StatItem
              label="Nacimiento"
              value={player.birthYear || '—'}
            />
            <StatItem
              label="Lugar selección"
              value={
                tournamentLoading
                  ? '...'
                  : tournamentError
                  ? '—'
                  : formatFinalPlace(finalPlace)
              }
              highlight={finalPlace === 1}
            />
            <div className="player-detail__stat-item player-detail__stat-item--wide">
              <span className="player-detail__stat-label">Club</span>
              <span className="player-detail__stat-value player-detail__club">
                {player.clubCountry && (
                  <CountryFlag
                    country={player.clubCountry}
                    className="player-detail__club-flag"
                    fallback={player.clubFlag || '🏳️'}
                  />
                )}
                {player.club || '—'}
              </span>
            </div>
          </div>

          <div className="player-detail__stats-section">
            <h3 className="player-detail__section-title">Estadísticas del mundial</h3>
            <div className="player-detail__stats-grid">
              <StatItem
                label="Mundiales jugados"
                value={apiData?.tournamentCount ?? '—'}
                highlight
              />
              <StatItem
                label="Goles en mundiales"
                value={apiData?.totalGoals ?? '—'}
              />
              <StatItem
                label="Asistencias en mundiales"
                value={
                  (apiData?.appearances || []).some((a) => a.assists != null)
                    ? (apiData?.appearances || []).reduce(
                        (sum, a) => sum + (a.assists ?? 0),
                        0
                      )
                    : '—'
                }
              />
            </div>
          </div>

          {apiData?.appearances?.length > 0 && (
            <div className="player-detail__appearances-section">
              <h3 className="player-detail__section-title">
                Apariciones en mundiales
              </h3>
              <ul className="player-detail__appearances-list">
                {apiData.appearances.map((appearance, index) => (
                  <AppearanceItem
                    key={`${appearance.year}-${appearance.team}-${index}`}
                    appearance={appearance}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerDetail;
