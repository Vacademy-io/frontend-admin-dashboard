import create from "zustand";

interface navHeadingState {
    navHeading: string;
    setNavHeading: (newNavHeading: string) => void;
}

export const useNavHeadingStore = create<navHeadingState>((set) => ({
    navHeading: "",
    setNavHeading: (newNavHeading) => set({ navHeading: newNavHeading }),
}));
