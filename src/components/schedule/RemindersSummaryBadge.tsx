import { Badge } from "react-bootstrap";
import type { Schedule } from "../../types";
import { getWorstStatus, STATUS_UI } from "../../utilities/scheduleStatus";

type Props = {
  schedules?: Schedule[];
  currentOdometer?: number;
  onClick: () => void;
};

/**
 * Resumen de todos los reminders preventivos de un equipo:
 * color del estado más urgente + cantidad de servicios.
 */
export function RemindersSummaryBadge({
  schedules = [],
  currentOdometer,
  onClick,
}: Props) {
  if (schedules.length === 0) {
    return (
      <Badge
        as="button"
        bg="light"
        text="dark"
        className="border fw-normal px-2 py-1"
        onClick={onClick}
        title="Add a maintenance reminder"
      >
        No reminders
      </Badge>
    );
  }

  const worst = getWorstStatus(schedules, currentOdometer);
  const ui = STATUS_UI[worst];
  const count = schedules.length;

  return (
    <Badge
      as="button"
      bg={ui.bg}
      text={ui.text}
      className="d-inline-flex align-items-center gap-1 px-2 py-1 border-0"
      onClick={onClick}
      title="View maintenance reminders"
    >
      {worst === "overdue" && (
        <span
          className="dot bg-white rounded-circle"
          style={{ width: 6, height: 6 }}
        ></span>
      )}
      <span>
        {ui.label} · {count} {count === 1 ? "service" : "services"}
      </span>
    </Badge>
  );
}
