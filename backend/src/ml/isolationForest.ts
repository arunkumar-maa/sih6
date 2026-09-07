// Isolation Forest — Unsupervised multi-dimensional anomaly detection
// Implements an ensemble of isolation trees (iTrees) to detect numerical outliers
// along with feature contribution attribution for transparent explainability.

export interface AnomalyFeatureVector {
  workId: string;
  sanctionAmount: number;
  totalPaid: number;
  disbursementRatio: number;      // 0 - 100+ %
  physicalProgress: number;       // 0 - 100 %
  progressMismatch: number;       // financialProgress - physicalProgress
  daysSinceSanction: number;      // days elapsed
  categoryNormalizedCost: number; // sanctionAmount / categoryMedian
}

export interface FeatureContribution {
  name: string;
  points: number;
  detail: string;
}

export interface IsolationForestResult {
  workId: string;
  anomalyScore: number;          // 0 - 100 (normalized)
  isAnomaly: boolean;            // score >= threshold
  contributions: FeatureContribution[];
}

interface IsolationTreeNode {
  splitFeature?: string;
  splitValue?: number;
  left?: IsolationTreeNode;
  right?: IsolationTreeNode;
  size: number;
  isLeaf: boolean;
}

const FEATURE_KEYS: (keyof Omit<AnomalyFeatureVector, 'workId'>)[] = [
  'sanctionAmount',
  'totalPaid',
  'disbursementRatio',
  'physicalProgress',
  'progressMismatch',
  'daysSinceSanction',
  'categoryNormalizedCost',
];

const FEATURE_LABELS: Record<string, string> = {
  progressMismatch: 'Progress Mismatch',
  categoryNormalizedCost: 'Category Cost Outlier',
  daysSinceSanction: 'Prolonged Sanction Duration',
  disbursementRatio: 'High Disbursement Ratio',
  sanctionAmount: 'Absolute Sanction Cost',
  totalPaid: 'Total Disbursed Volume',
  physicalProgress: 'Physical Completion Lag',
};

// Harmonic number approximation: c(n) = 2(ln(n - 1) + 0.5772156649) - (2(n - 1) / n)
function c(n: number): number {
  if (n <= 1) return 1;
  if (n === 2) return 1;
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
}

export class IsolationForest {
  private trees: IsolationTreeNode[] = [];
  private numTrees: number;
  private subSampleSize: number;
  private maxDepth: number;
  private cN: number;

  constructor(numTrees: number = 30, subSampleSize: number = 128) {
    this.numTrees = numTrees;
    this.subSampleSize = subSampleSize;
    this.maxDepth = Math.ceil(Math.log2(Math.max(subSampleSize, 2)));
    this.cN = c(subSampleSize);
  }

  public fit(data: AnomalyFeatureVector[]): void {
    if (!data || data.length === 0) return;

    this.trees = [];
    const sampleLimit = Math.min(data.length, this.subSampleSize);
    this.cN = c(sampleLimit);

    for (let t = 0; t < this.numTrees; t++) {
      const sample = this.getRandomSubsample(data, sampleLimit);
      const tree = this.buildTree(sample, 0);
      this.trees.push(tree);
    }
  }

  private getRandomSubsample(data: AnomalyFeatureVector[], size: number): AnomalyFeatureVector[] {
    const result: AnomalyFeatureVector[] = [];
    const chosen = new Set<number>();
    const n = data.length;
    const count = Math.min(size, n);

    while (chosen.size < count) {
      const idx = Math.floor(Math.random() * n);
      if (!chosen.has(idx)) {
        chosen.add(idx);
        result.push(data[idx]);
      }
    }
    return result;
  }

  private buildTree(data: AnomalyFeatureVector[], currentDepth: number): IsolationTreeNode {
    const node: IsolationTreeNode = {
      size: data.length,
      isLeaf: false,
    };

    if (currentDepth >= this.maxDepth || data.length <= 1) {
      node.isLeaf = true;
      return node;
    }

    const feature = FEATURE_KEYS[Math.floor(Math.random() * FEATURE_KEYS.length)];
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (const item of data) {
      const v = item[feature];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }

    if (minVal >= maxVal) {
      node.isLeaf = true;
      return node;
    }

    const splitVal = minVal + Math.random() * (maxVal - minVal);
    node.splitFeature = feature;
    node.splitValue = splitVal;

    const leftData = data.filter(d => d[feature] < splitVal);
    const rightData = data.filter(d => d[feature] >= splitVal);

    if (leftData.length === 0 || rightData.length === 0) {
      node.isLeaf = true;
      return node;
    }

    node.left = this.buildTree(leftData, currentDepth + 1);
    node.right = this.buildTree(rightData, currentDepth + 1);

    return node;
  }

