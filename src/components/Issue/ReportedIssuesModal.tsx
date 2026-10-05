import { Modal, Badge } from "react-bootstrap";
import {
  FaExclamationTriangle,
  FaUser,
  FaCalendarAlt,
  FaTools,
} from "react-icons/fa";
import { useModalStore } from "../../stores/useModalStore";
import { useIssueReports } from "../../hooks/useIssues";
import useEquipments from "../../hooks/useEquipments";

type Props = {};

function ReportedIssuesModal({}: Props) {
  const { activeModal, closeModal } = useModalStore();

  const { data: reports } = useIssueReports();
  const { data: equipments } = useEquipments();

  const isOpen = activeModal === "REPORTED_ISSUES_LIST";

  // Helper para el badge de severidad
  const getSeverityBadge = (severity: string) => {
    const sev = severity.toUpperCase();
    switch (sev) {
      case "HIGH":
        return (
          <Badge
            bg="danger-subtle"
            className="text-danger border border-danger-subtle rounded-pill px-2 py-1 fw-semibold"
          >
            High Severity
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge
            bg="warning-subtle"
            className="text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1 fw-semibold"
          >
            Medium Severity
          </Badge>
        );
      default:
        return (
          <Badge
            bg="secondary-subtle"
            className="text-secondary border border-secondary-subtle rounded-pill px-2 py-1 fw-semibold"
          >
            {severity}
          </Badge>
        );
    }
  };

  // Helper para formatear la fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      size="lg"
      centered
      scrollable
      className="reported-issues-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <Modal.Title className="d-flex align-items-center gap-2">
          <div
            className="bg-danger-subtle text-danger p-2 rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: "38px", height: "38px" }}
          >
            <FaExclamationTriangle size={18} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark">Reported Issues</h5>
            <span className="text-muted fs-7 fw-normal">
              {reports?.length ?? 0} open issues requiring attention
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        {reports?.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaTools size={32} className="mb-2 opacity-50" />
            <p className="mb-0">No reported issues found.</p>
          </div>
        ) : (
          <div
            className="pe-1"
            style={{ maxHeight: "65vh", overflowY: "auto" }}
          >
            <div className="d-flex flex-column gap-2">
              {reports?.map((report) => {
                const equipmentSelected = equipments?.find(
                  (equip) => equip.equipmentsId === report.equipmentId,
                );

                return (
                  <div
                    key={report.id}
                    className="card border border-light-subtle shadow-sm rounded-2 overflow-hidden hover-shadow transition-all"
                  >
                    <div className="card-body p-2 p-md-3">
                      {/* Cabecera compacta: Ref, Tipo, Equip ID y Severidad */}
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge bg-light text-dark border font-monospace px-1.5 py-0.5 fs-8">
                            #{equipmentSelected?.number}
                          </span>
                          <span className="fw-bold text-dark fs-7">
                            {report.issueType}
                          </span>
                          <span className="text-muted fs-8 d-flex align-items-center gap-1">
                            <FaTools
                              size={10}
                              className="text-secondary opacity-75"
                            />
                            Equip: {equipmentSelected?.name}
                          </span>
                        </div>
                        <div>{getSeverityBadge(report.severity)}</div>
                      </div>

                      {/* Descripción corta */}
                      <p className="fw-semibold text-body mb-1 fs-7">
                        {report.issueDescription}
                      </p>

                      {/* Detalles compactos */}
                      {report.details && (
                        <p className="bg-light-subtle border-start border-2 border-secondary-subtle p-1.5 px-2 rounded-end mb-2 fs-8 text-muted text-truncate">
                          {report.details}
                        </p>
                      )}

                      {/* Footer en una sola línea */}
                      <div className="d-flex align-items-center justify-content-between pt-1 border-top border-light-subtle fs-8 text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <FaUser
                            size={10}
                            className="text-secondary opacity-75"
                          />
                          {report.reportedBy}
                        </span>
                        <span className="d-flex align-items-center gap-1 text-nowrap">
                          <FaCalendarAlt
                            size={10}
                            className="text-secondary opacity-75"
                          />
                          {formatDate(report.reportedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ReportedIssuesModal;
