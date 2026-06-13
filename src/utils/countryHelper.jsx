

/**
 * Central dictionary mapping tournament country codes (short name) to full names, emoji fallbacks, and ISO-2 codes for images.
 */
export const countries = {
  ARG: { name: 'Argentina', flag: '🇦🇷', iso2: 'ar' },
  ALG: { name: 'Algeria', flag: '🇩🇿', iso2: 'dz' },
  AUS: { name: 'Australia', flag: '🇦🇺', iso2: 'au' },
  AUT: { name: 'Austria', flag: '🇦🇹', iso2: 'at' },
  BEL: { name: 'Belgium', flag: '🇧🇪', iso2: 'be' },
  BIH: { name: 'Bosnia and Herzegovina', flag: '🇧🇦', iso2: 'ba' },
  BRA: { name: 'Brazil', flag: '🇧🇷', iso2: 'br' },
  CAN: { name: 'Canada', flag: '🇨🇦', iso2: 'ca' },
  CHI: { name: 'Chile', flag: '🇨🇱', iso2: 'cl' },
  CIV: { name: 'Ivory Coast', flag: '🇨🇮', iso2: 'ci' },
  CMR: { name: 'Cameroon', flag: '🇨🇲', iso2: 'cm' },
  COD: { name: 'DR Congo', flag: '🇨🇩', iso2: 'cd' },
  COL: { name: 'Colombia', flag: '🇨🇴', iso2: 'co' },
  CPV: { name: 'Cape Verde', flag: '🇨🇻', iso2: 'cv' },
  CRO: { name: 'Croatia', flag: '🇭🇷', iso2: 'hr' },
  CZE: { name: 'Czechia', flag: '🇨🇿', iso2: 'cz' },
  DEN: { name: 'Denmark', flag: '🇩🇰', iso2: 'dk' },
  ECU: { name: 'Ecuador', flag: '🇪🇨', iso2: 'ec' },
  EGY: { name: 'Egypt', flag: '🇪🇬', iso2: 'eg' },
  ENG: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', iso2: 'gb-eng' },
  ESP: { name: 'Spain', flag: '🇪🇸', iso2: 'es' },
  FRA: { name: 'France', flag: '🇫🇷', iso2: 'fr' },
  GER: { name: 'Germany', flag: '🇩🇪', iso2: 'de' },
  GHA: { name: 'Ghana', flag: '🇬🇭', iso2: 'gh' },
  HAI: { name: 'Haiti', flag: '🇭🇹', iso2: 'ht' },
  HUN: { name: 'Hungary', flag: '🇭🇺', iso2: 'hu' },
  IRQ: { name: 'Iraq', flag: '🇮🇶', iso2: 'iq' },
  IRN: { name: 'Iran', flag: '🇮🇷', iso2: 'ir' },
  ITA: { name: 'Italy', flag: '🇮🇹', iso2: 'it' },
  JOR: { name: 'Jordan', flag: '🇯🇴', iso2: 'jo' },
  JPN: { name: 'Japan', flag: '🇯🇵', iso2: 'jp' },
  KOR: { name: 'South Korea', flag: '🇰🇷', iso2: 'kr' },
  KOS: { name: 'Kosovo', flag: '🇽🇰', iso2: 'xk' },
  KSA: { name: 'Saudi Arabia', flag: '🇸🇦', iso2: 'sa' },
  MAR: { name: 'Morocco', flag: '🇲🇦', iso2: 'ma' },
  MEX: { name: 'Mexico', flag: '🇲🇽', iso2: 'mx' },
  NED: { name: 'Netherlands', flag: '🇳🇱', iso2: 'nl' },
  NGA: { name: 'Nigeria', flag: '🇳🇬', iso2: 'ng' },
  NOR: { name: 'Norway', flag: '🇳🇴', iso2: 'no' },
  NZL: { name: 'New Zealand', flag: '🇳🇿', iso2: 'nz' },
  PAN: { name: 'Panama', flag: '🇵🇦', iso2: 'pa' },
  PAR: { name: 'Paraguay', flag: '🇵🇾', iso2: 'py' },
  PER: { name: 'Peru', flag: '🇵🇪', iso2: 'pe' },
  POL: { name: 'Poland', flag: '🇵🇱', iso2: 'pl' },
  POR: { name: 'Portugal', flag: '🇵🇹', iso2: 'pt' },
  QAT: { name: 'Qatar', flag: '🇶🇦', iso2: 'qa' },
  ROU: { name: 'Romania', flag: '🇷🇴', iso2: 'ro' },
  RSA: { name: 'South Africa', flag: '🇿🇦', iso2: 'za' },
  RUS: { name: 'Russia', flag: '🇷🇺', iso2: 'ru' },
  SCO: { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', iso2: 'gb-sct' },
  SEN: { name: 'Senegal', flag: '🇸🇳', iso2: 'sn' },
  SUI: { name: 'Switzerland', flag: '🇨🇭', iso2: 'ch' },
  SWE: { name: 'Sweden', flag: '🇸🇪', iso2: 'se' },
  TUN: { name: 'Tunisia', flag: '🇹🇳', iso2: 'tn' },
  TUR: { name: 'Turkey', flag: '🇹🇷', iso2: 'tr' },
  UAE: { name: 'UAE', flag: '🇦🇪', iso2: 'ae' },
  UKR: { name: 'Ukraine', flag: '🇺🇦', iso2: 'ua' },
  URU: { name: 'Uruguay', flag: '🇺🇾', iso2: 'uy' },
  USA: { name: 'USA', flag: '🇺🇸', iso2: 'us' },
  UZB: { name: 'Uzbekistan', flag: '🇺🇿', iso2: 'uz' },
  CUW: { name: 'Curaçao', flag: '🇨🇼', iso2: 'cw' },
  UEFA_A: { name: 'Bosnia and Herzegovina', flag: '🇧🇦', iso2: 'ba' },
  UEFA_B: { name: 'Sweden', flag: '🇸🇪', iso2: 'se' },
  UEFA_C: { name: 'Turkey', flag: '🇹🇷', iso2: 'tr' },
  UEFA_D: { name: 'Czechia', flag: '🇨🇿', iso2: 'cz' },
  IC_1: { name: 'DR Congo', flag: '🇨🇩', iso2: 'cd' },
  IC_2: { name: 'Iraq', flag: '🇮🇶', iso2: 'iq' },
  TBD: { name: 'TBD', flag: '🏳️', iso2: null }
};

/**
 * Get the flag component of a country by its code (short name).
 * Returns a stylized img tag pointing to flagcdn.com.
 * @param {string} code 
 * @param {string} customClass Tailwind dimensions class (e.g. "w-8 h-5")
 * @returns {React.ReactElement} Image tag or placeholder
 */
export const getCountryFlag = (code, customClass = "w-8 h-5.5 sm:w-10 sm:h-7") => {
  if (!code) return <span className="text-sm">🏳️</span>;
  const cleanCode = code.toUpperCase().trim();
  const country = countries[cleanCode];
  
  if (!country || !country.iso2) {
    return <span className="text-sm">🏳️</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${country.iso2}.png`}
      alt={country.name}
      className={`inline-block object-cover rounded-[3px] border border-slate-700/10 dark:border-slate-300/10 shadow-sm align-middle ${customClass}`}
      onError={(e) => {
        // If flagcdn fails, fallback to standard text emoji flag
        e.target.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = country.flag || '🏳️';
        e.target.parentNode.appendChild(fallback);
      }}
    />
  );
};

/**
 * Get the full name of a country by its code (short name).
 * @param {string} code 
 * @returns {string} full country name or original code
 */
export const getCountryName = (code) => {
  if (!code) return 'TBD';
  const cleanCode = code.toUpperCase().trim();
  return countries[cleanCode]?.name || code;
};
