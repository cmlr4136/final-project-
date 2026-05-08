import { create } from "zustand";

type SettingsState = {
  unit: "kg" | "lbs";
  setUnit: (unit: "kg" | "lbs") => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  unit: "kg",
  setUnit: (unit) => set({ unit }),
}));