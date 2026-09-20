import React from 'react';
import { useAppStore } from '../store/store';
import { useAuthStore } from '../store/authStore';
import { ComparativeIntelligence } from '../components/ComparativeIntelligence';

export function ComparativeIntelligencePage() {
  const { activeHouse } = useAppStore();
  const { profile } = useAuthStore();

  const isStateNodal = profile?.role === 'STATE_NODAL_OFFICER';
  const lockedState = isStateNodal ? (profile.state || undefined) : undefined;

  return (
    <div className="w-full space-y-6">
      <ComparativeIntelligence
        activeHouse={activeHouse}
        lockedState={lockedState}
        initialMode={isStateNodal ? 'district' : undefined}
        allowedModes={isStateNodal ? ['district', 'category', 'fy', 'house'] : undefined}
        title={isStateNodal ? `${lockedState} — District Comparative Intelligence` : undefined}
        subtitle={isStateNodal ? `Compare MPLADS performance metrics between districts and categories within ${lockedState}.` : undefined}
      />
    </div>
  );
}

export default ComparativeIntelligencePage;
