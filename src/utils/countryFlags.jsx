import { DE, AR, BR, FR, IT, UY, ES, GB, PT } from 'country-flag-icons/react/3x2';

const FLAGS = {
  Alemania: DE,
  Germany: DE,
  Argentina: AR,
  Brasil: BR,
  Brazil: BR,
  Francia: FR,
  France: FR,
  Italia: IT,
  Italy: IT,
  Uruguay: UY,
  España: ES,
  Spain: ES,
  Inglaterra: GB,
  England: GB,
  Portugal: PT,
};

export function getCountryFlagComponent(country) {
  if (!country) return null;
  return FLAGS[country] || null;
}

export function CountryFlag({ country, fallback = null, ...props }) {
  const FlagComponent = getCountryFlagComponent(country);
  if (!FlagComponent) return fallback;
  return <FlagComponent title={country} {...props} />;
}
