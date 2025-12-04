import { useProfileStore } from '@/app/store';
import { FeatureKey, PlanFeatures, PLANS } from '@/constants/plans';

export function useUserFeatures() {
    const profile = useProfileStore((state) => state.profile);

    const getPlanId = (): string => {
        return profile?.subscription?.stripe_price || 'free';
    };

    const getPlanFeatures = (): PlanFeatures => {
        const planId = getPlanId();
        return PLANS[planId] || PLANS['free'];
    };

    const hasFeature = (feature: FeatureKey): boolean => {
        const features = getPlanFeatures();
        const value = features[feature];

        if (typeof value === 'boolean') {
            return value;
        }
        // For numbers, usually 0 means no access. -1 means infinite. > 0 means limited access.
        return value !== 0;
    };

    const getFeatureLimit = (feature: keyof PlanFeatures): number => {
        const features = getPlanFeatures();
        const value = features[feature];
        if (typeof value === 'number') {
            return value;
        }
        return value ? 1 : 0; // Fallback for booleans if misused
    };

    return {
        hasFeature,
        getFeatureLimit,
        currentPlan: getPlanId(),
        features: getPlanFeatures(),
    };
}
