import { useEffect, useState } from 'react';
import './WorldCupDetail.css';
import { CountryFlag } from '../utils/countryFlags';
import { getTournament } from '../services/zafronixApi';

const WINNER_IMAGES = {};

function getWinnerImage(wc) {
  if (!wc?.winner) return wc?.imagePlaceholder;
  const key = `${wc.winner}_${wc.year}`;
  return WINNER_IMAGES[key] || wc.imagePlaceholder;
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function ListCard({ title, items = [], icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="wcd-list-card">
      <h4 className="wcd-list-title">
        {icon && <span className="wcd-list-icon">{icon}</span>}
        {title}
      </h4>
      <ul className="wcd-list">
        {items.map((item, index) => (
          <li key={index} className="wcd-list-item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorldCupDetail({
  worldCup,
  onBack,
  onSelectSelection,
}) {
  const wc = worldCup;
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wc?.year) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getTournament(wc.year)
      .then((data) => {
        if (!cancelled) {
          setApiData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'No se pudieron cargar los datos del mundial.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [wc?.year]);

  const handleRetry = () => {
    if (!wc?.year) return;
    setLoading(true);
    setError(null);
    getTournament(wc.year)
      .then((data) => {
        setApiData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'No se pudieron cargar los datos del mundial.');
        setLoading(false);
      });
  };

  if (!wc) {
    return (
      <div className="world-cup-detail">
        <button className="wcd-back-button" onClick={onBack} type="button">
          ← Volver
        </button>
        <p className="wcd-empty">No se encontró información del mundial.</p>
      </div>
    );
  }

  const tournament = apiData?.tournament;
  const teams = apiData?.teams || [];
  const hostDisplay = tournament?.host?.join(' / ') || wc.host;
  const winner = tournament?.champion || wc.winner;
  const championTeam = tournament
    ? teams.find((t) => t.name === tournament.champion)
    : null;
  const details = wc.winnerDetails || {};

  const finalMatch = championTeam?.knockoutPath?.find((m) => m.stage === 'final');
  const championMatchesPlayed = championTeam
    ? (championTeam.groupStage?.played || 0) +
      (championTeam.knockoutPath?.length || 0)
    : null;

  const keyInfo = {
    host: hostDisplay,
    winner,
    finalResult:
      finalMatch?.result || details.finalResult || 'No disponible',
    captain: championTeam?.captain || details.captain || 'No disponible',
    coach: championTeam?.coach?.name || details.coach || 'No disponible',
    mvp: tournament?.bestPlayer || details.mvp || 'No disponible',
    matchesPlayed: championMatchesPlayed ?? details.matchesPlayed ?? 'No disponible',
    goalsFor: championTeam?.groupStage?.gf ?? details.goalsFor ?? 'No disponible',
    goalsAgainst: championTeam?.groupStage?.ga ?? details.goalsAgainst ?? 'No disponible',
    cleanSheets: details.cleanSheets ?? 'No disponible',
  };

  const topScorers = tournament?.topScorer
    ? [`${tournament.topScorer.player} - ${tournament.topScorer.goals}`]
    : wc.topScorers;

  const podium = tournament
    ? {
        champion: tournament.champion,
        runnerUp: tournament.runnerUp,
        thirdPlace: tournament.thirdPlace,
      }
    : wc.podium;

  const participants =
    teams.length > 0 ? teams.map((t) => t.name) : wc.participants;

  const winnerImage = getWinnerImage(wc);

  const handleWinnerClick = () => {
    if (winner && onSelectSelection) {
      onSelectSelection({ country: winner, year: wc.year });
    }
  };

  const isWinnerClickable = Boolean(winner && onSelectSelection);

  return (
    <div className="world-cup-detail">
      <div className="wcd-hero">
        {(loading || error) && (
          <div className="wcd-api-status">
            {loading && (
              <p className="wcd-loading">Cargando datos del mundial...</p>
            )}
            {error && (
              <div className="wcd-error">
                <p>{error}</p>
                <button
                  className="wcd-retry-button"
                  onClick={handleRetry}
                  type="button"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        )}

        <div className="wcd-hero-content">
          <button className="wcd-back-button" onClick={onBack} type="button">
            ← Volver
          </button>

          <div className="wcd-image-wrapper">
            {winnerImage ? (
              <img
                src={winnerImage}
                alt={`${winner || 'Selección'} campeón del Mundial ${wc.year}`}
                className="wcd-winner-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="wcd-image-fallback">
                {getInitials(winner || wc.host)}
              </div>
            )}
          </div>

          <div className="wcd-hero-info">
            <h1 className="wcd-title">
              {hostDisplay} {wc.year}
            </h1>
            {winner ? (
              <button
                className={`wcd-winner-badge ${
                  isWinnerClickable ? 'wcd-winner-badge--clickable' : ''
                }`}
                onClick={handleWinnerClick}
                type="button"
                disabled={!isWinnerClickable}
                aria-label={`Ver selección de ${winner} ${wc.year}`}
              >
                <CountryFlag
                  country={winner}
                  className="wcd-winner-flag"
                  alt={`Bandera de ${winner}`}
                />
                <span className="wcd-winner-name">{winner}</span>
                <span className="wcd-winner-label">Campeón</span>
              </button>
            ) : (
              <span className="wcd-upcoming-label">Próximo mundial</span>
            )}
          </div>
        </div>
      </div>

      <div className="wcd-body">
        <section className="wcd-section wcd-description-section">
          <h2 className="wcd-section-title">Resumen</h2>
          <p className="wcd-description">{wc.description}</p>
        </section>

        <section className="wcd-section">
          <h2 className="wcd-section-title">Información clave</h2>
          <div className="wcd-info-grid">
            <div className="wcd-info-item">
              <span className="wcd-info-label">Sede</span>
              <span className="wcd-info-value wcd-info-value--host">
                <CountryFlag
                  country={keyInfo.host}
                  className="wcd-info-flag"
                  alt={`Bandera de ${keyInfo.host}`}
                />
                {keyInfo.host}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Ganador</span>
              <span className="wcd-info-value wcd-info-value--winner">
                {keyInfo.winner && (
                  <CountryFlag
                    country={keyInfo.winner}
                    className="wcd-info-flag"
                    alt={`Bandera de ${keyInfo.winner}`}
                  />
                )}
                {keyInfo.winner || 'Por definir'}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Resultado final</span>
              <span className="wcd-info-value">
                {keyInfo.finalResult}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Capitán</span>
              <span className="wcd-info-value">
                {keyInfo.captain}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Entrenador</span>
              <span className="wcd-info-value">
                {keyInfo.coach}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">MVP</span>
              <span className="wcd-info-value">
                {keyInfo.mvp}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Partidos jugados</span>
              <span className="wcd-info-value">
                {keyInfo.matchesPlayed}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Goles a favor</span>
              <span className="wcd-info-value">
                {keyInfo.goalsFor}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Goles en contra</span>
              <span className="wcd-info-value">
                {keyInfo.goalsAgainst}
              </span>
            </div>
            <div className="wcd-info-item">
              <span className="wcd-info-label">Porterías imbatidas</span>
              <span className="wcd-info-value">
                {keyInfo.cleanSheets}
              </span>
            </div>
          </div>
        </section>

        <section className="wcd-section">
          <h2 className="wcd-section-title">Estadísticas destacadas</h2>
          <div className="wcd-lists-grid">
            <ListCard title="Goleadores" items={topScorers} icon="⚽" />
            <ListCard title="Asistidores" items={wc.topAssisters} icon="🅰️" />
            <ListCard
              title="Porterías imbatidas"
              items={wc.cleanSheets}
              icon="🧤"
            />
            <ListCard
              title="Tarjetas rojas"
              items={wc.redCards}
              icon="🟥"
            />
            <ListCard
              title="Tarjetas amarillas"
              items={wc.yellowCards}
              icon="🟨"
            />
          </div>
        </section>

        {podium && (
          <section className="wcd-section">
            <h2 className="wcd-section-title">Podio</h2>
            <div className="wcd-podium-grid">
              <div className="wcd-podium-card wcd-podium-card--champion">
                <span className="wcd-podium-position">Campeón</span>
                <CountryFlag
                  country={podium.champion}
                  className="wcd-podium-flag"
                  alt={`Bandera de ${podium.champion}`}
                />
                <span className="wcd-podium-country">{podium.champion}</span>
              </div>
              <div className="wcd-podium-card wcd-podium-card--runner-up">
                <span className="wcd-podium-position">Subcampeón</span>
                <CountryFlag
                  country={podium.runnerUp}
                  className="wcd-podium-flag"
                  alt={`Bandera de ${podium.runnerUp}`}
                />
                <span className="wcd-podium-country">{podium.runnerUp}</span>
              </div>
              <div className="wcd-podium-card wcd-podium-card--third">
                <span className="wcd-podium-position">Tercer puesto</span>
                <CountryFlag
                  country={podium.thirdPlace}
                  className="wcd-podium-flag"
                  alt={`Bandera de ${podium.thirdPlace}`}
                />
                <span className="wcd-podium-country">{podium.thirdPlace}</span>
              </div>
            </div>
          </section>
        )}

        <section className="wcd-section">
          <h2 className="wcd-section-title">
            Selecciones participantes
            {participants && participants.length > 0 && (
              <span className="wcd-participants-count">
                ({participants.length})
              </span>
            )}
          </h2>
          <div className="wcd-participants-grid">
            {participants && participants.length > 0 ? (
              participants.map((country) => {
                const isWinner = country === winner;
                return (
                  <button
                    key={country}
                    className={`wcd-participant ${
                      isWinner ? 'wcd-participant--winner' : ''
                    }`}
                    onClick={() =>
                      onSelectSelection && onSelectSelection({ country, year: wc.year })
                    }
                    type="button"
                    disabled={!onSelectSelection}
                    aria-label={`Ver selección de ${country} ${wc.year}`}
                  >
                    <CountryFlag
                      country={country}
                      className="wcd-participant-flag"
                      fallback={
                        <span className="wcd-participant-fallback">
                          {getInitials(country)}
                        </span>
                      }
                      alt={`Bandera de ${country}`}
                    />
                    <span className="wcd-participant-name">{country}</span>
                    {isWinner && (
                      <span className="wcd-participant-crown">👑</span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="wcd-empty-list">
                Las selecciones participantes aún no están definidas.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
