import { useState, useEffect } from 'react';
import './PlayerCard.css';
import { CountryFlag } from '../utils/countryFlags';
import { getTournament } from '../services/zafronixApi';

const mbappe = {
  id: 'mbappe-2022',
  name: 'Kylian Mbappé',
  country: 'Francia',
  year: 2022,
  age: 23,
  birthYear: 1998,
  club: 'Paris Saint-Germain',
  position: 'Delantero',
  specificPositions: ['DC', 'ED'],
  finalPlace: 1,
  image: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Kylian_Mbapp%C3%A9_2018.jpg',
  flag: '🇫🇷',
};

function formatFinalPlace(place) {
  if (place === null || place === undefined) return 'N/A';
  if (place === 1) return 'Campeón';
  if (place === 2) return 'Subcampeón';
  if (place === 3) return '#3';
  return `#${place}`;
}

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function PlayerImage({ image, name }) {
  const [error, setError] = useState(false);

  if (!image || error) {
    return (
      <div className="player-card__placeholder">
        <span>{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className="player-card__image"
      onError={() => setError(true)}
    />
  );
}

function PlayerCard({ player = mbappe, compact = false }) {
  const [finalPlace, setFinalPlace] = useState(player.finalPlace ?? null);
  const [loadingPlace, setLoadingPlace] = useState(false);

  useEffect(() => {
    if (player.finalPlace != null || !player.year || !player.country) return;

    let cancelled = false;
    setLoadingPlace(true);

    getTournament(player.year)
      .then((data) => {
        if (cancelled) return;
        const team = data?.teams?.find((t) => t.name === player.country);
        setFinalPlace(team?.finalPosition ?? null);
      })
      .catch(() => {
        if (!cancelled) setFinalPlace(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingPlace(false);
      });

    return () => {
      cancelled = true;
    };
  }, [player.year, player.country, player.finalPlace]);

  const positions = player.specificPositions?.length
    ? player.specificPositions
    : [player.position];

  if (compact) {
    return (
      <div className="player-card player-card--compact">
        <div className="player-card-shine" />

        <div className="player-card__club player-card__club--centered">
          {player.clubCountry && (
            <CountryFlag country={player.clubCountry} className="player-card__club-flag" />
          )}
          {player.club}
        </div>

        <div className="player-card__identity">
          <div className="player-card__image-area">
            <PlayerImage image={player.image} name={player.name} />
          </div>
          <div className="player-card__name">{player.name}</div>
        </div>

        <div className="player-card__stats-row">
          <span>
            <CountryFlag country={player.country} className="player-card__country-flag" />
            {player.country}
          </span>
          <span>{player.year}</span>
          <span>{player.age} años</span>
        </div>

        <div className="player-card__positions player-card__positions--bottom">
          {positions.map((pos) => (
            <span key={pos} className="player-card__position-circle">
              {pos}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="player-card">
      <div className="player-card-shine" />

      <div className="player-card__header">
        <div className="player-card__positions">
          {positions.map((pos) => (
            <span key={pos} className="player-card__position-circle">
              {pos}
            </span>
          ))}
        </div>
        <div className="player-card__club">
          {player.clubCountry && (
            <CountryFlag country={player.clubCountry} className="player-card__club-flag" />
          )}
          {player.club}
        </div>
      </div>

      <div className="player-card__identity">
        <div className="player-card__image-area">
          <PlayerImage image={player.image} name={player.name} />
        </div>
        <div className="player-card__name">{player.name}</div>
      </div>

      <div className="player-card__stats">
        <div className="player-card__stat">
          <span className="player-card__stat-label">Mundial</span>
          <span className="player-card__stat-value">{player.year}</span>
        </div>
        <div className="player-card__stat">
          <span className="player-card__stat-label">Selección</span>
          <span className="player-card__stat-value">
            <CountryFlag country={player.country} className="player-card__country-flag" />
            {player.country}
          </span>
        </div>
        <div className="player-card__stat">
          <span className="player-card__stat-label">Edad</span>
          <span className="player-card__stat-value">{player.age}</span>
        </div>
        <div className="player-card__stat">
          <span className="player-card__stat-label">Lugar</span>
          <span className="player-card__stat-value">
            {loadingPlace ? '...' : formatFinalPlace(finalPlace)}
          </span>
        </div>
        <div className="player-card__stat player-card__stat--wide">
          <span className="player-card__stat-label">Equipo</span>
          <span className="player-card__stat-value">{player.club}</span>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
