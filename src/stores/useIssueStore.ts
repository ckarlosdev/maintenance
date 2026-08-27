import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Equipment, EquipmentIssueSummary } from "../types";

type issueStore = {
  showModal: boolean;
  issues: EquipmentIssueSummary[];
  equipmentSelected: Equipment | null;

  setShowModal: (show: boolean) => void;
  setIssues: (issues: EquipmentIssueSummary[]) => void;
  setEquipmentSelected: (equipment: Equipment) => void;
};

const useIssueStore = create<issueStore>()(
  persist(
    (set) => ({
      showModal: false,
      issues: [],
      equipmentSelected: null,

      setShowModal: (show) => set({ showModal: show }),
      setIssues: (issues) => set({ issues }),
      setEquipmentSelected: (equipment) =>
        set({ equipmentSelected: equipment }),
    }),
    {
      name: "wo-issue-storage",
    },
  ),
);

export default useIssueStore;
