// Rajya Sabha Dataset Loader
// Completely isolated from Lok Sabha. NEVER mix with Lok Sabha data.

import {
  parseSanctionedWorks,
  parseRecommendedWorks,
  parseCompletedWorks,
  parseExpenditure,
  parseAllocatedLimit,
  parseCalamity,
} from './parser';
import { processDatasets } from './processor';
import type { EnrichedProject } from './types';

// ─── Rajya Sabha CSV Imports ─────────────────────────────────────────────────
// These are imported lazily via dynamic import to avoid bundling both large datasets at startup.

let _rajyaSabhaProjects: EnrichedProject[] | null = null;
let _loading = false;
let _loadPromise: Promise<EnrichedProject[]> | null = null;

/**
 * Lazily loads and returns Rajya Sabha projects.
 * Safe to call multiple times — will only load once.
 * All returned projects are tagged with house: 'Rajya Sabha'.
 */
export async function loadRajyaSabhaDatasets(): Promise<EnrichedProject[]> {
  // Return cached result if already loaded
  if (_rajyaSabhaProjects !== null) {
    return _rajyaSabhaProjects;
  }

  // Return in-progress promise if already loading
  if (_loadPromise) {
    return _loadPromise;
  }

  _loading = true;
  _loadPromise = (async () => {
    try {
      // Dynamic imports of Rajya Sabha CSVs — loaded on demand only
      const [
        sanctionedMod,
        recommendedMod,
        completedMod,
        expenditureMod,
        allocatedMod,
      ] = await Promise.all([
        import('../../rajya_sabha_dataset/Works Sanctioned (2).csv?raw'),
        import('../../rajya_sabha_dataset/Works Recommended (2).csv?raw'),
        import('../../rajya_sabha_dataset/Works Completed (2).csv?raw'),
        import('../../rajya_sabha_dataset/Expenditure on Completed and On-going Works as on Date (2).csv?raw'),
        import('../../rajya_sabha_dataset/Allocated Limit for Honble MPs (2).csv?raw'),
      ]);

      const sanctionedCsv: string = sanctionedMod.default;
      const recommendedCsv: string = recommendedMod.default;
      const completedCsv: string = completedMod.default;
      const expenditureCsv: string = expenditureMod.default;
      const allocatedCsv: string = allocatedMod.default;

      const sanctioned = parseSanctionedWorks(sanctionedCsv);
      const recommended = parseRecommendedWorks(recommendedCsv);
      const completedList = parseCompletedWorks(completedCsv);
      const expenditureList = parseExpenditure(expenditureCsv);
      const allocated = parseAllocatedLimit(allocatedCsv);

      const result = processDatasets(
        sanctioned,
        recommended,
        completedList,
        expenditureList,
        allocated,
        'Rajya Sabha'   // Tag every record — NEVER 'Lok Sabha'
      );

      // Safety check: ensure no project slipped through without house tag
      const verified = result.projects.filter(p => p.house === 'Rajya Sabha');
      if (verified.length !== result.projects.length) {
        console.warn(`[RajyaSabha] ${result.projects.length - verified.length} projects missing house tag — filtered out`);
      }

      _rajyaSabhaProjects = verified;
      _loading = false;

      console.log(`[RajyaSabha] Loaded ${verified.length} projects`);
      return verified;
    } catch (err) {
      _loading = false;
      _loadPromise = null; // Allow retry on error
      throw err;
    }
  })();

  return _loadPromise;
}

export function isRajyaSabhaLoaded(): boolean {
  return _rajyaSabhaProjects !== null;
}

export function isRajyaSabhaLoading(): boolean {
  return _loading;
}

export function getCachedRajyaSabhaProjects(): EnrichedProject[] {
  return _rajyaSabhaProjects ?? [];
}
