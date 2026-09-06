/**
 * Robust Geographic Normalization & Matching Utility for MPLADS Sentinel
 * Resolves naming differences between official government CSV datasets and GeoJSON geometries.
 */

import type { EnrichedProject } from '../data/types';

/**
 * Normalizes an Indian State / UT name for consistent matching
 */
export function normalizeStateName(st?: string | null): string {
  if (!st) return '';
  let s = st.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (s.includes('andaman') && s.includes('nicobar')) return 'andamanandnicobar';
  if (s.includes('jammu') && s.includes('kashmir')) return 'jammuandkashmir';
  if (s === 'delhi' || s === 'nctofdelhi' || s === 'nationalcapitalterritoryofdelhi') return 'delhi';
  if (s === 'odisha' || s === 'orissa') return 'odisha';
  if (s === 'pondicherry' || s === 'puducherry') return 'puducherry';
  if (s === 'uttaranchal' || s === 'uttarakhand') return 'uttarakhand';
  if (s.includes('dadra') || s.includes('daman') || s.includes('diu')) return 'dadranagarhavelianddamananddiu';

  return s;
}

/**
 * Normalizes an Indian Parliamentary Constituency name:
 * - Strips state suffixes used in official CSV disambiguation (_UP, _HP, _BR, _MH, _RJ, etc.)
 * - Strips reservation suffixes: (SC), (ST), [SC], [ST], - SC, - ST, etc.
 * - Standardizes alphanumeric characters
 */
