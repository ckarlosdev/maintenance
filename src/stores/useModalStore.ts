import { create } from "zustand";
import type { Equipment } from "../types";

export type ModalType =
  | "ISSUE"
  | "SCHEDULE"
  | "MAINTENANCE"
  | "SCHEDULE_CREATION"
  | "KPI_DETAILS"
  | "NEW_TASK"
  | "WORK_ORDER_DETAIL";

// 2. Tipamos la estructura del store
type ModalStore = {
  activeModal: ModalType | null;
  equipmentSelected: Equipment | null;
  data: any;

  // Acciones
  setEquipmentSelected: (equipment: Equipment | null) => void;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  equipmentSelected: null,
  data: null,

  setEquipmentSelected: (equipment) => set({ equipmentSelected: equipment }),
  openModal: (type, data = null) => set({ activeModal: type, data }),
  closeModal: () => set({ activeModal: null, data: null }),
}));
