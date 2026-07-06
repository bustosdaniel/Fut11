import { useEffect, useState } from 'react';
import './HomePage.css';
import worldCups from '../data/worldCups';
import { getTournaments } from '../services/zafronixApi';
import HeroSlider from './HeroSlider';
import WorldCupDetail from './WorldCupDetail';
import SelectionPlayers from './SelectionPlayers';
import PlayerDetail from './PlayerDetail';
import { CountryFlag } from '../utils/countryFlags';

export default function HomePage() {
  const [view, setView] = useState('list');
  const [selectedWorldCup, setSelectedWorldCup] = useState(null);
  const [selectedSelection, setSelectedSelection] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [apiWorldCups, setApiWorldCups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTournaments() {
      setLoading(true);
      setError(null);

      try {
        const data = await getTournaments();

        if (!cancelled) {
          setApiWorldCups(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar los mundiales');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTournaments();

    return () => {
      cancelled = true;
    };
  }, []);

  const mergedWorldCups = apiWorldCups.map((apiWc) => {
    const staticWc = worldCups.find((w) => w.year === apiWc.year);
    return {
      ...staticWc,
      year: apiWc.year,
      host: Array.isArray(apiWc.host) ? apiWc.host.join(' / ') : apiWc.host,
      winner: apiWc.champion,
      teamsCount: apiWc.teamsCount,
    };
  });

  const displayWorldCups = mergedWorldCups.length > 0 ? mergedWorldCups : worldCups;

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchTournaments = async () => {
      try {
        const data = await getTournaments();
        setApiWorldCups(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los mundiales');
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  };

  const handleVerMas = (wc) => {
    setSelectedWorldCup(wc);
    setView('worldcup');
  };

  const handleBackToList = () => {
    setView('list');
  };

  const handleSelectSelection = ({ country, year }) => {
    setSelectedSelection({ country, year });
    setView('selection');
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    setView('player');
  };

  const handleBackToWorldCup = () => {
    setView('worldcup');
  };

  const handleBackToSelection = () => {
    setView('selection');
  };

  return (
    <div className="home-page">
      {view === 'list' && (
        <>
          <HeroSlider />
          <section className="worldcups-section">
            <div className="worldcups-header">
              <span className="worldcups-icon">🏆</span>
              <div className="worldcups-header-text">
                <h2 className="worldcups-title">Historial de Mundiales</h2>
                <p className="worldcups-subtitle">
                  Revive las últimas ediciones de la Copa del Mundo
                </p>
              </div>
            </div>

            {loading && (
              <div className="worldcups-status">
                <p>Cargando mundiales...</p>
              </div>
            )}

            {error && (
              <div className="worldcups-status worldcups-status-error">
                <p>{error}</p>
                <button
                  type="button"
                  className="worldcups-retry-button"
                  onClick={handleRetry}
                >
                  Reintentar
                </button>
              </div>
            )}

            <div className="worldcups-grid">
              {displayWorldCups.map((wc) => (
                <article
                  key={wc.year}
                  className="worldcup-card"
                  onClick={() => handleVerMas(wc)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleVerMas(wc);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalle del Mundial ${wc.year}`}
                >
                  <div className="worldcup-card-image">
                    <img
                      src={wc.imagePlaceholder || '/images/mundial/placeholder.jpg'}
                      alt={`Mundial ${wc.year}`}
                    />
                  </div>
                  <div className="worldcup-card-content">
                    <div className="worldcup-card-header">
                      <h3 className="worldcup-card-year">{wc.year}</h3>
                      <p className="worldcup-card-winner">
                        {wc.winner ? (
                          <>
                            <CountryFlag
                              country={wc.winner}
                              className="worldcup-card-flag"
                              alt={`Bandera de ${wc.winner}`}
                            />
                            <span>{wc.winner}</span>
                          </>
                        ) : (
                          <span className="worldcup-card-upcoming">Próximo mundial</span>
                        )}
                      </p>
                    </div>
                    <p className="worldcup-card-description">
                      {wc.description || `Mundial de la FIFA ${wc.year}.`}
                    </p>
                    <div className="worldcup-card-meta">
                      <span className="worldcup-card-meta-item">
                        <strong>Sede:</strong> {wc.host}
                      </span>
                      {(() => {
                        const teamsCount =
                          wc.teamsCount ??
                          (wc.participants && wc.participants.length > 0
                            ? wc.participants.length
                            : null);
                        return teamsCount !== null ? (
                          <span className="worldcup-card-meta-item">
                            <strong>Equipos:</strong> {teamsCount}
                          </span>
                        ) : (
                          <span className="worldcup-card-meta-item">
                            <strong>Equipos:</strong> -
                          </span>
                        );
                      })()}
                      {wc.topScorers && wc.topScorers.length > 0 && (
                        <span className="worldcup-card-meta-item">
                          <strong>Goleador:</strong> {wc.topScorers[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {view === 'worldcup' && selectedWorldCup && (
        <div className="detail-view-container">
          <WorldCupDetail
            worldCup={selectedWorldCup}
            onBack={handleBackToList}
            onSelectSelection={handleSelectSelection}
          />
        </div>
      )}

      {view === 'selection' && selectedSelection && (
        <div className="detail-view-container">
          <SelectionPlayers
            country={selectedSelection.country}
            year={selectedSelection.year}
            onBack={handleBackToWorldCup}
            onSelectPlayer={handleSelectPlayer}
          />
        </div>
      )}

      {view === 'player' && selectedPlayer && (
        <div className="detail-view-container">
          <PlayerDetail player={selectedPlayer} onBack={handleBackToSelection} />
        </div>
      )}
    </div>
  );
}