export function normalizeConstituencyName(pc?: string | null): string {
  if (!pc) return '';
  let s = pc.trim();

  // Strip state suffix codes used by MPLADS portal to distinguish identically named PCs across states
  // e.g., HAMIRPUR_UP, HAMIRPUR_HP, AURANGABAD_BR, AURANGABAD_MH, MAHARAJGANJ_UP
  s = s.replace(/_(up|hp|br|mh|rj|ka|mp|ap|ts|wb|pb|hr|gj|as|or|ct|jh)\b/gi, '');

  // Strip (SC), (ST), (sc), (st), [SC], [ST], - SC, - ST
  s = s.replace(/[\(\[\{]\s*(sc|st)\s*[\)\]\}]/gi, ' ');
  s = s.replace(/\s+(sc|st)$/gi, ' ');

  // Lowercase & remove all punctuation, hyphens, spaces, apostrophes
  return s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Controlled Alias Dictionary for genuine spelling & delimitation variations
 * Structure: [normalizedState]: { [normalizedDatasetName]: canonicalGeoJsonName }
 */
export const CONSTITUENCY_ALIASES: Record<string, Record<string, string>> = {
  andhrapradesh: {
    anantapur: 'anantapuramu',
    anakapalle: 'anakapalli',
    narasapuram: 'narsapuram',
  },
  assam: {
    guwahati: 'gauhati',
    nowgong: 'nowgong',
    diphu: 'autonomousdistrict',      // 2023 delimitation rename
    sonitpur: 'tezpur',               // 2023 delimitation rename
    darrangudalguri: 'mangaldoi',     // 2023 delimitation rename
    kaziranga: 'kaliabor',            // 2023 delimitation rename
  },
  bihar: {
    jahanabad: 'jahanabad',
    purbichamparan: 'purvichamparan',
    purnea: 'purnia',
    ujjarpur: 'ujiarpur',
  },
  chhattisgarh: {
    janjgirchampa: 'janjgir',
    sarguja: 'surguja',
  },
  dadranagarhavelianddamananddiu: {
    dadranagarhaveli: 'dadraandnagarhaveli',
  },
  delhi: {
    chandinichowk: 'chandnichowk',
  },
  gujarat: {
    chhotaudepur: 'chhotaudaipur',
    panchmahal: 'panchmahal',
  },
  haryana: {
    sonepat: 'sonipat',
    gurugram: 'gurgaon',
    hisar: 'hisar',
  },
  jammuandkashmir: {
    baramullah: 'baramulla',
  },
  karnataka: {
    bangalorerural: 'bangalorerural',
    bengalururural: 'bangalorerural',
    bangalorecentral: 'bangalorecentral',
    bengalurucentral: 'bangalorecentral',
    bangalorenorth: 'bangalorenorth',
    bengalurunorth: 'bangalorenorth',
    bangaloresouth: 'bangaloresouth',
    bengalurusouth: 'bangaloresouth',
    belgaum: 'belagavi',
    bellary: 'bellary',
    chikkaballapur: 'chikballapur',
    chikkballapur: 'chikballapur',
    chikkodi: 'chikodi',
    chikmagalur: 'udupichikmagalur',
    davanagere: 'davangere',
    gulbarga: 'gulbarga',
    hassan: 'haasan',
    mysuru: 'mysore',
    mysore: 'mysore',
    shivamogga: 'shimoga',
    tumakuru: 'tumkur',
  },
  kerala: {
    atteningal: 'attingal',
    chalakkudy: 'chalakudy',
    mavelikkara: 'mavelikara',
    vadakara: 'vadakara',
    kannur: 'kannur',
    kasaragod: 'kasaragod',
  },
  madhyapradesh: {
    mandsour: 'mandsaur',
  },
  maharashtra: {
    ahmednagar: 'ahmednagar',
    buldhana: 'buldhana',
    mumbaisouthcentral: 'mumbaisouth', // GeoJSON merges Mumbai South
  },
  odisha: {
    balasore: 'balasore',
    berhampur: 'berhampur',
    jajpur: 'jajpur',
    nabarangpur: 'nabarangpur',
  },
  punjab: {
    bhatinda: 'bathinda',
    firozpur: 'firozepur',
  },
  tamilnadu: {
    dharamapuri: 'dharmapuri',
    kanniyakumari: 'kanyakumari',
    mayiladuthurai: 'mayiladuturai',
    thoothukkudi: 'thoothukudi',
    tiruvallur: 'thiruvallur',
    tiruchirappalli: 'tiruchirappalli',
  },
  telangana: {
    bhongir: 'bhuvanagiri',
    chelvella: 'chevella',
    peddapalle: 'peddapalli',
    warangel: 'warangal',
  },
  uttarakhand: {
    hardwar: 'haridwar',
    nainitaludhamsinghnag: 'nainitaludhamsinghnagar',
    nainitaludhamsinghnagar: 'nainitaludhamsinghnagar',
  },
  westbengal: {
    arambag: 'arambagh',
    barrackpur: 'barrackpore',
    coochbehar: 'coochbehar',
    joynagar: 'jaynagar',
    serampore: 'sreerampur',
  },
};

export interface GeoIndex {
  /** Find matching GeoJSON feature for a Lok Sabha or Rajya Sabha project */
  getFeatureKey: (state?: string, constituency?: string) => string | null;
  /** Get feature by canonical key */
  getFeature: (key: string) => any | null;
  /** Map of all indexed feature keys to feature properties */
  allKeys: string[];
}

/**
 * Builds an O(1) in-memory index of GeoJSON features for fast lookup across 65,000+ records
 */
export function buildGeoIndex(
  geoJson: any,
  house: 'Lok Sabha' | 'Rajya Sabha'
): GeoIndex {
  const featureMap = new Map<string, any>();
  const pcOnlyMap = new Map<string, { stateNorm: string; key: string }[]>();

  if (!geoJson || !geoJson.features) {
    return {
      getFeatureKey: () => null,
      getFeature: () => null,
      allKeys: [],
    };
  }

  for (const f of geoJson.features) {
    const props = f.properties || {};

    if (house === 'Lok Sabha') {
      const sNorm = normalizeStateName(props.st_name);
      const pcNorm = normalizeConstituencyName(props.pc_name);
      const key = `${sNorm}|||${pcNorm}`;

      featureMap.set(key, f);

      if (!pcOnlyMap.has(pcNorm)) {
        pcOnlyMap.set(pcNorm, []);
      }
      pcOnlyMap.get(pcNorm)!.push({ stateNorm: sNorm, key });
    } else {
      // Rajya Sabha: State level index
      const stateName = props.st_nm || props.NAME_1 || props.st_name || props.state || props.name;
      const sNorm = normalizeStateName(stateName);
      if (sNorm) {
        featureMap.set(sNorm, f);
      }
    }
  }

  const getFeatureKey = (state?: string, constituency?: string): string | null => {
    if (house === 'Rajya Sabha') {
      const sNorm = normalizeStateName(state);
      return featureMap.has(sNorm) ? sNorm : null;
    }

    // Lok Sabha matching priority
    const sNorm = normalizeStateName(state);
    let pcNorm = normalizeConstituencyName(constituency);

    if (!pcNorm) return null;

    // Check Alias Table
    if (sNorm && CONSTITUENCY_ALIASES[sNorm] && CONSTITUENCY_ALIASES[sNorm][pcNorm]) {
      pcNorm = CONSTITUENCY_ALIASES[sNorm][pcNorm];
    }

    // Priority 1: Exact State + Constituency match
    const compositeKey = `${sNorm}|||${pcNorm}`;
    if (featureMap.has(compositeKey)) {
      return compositeKey;
    }

    // Priority 2: Unambiguous PC within the same state
    const candidates = pcOnlyMap.get(pcNorm);
    if (candidates && candidates.length > 0) {
      if (sNorm) {
        const stateMatch = candidates.find(c => c.stateNorm === sNorm);
        if (stateMatch) return stateMatch.key;
      }
      // Globally unambiguous constituency name across India
      if (candidates.length === 1) {
        return candidates[0].key;
      }
    }

    return null;
  };

  return {
    getFeatureKey,
    getFeature: (key: string) => featureMap.get(key) || null,
    allKeys: Array.from(featureMap.keys()),
  };
}

/**
 * Log development diagnostics for matching quality
 */
export function logGeoMatchingDiagnostics(
  projects: EnrichedProject[],
  geoIndex: GeoIndex,
  house: 'Lok Sabha' | 'Rajya Sabha'
) {
  if (typeof window !== 'undefined' && (import.meta as any).env?.PROD) return;

  const unmatched = new Set<string>();
  let matchedRecords = 0;

  for (const p of projects) {
    const key = geoIndex.getFeatureKey(p.state, p.constituency || p.district);
    if (key) {
      matchedRecords++;
    } else {
      unmatched.add(`${p.state} | ${p.constituency || p.district}`);
    }
  }

  const total = projects.length;
  const matchRate = total > 0 ? ((matchedRecords / total) * 100).toFixed(1) : '0';

  console.groupCollapsed(`[MPLADS GIS Diagnostics] ${house} Matching: ${matchedRecords}/${total} records (${matchRate}%)`);
  console.log(`Total Projects: ${total}`);
  console.log(`Matched Records: ${matchedRecords}`);
  console.log(`Unmatched Records: ${total - matchedRecords}`);
  console.log(`Unmatched Distinct Regions: ${unmatched.size}`);
  if (unmatched.size > 0) {
    console.warn('Unmatched source entries:', Array.from(unmatched).slice(0, 20));
  }
  console.groupEnd();
}
