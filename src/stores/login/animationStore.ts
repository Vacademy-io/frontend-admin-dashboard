import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AnimationStore {
    hasSeenAnimation: boolean;
    setHasSeenAnimation: () => void;
}

export const useAnimationStore = create<AnimationStore>()(
    persist(
        (set) => ({
            hasSeenAnimation: false,
            setHasSeenAnimation: () => set({ hasSeenAnimation: true }),
        }),
        {
            name: "animation-storage", // name of the item in the storage (must be unique)
        },
    ),
);
