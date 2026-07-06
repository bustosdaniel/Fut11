import { useEffect, useState } from 'react';
import { getTeamRoster } from '../services/zafronixApi';
import PlayerCard from './PlayerCard';
import { CountryFlag } from '../utils/countryFlags';
import './SelectionPlayers.css';

const POSITION_MAP = {
  GK: 'Portero',
  DF: 'Defensa',
  MF: 'Mediocampista',
  FW: 'Delantero',
};

const SPECIFIC_POSITIONS_MAP = {
  Portero: ['POR'],
  Defensa: ['DFC'],
  Mediocampista: ['MC'],
  Delantero: ['DC'],
};

const COUNTRY_FLAG_EMOJIS = {
  Alemania: '🇩🇪',
  Germany: '🇩🇪',
  Argentina: '🇦🇷',
  Brasil: '🇧🇷',
  Brazil: '🇧🇷',
  Francia: '🇫🇷',
  France: '🇫🇷',
  Italia: '🇮🇹',
  Italy: '🇮🇹',
  Uruguay: '🇺🇾',
  España: '🇪🇸',
  Spain: '🇪🇸',
  Inglaterra: '🇬🇧',
  England: '🇬🇧',
  Portugal: '🇵🇹',
};

function mapApiPlayer(player, country, year, index) {
  const position = POSITION_MAP[player.position] || player.position || 'Desconocido';
  const birthYear = player.born ? Number(player.born.split('-')[0]) : null;

  return {
    id: `${player.name || `player-${index}`}-${year}`,
    name: player.name,
    country,
    year,
    age: player.ageAtTournament,
    birthYear,
    club: player.club?.name,
    clubCountry: player.club?.country,
    position,
    specificPositions: SPECIFIC_POSITIONS_MAP[position] || [position],
    finalPlace: null,
    image: null,
    flag: COUNTRY_FLAG_EMOJIS[country] || null,
    stats: player.stats
      ? {
          matches: player.stats.matches,
          goals: player.stats.goals,
          assists: player.stats.assists,
          yellowCards: player.stats.yellowCards,
          redCards: player.stats.redCards,
          cleanSheets: player.stats.cleanSheets,
        }
      : undefined,
  };
}

function SelectionPlayers({ country, year, onBack, onSelectPlayer }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPlayers() {
      setLoading(true);
      setError(null);
      setPlayers([]);

      try {
        const roster = await getTeamRoster(country, year);
        if (!cancelled) {
          setPlayers((roster || []).map((player, index) => mapApiPlayer(player, country, year, index)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Error al cargar los jugadores.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPlayers();

    return () => {
      cancelled = true;
    };
  }, [country, year]);

  const titleFlagFallback = players[0]?.flag ?? '🏳️';

  return (
    <section className="selection-players">
      <header className="selection-players__header">
        <button
          type="button"
          className="selection-players__back"
          onClick={onBack}
        >
          ← Volver
        </button>
        <h1 className="selection-players__title">
          <CountryFlag
            country={country}
            className="selection-players__flag"
            fallback={
              <span className="selection-players__flag-emoji">
                {titleFlagFallback}
              </span>
            }
          />
          Jugadores de {country} {year}
        </h1>
      </header>

      {loading && (
        <div className="selection-players__loading">
          <div className="selection-players__spinner" aria-hidden="true" />
          <p>Cargando jugadores...</p>
        </div>
      )}

      {error && (
        <div className="selection-players__error">
          <p>{error}</p>
          <button
            type="button"
            className="selection-players__retry"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && players.length === 0 && (
        <p className="selection-players__empty">
          No hay jugadores disponibles para {country} en {year}.
        </p>
      )}

      {!loading && !error && players.length > 0 && (
        <div className="selection-players__grid">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              className="selection-players__card-button"
              onClick={() => onSelectPlayer(player)}
              aria-label={`Seleccionar a ${player.name}`}
            >
              <PlayerCard player={player} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default SelectionPlayers;
