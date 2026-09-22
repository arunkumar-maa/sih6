import type { EnrichedProject } from '../types/index.js';

const STOPWORDS = new Set([
  'the','of','in','at','to','for','and','a','an','on','with','under',
  'construction','work','works','village','road','panchayat','district',
]);

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

function buildTfIdf(docs: string[][]): Map<string, number>[] {
  const df = new Map<string, number>();
  docs.forEach(tokens => new Set(tokens).forEach(t => df.set(t, (df.get(t) ?? 0) + 1)));
  const N = docs.length;
  return docs.map(tokens => {
    const tf = new Map<string, number>();
    tokens.forEach(t => tf.set(t, (tf.get(t) ?? 0) + 1));
    const vec = new Map<string, number>();
    tf.forEach((count, term) => {
      const idf = Math.log((N + 1) / ((df.get(term) ?? 0) + 1)) + 1;
      vec.set(term, (count / tokens.length) * idf);
    });
    return vec;
  });
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  a.forEach((val, key) => { dot += val * (b.get(key) ?? 0); normA += val * val; });
  b.forEach(val => { normB += val * val; });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function normalizeCategory(cat: string): string {
  const dashIdx = (cat || '').indexOf('-');
  if (dashIdx !== -1 && dashIdx < cat.length - 1) {
    return cat.slice(dashIdx + 1).trim().toLowerCase();
  }
  return (cat || '').trim().toLowerCase();
}

export interface DuplicateMatch {
  workId: string;
  similarity: number;
}

export function detectDuplicates(
  projects: EnrichedProject[],
  threshold = 0.6
): Map<string, DuplicateMatch> {
  const results = new Map<string, DuplicateMatch>();
  const buckets = new Map<string, EnrichedProject[]>();

  for (const p of projects) {
    const locality = p.constituency || p.district;
    const cat = normalizeCategory(p.workCategory);
    if (!p.workDescription || !locality || !cat) continue;
    const key = `${p.state}|||${locality}|||${cat}`.toLowerCase();
    const arr = buckets.get(key) ?? [];
    arr.push(p);
    buckets.set(key, arr);
  }

  buckets.forEach(group => {
    if (group.length < 2) return;
    const vectors = buildTfIdf(group.map(p => tokenize(p.workDescription)));
    for (let i = 0; i < group.length; i++) {
      let best = { workId: '', similarity: 0 };
      for (let j = 0; j < group.length; j++) {
        if (i === j || group[i].workId === group[j].workId) continue; // prevent self-comparison
        const sim = cosineSimilarity(vectors[i], vectors[j]);
        if (sim > best.similarity) best = { workId: group[j].workId, similarity: sim };
      }
      if (best.similarity >= threshold) results.set(group[i].workId, best);
    }
  });

  return results;
}

export interface SimilarWorkPair {
  workId1: string;
  workId2: string;
  similarity: number;
}

/**
 * Returns canonical pairs of potential similar work (min(workA, workB), max(workA, workB))
 * eliminating duplicate A->B and B->A pairs and preventing self-comparison.
 */
export function detectSimilarWorkPairs(
  projects: EnrichedProject[],
  threshold = 0.6
): SimilarWorkPair[] {
  const pairMap = new Map<string, SimilarWorkPair>();
  const buckets = new Map<string, EnrichedProject[]>();

  for (const p of projects) {
    const locality = p.constituency || p.district;
    const cat = normalizeCategory(p.workCategory);
    if (!p.workDescription || !locality || !cat) continue;
    const key = `${p.state}|||${locality}|||${cat}`.toLowerCase();
    const arr = buckets.get(key) ?? [];
    arr.push(p);
    buckets.set(key, arr);
  }

  buckets.forEach(group => {
    if (group.length < 2) return;
    const vectors = buildTfIdf(group.map(p => tokenize(p.workDescription)));
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (group[i].workId === group[j].workId) continue;
        const sim = cosineSimilarity(vectors[i], vectors[j]);
        if (sim >= threshold) {
          const idA = group[i].workId < group[j].workId ? group[i].workId : group[j].workId;
          const idB = group[i].workId < group[j].workId ? group[j].workId : group[i].workId;
          const pairKey = `${idA}:::${idB}`;
          const existing = pairMap.get(pairKey);
          if (!existing || sim > existing.similarity) {
            pairMap.set(pairKey, { workId1: idA, workId2: idB, similarity: Math.round(sim * 100) / 100 });
          }
        }
      }
    }
  });

  return Array.from(pairMap.values());
}
