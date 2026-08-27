import React from "react";
import { Badge } from "react-bootstrap";
import type { Equipment, Schedule } from "../../types";
import useGralStore from "../../stores/useGralStore";
import { useModalStore } from "../../stores/useModalStore";

interface Props {
  maintenance?: Schedule | null;
  currentOdometer?: number;
  onClick?: () => void;
  equipment?: Equipment;
}

export const MaintenanceStatusBadge: React.FC<Props> = ({
  maintenance,
  currentOdometer,
  onClick,
  equipment,
}) => {
  const showMessage = useGralStore((state) => state.showMessage);
  const { openModal, setEquipmentSelected } = useModalStore();

  const handleClick = () => {
    showMessage({
      title: "No data found",
      message: "Create Maintenance?",
      type: "danger",
      confirmText: "Yes, create",
      cancelText: "Cancel",

      onConfirm: () => {
        setEquipmentSelected(equipment!!);
        openModal("SCHEDULE_CREATION");
      },

      onCancel: () => {
        console.log("Respuesta: El usuario CANCELÓ la acción");
      },
    });
  };

  if (!maintenance || (!maintenance.dueDate && maintenance.dueMeter == null)) {
    return (
      <Badge
        as="button"
        bg="secondary"
        className="fw-normal px-2 py-1 text-decoration-none border-0"
        onClick={handleClick}
      >
        No Data
      </Badge>
    );
  }

  const { dueDate, dueMeter, isOverdue, workOrderId, isCompleted } =
    maintenance;

  // const taskIsCompleted = Boolean(isCompleted);

  // 2. Formatear texto descriptivo
  let detailText = "";
  if (dueDate && dueMeter != null) {
    detailText = `${dueDate} / ${dueMeter} hrs`;
  } else if (dueDate) {
    detailText = `${dueDate}`;
  } else if (dueMeter != null) {
    detailText = `${dueMeter} hrs`;
  }

  // 3. Regla 1: Orden de trabajo activa con tarea PENDIENTE -> Working on
  // 1. Si existe una Work Order activa (en borrador, asignada o no cerrada en el backend) -> Working on
  // Si necesitas validar según el status de la orden, puedes añadir: && orderStatus !== "CLOSED"
  if (workOrderId) {
    return (
      <Badge
        as="button"
        bg="info"
        text="dark"
        className="d-inline-flex align-items-center gap-1 px-2 py-1 border-0"
        onClick={onClick}
      >
        <span>Working on: {detailText}</span>
      </Badge>
    );
  }

  // 2. Si la tarea del mantenimiento ya finalizó por completo sin orden pendiente -> Up to Date
  if (isCompleted) {
    return (
      <Badge
        as="button"
        bg="success"
        className="d-inline-flex align-items-center gap-1 px-2 py-1 border-0"
        onClick={onClick}
      >
        <span>Up to Date: {detailText}</span>
      </Badge>
    );
  }

  // 5. Evaluar los estados individuales por Fecha y por Horas si la tarea NO está en proceso ni completada
  const dateStatus = getDueDateStatus(dueDate, isOverdue);
  const meterStatus = getDueMeterStatus(dueMeter, currentOdometer, isOverdue);

  // 6. Determinar el estado final según Jerarquía: OVERDUE > DUE_SOON > UP_TO_DATE > NO_DATA
  let finalStatus: "overdue" | "dueSoon" | "upToDate" | "noData" = "noData";

  if (dateStatus === "overdue" || meterStatus === "overdue") {
    finalStatus = "overdue";
  } else if (dateStatus === "dueSoon" || meterStatus === "dueSoon") {
    finalStatus = "dueSoon";
  } else if (dateStatus === "upToDate" || meterStatus === "upToDate") {
    finalStatus = "upToDate";
  }

  // 7. Renderizar según el estado final calculado
  switch (finalStatus) {
    case "overdue":
      return (
        <Badge
          as="button"
          bg="danger"
          className="d-inline-flex align-items-center gap-1 px-2 py-1 border-0"
          onClick={onClick}
        >
          <span
            className="dot bg-white rounded-circle"
            style={{ width: 6, height: 6 }}
          ></span>
          <span>Overdue: {detailText}</span>
        </Badge>
      );

    case "dueSoon":
      return (
        <Badge
          as="button"
          bg="warning"
          text="dark"
          className="d-inline-flex align-items-center gap-1 px-2 py-1 border-0"
          onClick={onClick}
        >
          <span>Due Soon: {detailText}</span>
        </Badge>
      );

    case "upToDate":
      return (
        <Badge
          as="button"
          bg="success"
          className="d-inline-flex align-items-center gap-1 px-2 py-1 border-0"
          onClick={onClick}
        >
          <span>Up to Date: {detailText}</span>
        </Badge>
      );

    default:
      return (
        <Badge
          as="button"
          bg="secondary"
          className="fw-normal px-2 py-1 text-decoration-none border-0"
          onClick={onClick}
        >
          No Data
        </Badge>
      );
  }
};

// --- Helpers para el cálculo de estados ---

type Status = "overdue" | "dueSoon" | "upToDate" | "noData";

function getDueDateStatus(
  dueDate?: string | null,
  isOverdueFlag?: boolean,
): Status {
  if (!dueDate) return "noData";
  if (isOverdueFlag) return "overdue";

  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();
  const daysDiff = (due - now) / (1000 * 3600 * 24);

  if (daysDiff <= 0) return "overdue";
  if (daysDiff <= 15) return "dueSoon";
  return "upToDate";
}

function getDueMeterStatus(
  dueMeter?: number | null,
  currentMeter?: number,
  isOverdueFlag?: boolean,
): Status {
  if (dueMeter == null || currentMeter == null) return "noData";
  if (isOverdueFlag) return "overdue";

  const hoursDiff = dueMeter - currentMeter;

  if (hoursDiff <= 0) return "overdue";
  if (hoursDiff <= 50) return "dueSoon";
  return "upToDate";
}