  private pathLength(item: AnomalyFeatureVector, node: IsolationTreeNode, currentDepth: number): number {
    if (node.isLeaf || !node.splitFeature || node.splitValue === undefined) {
      return currentDepth + c(node.size);
    }

    const val = item[node.splitFeature as keyof AnomalyFeatureVector] as number;
    if (val < node.splitValue) {
      return node.left ? this.pathLength(item, node.left, currentDepth + 1) : currentDepth;
    } else {
      return node.right ? this.pathLength(item, node.right, currentDepth + 1) : currentDepth;
    }
  }

  public predict(item: AnomalyFeatureVector): IsolationForestResult {
    if (this.trees.length === 0) {
      return {
        workId: item.workId,
        anomalyScore: 0,
        isAnomaly: false,
        contributions: [],
      };
    }

    let totalPathLength = 0;
    for (const tree of this.trees) {
      totalPathLength += this.pathLength(item, tree, 0);
    }

    const avgPathLength = totalPathLength / this.trees.length;
    const rawScore = Math.pow(2, -avgPathLength / this.cN);
    const anomalyScore = Math.min(100, Math.max(0, Math.round(rawScore * 100)));

    const contributions = this.explainFeatureContributions(item, anomalyScore);

    return {
      workId: item.workId,
      anomalyScore,
      isAnomaly: anomalyScore >= 60,
      contributions,
    };
  }

  private explainFeatureContributions(item: AnomalyFeatureVector, totalScore: number): FeatureContribution[] {
    const rawContributions: { name: string; weight: number; detail: string }[] = [];

    if (item.progressMismatch > 20) {
      rawContributions.push({
        name: FEATURE_LABELS['progressMismatch'],
        weight: Math.min(40, item.progressMismatch * 0.8),
        detail: `Disbursement is ${item.progressMismatch.toFixed(1)}% ahead of physical progress`,
      });
    }

    if (item.categoryNormalizedCost > 1.8) {
      rawContributions.push({
        name: FEATURE_LABELS['categoryNormalizedCost'],
        weight: Math.min(35, (item.categoryNormalizedCost - 1) * 20),
        detail: `Sanctioned cost is ${item.categoryNormalizedCost.toFixed(1)}x category median`,
      });
    }

    if (item.daysSinceSanction > 180 && item.physicalProgress < 100) {
      rawContributions.push({
        name: FEATURE_LABELS['daysSinceSanction'],
        weight: Math.min(30, (item.daysSinceSanction / 365) * 15),
        detail: `Sanctioned ${item.daysSinceSanction} days ago without completion`,
      });
    }

    if (item.disbursementRatio > 85 && item.physicalProgress < 80) {
      rawContributions.push({
        name: FEATURE_LABELS['disbursementRatio'],
        weight: Math.min(25, (item.disbursementRatio - 70) * 0.8),
        detail: `${item.disbursementRatio.toFixed(1)}% disbursed while at ${item.physicalProgress}% physical progress`,
      });
    }

    const totalWeight = rawContributions.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) {
      return [
        {
          name: 'Baseline Operational Range',
          points: Math.min(totalScore, 10),
          detail: 'Metrics within standard parameters',
        },
      ];
    }

    return rawContributions.map(rc => ({
      name: rc.name,
      points: Math.max(1, Math.round((rc.weight / totalWeight) * totalScore)),
      detail: rc.detail,
    })).sort((a, b) => b.points - a.points);
  }
}

export function extractFeatureVector(
  workId: string,
  sanctionAmount: number | null,
  totalPaid: number | null,
  workStatus: string,
  daysSinceSanction: number | null,
  categoryMedian: number = 250000
): AnomalyFeatureVector {
  const sa = Math.max(0, sanctionAmount || 0);
  const tp = Math.max(0, totalPaid || 0);
  const disbRatio = sa > 0 ? (tp / sa) * 100 : 0;

  let physicalProgress = 10;
  const s = (workStatus || '').toLowerCase();
  if (s.includes('completed')) physicalProgress = 100;
  else if (s.includes('physical') || s.includes('inspection')) physicalProgress = 75;
  else if (s.includes('in progress') || s.includes('inprogress')) physicalProgress = 50;
  else if (s.includes('vendor')) physicalProgress = 20;
  else if (s.includes('sanction')) physicalProgress = 10;

  const financialProgress = Math.min(100, disbRatio);
  const progressMismatch = Math.max(0, financialProgress - physicalProgress);
  const days = Math.max(0, daysSinceSanction || 0);
  const catNorm = categoryMedian > 0 ? sa / categoryMedian : 1;

  return {
    workId,
    sanctionAmount: sa,
    totalPaid: tp,
    disbursementRatio: disbRatio,
    physicalProgress,
    progressMismatch,
    daysSinceSanction: days,
    categoryNormalizedCost: catNorm,
  };
}

