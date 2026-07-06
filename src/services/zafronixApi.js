const BASE_URL = import.meta.env.VITE_ZAFRONIX_API_BASE_URL || 'https://api.zafronix.com/fifa/worldcup/v1';

export async function getTournament(year) {
  const apiKey = import.meta.env.VITE_ZAFRONIX_API_KEY;

  const response = await fetch(`${BASE_URL}/tournaments/${year}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function getTournaments() {
  const apiKey = import.meta.env.VITE_ZAFRONIX_API_KEY;

  const response = await fetch(`${BASE_URL}/tournaments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function getTeamRoster(country, year) {
  const apiKey = import.meta.env.VITE_ZAFRONIX_API_KEY;
  const encodedCountry = encodeURIComponent(country);

  const response = await fetch(
    `${BASE_URL}/teams/${encodedCountry}/roster?year=${year}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function getPlayer(name) {
  const apiKey = import.meta.env.VITE_ZAFRONIX_API_KEY;
  const encodedName = encodeURIComponent(name);

  const response = await fetch(`${BASE_URL}/players/${encodedName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}
