import { create } from "zustand";

type ShowMessageOptions = {
  title?: string;
  message: string;
  type?: "info" | "confirm" | "danger";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (() => void) | null;
  onCancel?: () => void;
};

type GralStore = {
  show: boolean;
  title: string;
  message: string;
  type: "info" | "confirm" | "danger";
  confirmText: string;
  cancelText: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;

  showMessage: (options: ShowMessageOptions) => void;
  closeMessage: () => void;
};

const useGralStore = create<GralStore>()((set, get) => ({
  show: false,
  title: "Aviso",
  message: "",
  type: "info",
  confirmText: "Aceptar",
  cancelText: "Cancelar",
  onConfirm: null,
  onCancel: null,

  showMessage: ({
    title = "Aviso",
    message,
    type = "info",
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    onConfirm = null,
    onCancel = null,
  }) =>
    set({
      show: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    }),

  closeMessage: () => {
    const { onCancel } = get();
    if (onCancel) onCancel();

    set({ show: false, onConfirm: null, onCancel: null });
  },
}));

export default useGralStore;
