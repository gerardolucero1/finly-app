import { Profile } from '@/models/profile';
import { create } from 'zustand';

interface ProfileState {
    profile: Profile | null;
    setProfile: (profile: Profile) => void;
    updateProfilePicture: (url: string) => void;
    logout: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    setProfile: (profile: Profile) => set({ profile }),
    updateProfilePicture: (url: string) =>
        set((state) => ({
            profile: state.profile
                ? { ...state.profile, profile_photo_url: url }
                : null
        })),
    logout: () => set({ profile: null })
}));
