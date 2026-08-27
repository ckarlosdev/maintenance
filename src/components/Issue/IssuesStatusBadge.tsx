import { Badge } from "react-bootstrap";
import type { Equipment, EquipmentIssueSummary } from "../../types";
import useIssueStore from "../../stores/useIssueStore";

export const IssuesStatusBadge = ({
  issues = [],
  equipment,
}: {
  issues?: EquipmentIssueSummary[];
  equipment: Equipment;
}) => {
  const { setShowModal, setIssues, setEquipmentSelected } = useIssueStore();

  if (!issues || issues.length === 0) {
    return (
      <Badge as="button" bg="light" text="dark" className="border fw-normal">
        No Reports
      </Badge>
    );
  }

  const hasCritical = issues.some((i) => i.severity === "CRITICAL");
  // const inProgressCount = issues.filter((i) => i.workOrderId !== null).length;

  return (
    <div className="d-flex align-items-center gap-1 justify-content-center">
      <Badge
        as="button"
        bg={hasCritical ? "danger" : "warning"}
        text={hasCritical ? "white" : "dark"}
        className="border-0 px-2 py-1 align-items-center cursor-pointer"
        onClick={() => {
          setShowModal(true);
          setIssues(issues);
          setEquipmentSelected(equipment);
        }}
      >
        {issues.length} {issues.length === 1 ? "Report" : "Reports"}
      </Badge>
    </div>
  );
};
