import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewStore = {
  selectedFamily: String | null;
  selectedSubtype: String | null;

  setSelectedFamily: (familly: string | null) => void;
  setSelectedSubtype: (subtype: string | null) => void;
};

const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      selectedFamily: null,
      selectedSubtype: null,

      setSelectedFamily: (family) => set({ selectedFamily: family }),
      setSelectedSubtype: (subtype) => set({ selectedSubtype: subtype }),
    }),
    { name: "wo-view-storage" },
  ),
);

export default useViewStore;
