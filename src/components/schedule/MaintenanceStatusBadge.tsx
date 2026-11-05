import React from "react";
import { Badge } from "react-bootstrap";
import type { Schedule } from "../../types";
import {
  formatDueDetail,
  getScheduleStatus,
  STATUS_UI,
} from "../../utilities/scheduleStatus";

interface Props {
  maintenance?: Schedule | null;
  currentOdometer?: number;
  onClick?: () => void;
  /** Mostrar fecha/medidor junto al estado. */
  showDetail?: boolean;
}

export const MaintenanceStatusBadge: React.FC<Props> = ({
  maintenance,
  currentOdometer,
  onClick,
  showDetail = true,
}) => {
  const status = getScheduleStatus(maintenance, currentOdometer);
  const ui = STATUS_UI[status];
  const detailText = formatDueDetail(maintenance);

  return (
    <Badge
      as={onClick ? "button" : "span"}
      bg={ui.bg}
      text={ui.text}
      className={`d-inline-flex align-items-center gap-1 px-2 py-1 border-0 ${
        status === "noData" ? "fw-normal" : ""
      }`}
      onClick={onClick}
    >
      {status === "overdue" && (
        <span
          className="dot bg-white rounded-circle"
          style={{ width: 6, height: 6 }}
        ></span>
      )}
      <span>
        {ui.label}
        {showDetail && status !== "noData" && detailText
          ? `: ${detailText}`
          : ""}
      </span>
    </Badge>
  );
};
