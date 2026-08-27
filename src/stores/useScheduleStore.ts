import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Equipment, Schedule } from "../types";

type scheduleStore = {
  showModal: boolean;
  equipmentSelected: Equipment | null;
  schedule: Schedule | null;

  setShowModal: (show: boolean) => void;
  setEquipmentSelected: (equipment: Equipment) => void;
  setSchedule: (data: Schedule) => void;
};

const useScheduleStore = create<scheduleStore>()(
  persist(
    (set) => ({
      showModal: false,
      equipmentSelected: null,
      schedule: null,

      setShowModal: (show) => set({ showModal: show }),
      setEquipmentSelected: (equipment) =>
        set({ equipmentSelected: equipment }),
      setSchedule: (schedule) => set({ schedule }),
    }),
    {
      name: "wo-schedule-storage",
    },
  ),
);

export default useScheduleStore;
