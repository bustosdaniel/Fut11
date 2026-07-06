import './Header.css';

export default function Header({ gameStarted, onStartGame, onGoHome }) {
  return (
    <header className="top-header">
      <button
        type="button"
        className="header-brand"
        onClick={gameStarted ? onGoHome : undefined}
        aria-label={gameStarted ? 'Volver al inicio' : 'fut11'}
      >
        <div className="header-badges">
          <span className="header-badge" aria-hidden="true">⚽</span>
          <span className="header-badge" aria-hidden="true">🏆</span>
          <span className="header-badge" aria-hidden="true">🌍</span>
        </div>
        <span className="header-title">fut11</span>
      </button>

      <button
        type="button"
        className="header-play-button"
        onClick={gameStarted ? onGoHome : onStartGame}
      >
        {gameStarted ? 'Inicio' : 'Jugar'}
      </button>
    </header>
  );
}
