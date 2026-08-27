import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Equipment,
  CreateWorkOrderPayload,
  CreateTaskPayload,
} from "../types";

type workOrderStore = {
  workOrderData: CreateWorkOrderPayload;
  equipmentSelected: Equipment | null;
  showModal: boolean;
  showClosed: boolean;

  setShowClosed: (value: boolean) => void;
  setShowModal: (show: boolean) => void;
  setEquipmentSelected: (equip: Equipment) => void;
  setWorkOrderField: <K extends keyof CreateWorkOrderPayload>(
    key: K,
    value: CreateWorkOrderPayload[K],
  ) => void;
  addTask: (task: CreateTaskPayload) => void;
  removeTask: (indexToRemove: number) => void;
  resetWorkOrder: () => void;
};

const initialData: CreateWorkOrderPayload = {
  equipmentId: null,
  orderType: "PREVENTIVE",
  tasks: [],
  createdBy: "",
};

const useWorkOrderStore = create<workOrderStore>()(
  persist(
    (set) => ({
      workOrderData: initialData,
      equipmentSelected: null,
      showModal: false,
      showClosed: false,

      setShowClosed: (value) => set({ showClosed: value }),
      setShowModal: (show) => set({ showModal: show }),
      setEquipmentSelected: (equip) => set({ equipmentSelected: equip }),
      setWorkOrderField: (key, value) =>
        set((state) => ({
          workOrderData: { ...state.workOrderData, [key]: value },
        })),
      // Agregar una tarea al array
      addTask: (newTask) =>
        set((state) => ({
          workOrderData: {
            ...state.workOrderData,
            tasks: [...state.workOrderData.tasks, newTask],
          },
        })),

      // Eliminar tarea por índice
      removeTask: (indexToRemove) =>
        set((state) => ({
          workOrderData: {
            ...state.workOrderData,
            tasks: state.workOrderData.tasks.filter(
              (_, idx) => idx !== indexToRemove,
            ),
          },
        })),

      // Resetear todo al cerrar modal o guardar exitosamente
      resetWorkOrder: () =>
        set({
          workOrderData: initialData,
        }),
    }),
    {
      name: "workOrder-storage",
    },
  ),
);

export default useWorkOrderStore;
