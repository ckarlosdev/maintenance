import { Modal, Button } from "react-bootstrap";
import useGralStore from "../stores/useGralStore";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaQuestionCircle,
} from "react-icons/fa";

export const GlobalMessageBox = () => {
  const {
    show,
    title,
    message,
    type,
    confirmText,
    cancelText,
    onConfirm,
    closeMessage,
  } = useGralStore();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    useGralStore.setState({ show: false, onConfirm: null, onCancel: null });
  };

  const isConfirm = type === "confirm" || type === "danger";

  // Configuración de iconos y colores según el tipo
  const getTypeConfig = () => {
    switch (type) {
      case "danger":
        return {
          icon: <FaExclamationTriangle size={22} className="text-danger" />,
          bgIcon: "bg-danger-subtle",
          btnVariant: "danger",
        };
      case "confirm":
        return {
          icon: <FaQuestionCircle size={22} className="text-primary" />,
          bgIcon: "bg-primary-subtle",
          btnVariant: "primary",
        };
      default:
        return {
          icon: <FaInfoCircle size={22} className="text-info" />,
          bgIcon: "bg-info-subtle",
          btnVariant: "dark",
        };
    }
  };

  const { icon, bgIcon, btnVariant } = getTypeConfig();

  return (
    <Modal
      show={show}
      onHide={closeMessage}
      centered
      size="sm"
      backdrop="static"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      <div className="p-4 position-relative">
        {/* Botón de cerrar (X) flotante y minimalista */}
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3 shadow-none opacity-50 opacity-100-hover"
          onClick={closeMessage}
          aria-label="Close"
        />

        {/* Encabezado con Icono y Título */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${bgIcon}`}
            style={{ width: "42px", height: "42px" }}
          >
            {icon}
          </div>
          <h6 className="fw-semibold mb-0 text-dark fs-6 pe-3">{title}</h6>
        </div>

        {/* Mensaje */}
        <p className="text-secondary small mb-4 lh-base">{message}</p>

        {/* Botones Compactos */}
        <div className="d-flex justify-content-end gap-2 pt-1">
          {isConfirm && (
            <Button
              variant="link"
              className="text-decoration-none text-secondary fw-medium fs-7 px-3 py-1-5 shadow-none"
              onClick={closeMessage}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={btnVariant}
            className="fw-medium fs-7 px-3 py-1-5 rounded-3 shadow-sm"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
