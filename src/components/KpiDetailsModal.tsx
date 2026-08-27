import { Badge, Button, Modal, Spinner, Table } from "react-bootstrap";
import { useModalStore } from "../stores/useModalStore";
import { useKpiDetails } from "../hooks/useMetrics";
import {
  FaCalendarAlt,
  FaExclamationCircle,
  FaTruck,
  FaListUl,
  FaInbox,
} from "react-icons/fa";
import type { KpiDetailResponseDto } from "../types";
import "../styles/kpisStyles.css";
import useEquipments from "../hooks/useEquipments";

type Props = {};

const getStatusBadge = (status: string) => {
  const normalized = status?.toUpperCase() || "";
  switch (normalized) {
    case "DRAFT":
      return (
        <Badge
          bg="secondary"
          className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 fw-semibold px-2 py-1"
        >
          Draft
        </Badge>
      );
    case "OPEN":
    case "SCHEDULED":
      return (
        <Badge
          bg="info"
          className="bg-opacity-10 text-info-emphasis border border-info border-opacity-25 fw-semibold px-2 py-1"
        >
          {status}
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          bg="primary"
          className="bg-opacity-10 text-primary border border-primary border-opacity-25 fw-semibold px-2 py-1"
        >
          In Progress
        </Badge>
      );
    case "OVERDUE":
    case "CRITICAL":
      return (
        <Badge
          bg="danger"
          className="bg-opacity-10 text-danger border border-danger border-opacity-25 fw-semibold px-2 py-1"
        >
          Critical
        </Badge>
      );
    default:
      return (
        <Badge bg="light" className="text-dark border fw-medium px-2 py-1">
          {"Due soon"}
        </Badge>
      );
  }
};

const getSeverityBadge = (severity: string | null) => {
  if (!severity) return null;
  const normalized = severity.toUpperCase();
  let bgClass = "bg-light text-dark";

  if (normalized === "CRITICAL" || normalized === "HIGH")
    bgClass = "bg-danger text-white";
  else if (normalized === "MEDIUM") bgClass = "bg-warning text-dark";
  else if (normalized === "LOW") bgClass = "bg-info text-white";

  return (
    <Badge className={`fw-medium px-2 py-1 ms-1 shadow-sm ${bgClass}`}>
      {severity}
    </Badge>
  );
};

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return "No date";

  try {
    const date = new Date(isoDate);

    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

function KpiDetailsModal({}: Props) {
  const {
    activeModal,
    data: modalData,
    equipmentSelected,
    closeModal,
  } = useModalStore();

  const { data: equipments } = useEquipments();

  const isOpen = activeModal === "KPI_DETAILS";

  const kpiType = modalData?.category || null;
  const modalTitle = modalData?.title || "Detalles del Indicador";

  // React Query Hook
  const {
    data: items = [],
    isLoading,
    isError,
    error,
  } = useKpiDetails({
    type: kpiType,
    equipmentId: equipmentSelected?.equipmentsId,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      centered
      size="lg"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden bg-white"
    >
      {/* Header Estilizado con un toque cálido/profesional */}
      <Modal.Header
        closeButton
        className="px-4 pt-4 pb-3 border-bottom bg-light bg-gradient"
      >
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center">
            <FaListUl size={20} />
          </div>
          <div>
            <Modal.Title className="fs-5 fw-bold text-dark mb-0">
              {modalTitle}
            </Modal.Title>
            <p className="text-muted small mb-0 mt-0.5">
              {equipmentSelected ? (
                <span>
                  Filtrado por:{" "}
                  <strong className="text-primary-emphasis">
                    {equipmentSelected.name}
                  </strong>
                </span>
              ) : (
                "Showing all active records"
              )}
            </p>
          </div>
        </div>
      </Modal.Header>

      {/* Body con Scroll Contenido */}
      <Modal.Body className="p-0 bg-white">
        {isLoading && (
          <div className="text-center py-5 my-3">
            <Spinner
              animation="border"
              variant="primary"
              size="sm"
              className="mb-2"
            />
            <p className="text-muted small mb-0 fw-medium">
              Loading records...
            </p>
          </div>
        )}

        {isError && (
          <div className="p-4">
            <div className="alert alert-danger border-0 rounded-3 p-3 d-flex align-items-center gap-2 small mb-0 shadow-sm">
              <FaExclamationCircle size={18} className="flex-shrink-0" />
              <span>Error loading data: {(error as Error)?.message}</span>
            </div>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="text-center py-5 my-3 text-muted">
            <div className="p-3 rounded-circle bg-light d-inline-block mb-2">
              <FaInbox size={28} className="text-secondary opacity-50" />
            </div>
            <p className="mb-0 small fw-medium">
              No pending items for this indicator.
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          /* Contenedor del Scroll */
          <div
            className="table-responsive"
            style={{ maxHeight: "420px", overflowY: "auto" }}
          >
            <Table hover className="mb-0 border-0 align-middle">
              <thead
                className="sticky-top bg-light shadow-sm"
                style={{ zIndex: 1 }}
              >
                <tr className="border-bottom text-secondary fs-7 text-uppercase tracking-wider">
                  <th className="fw-bold bg-light py-3 ps-4">Record</th>
                  <th className="fw-bold bg-light py-3 text-center">
                    Equipment
                  </th>
                  <th className="fw-bold bg-light py-3">Status</th>
                  <th
                    className="fw-bold bg-light py-3"
                    style={{ textAlign: "center" }}
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: KpiDetailResponseDto) => {
                  const equip = equipments?.find(
                    (i) => i.equipmentsId === item.equipmentId,
                  );

                  return (
                    <tr
                      key={item.id}
                      className="border-bottom border-light align-middle"
                    >
                      {/* Título & Subtítulo */}
                      <td className="py-3 ps-4">
                        <div className="fw-semibold text-dark fs-6 mb-0">
                          {item.title}
                        </div>
                        <span className="text-muted fs-7 d-block">
                          {item.subtitle}
                        </span>
                      </td>

                      {/* Badge Equipo */}
                      <td className="py-3 text-center">
                        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-10 text-primary-emphasis fs-7 fw-medium">
                          <FaTruck size={11} className="text-primary" />
                          <span>Equip #{equip?.number ?? " Not found"}</span>
                        </div>
                      </td>

                      {/* Estado & Severidad */}
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-1">
                          {getStatusBadge(item.status)}
                          {getSeverityBadge(item.severity)}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 text-center pe-4">
                        <div className="d-inline-flex align-items-center gap-1.5 text-muted fs-7 fw-medium">
                          <FaCalendarAlt
                            size={12}
                            className="text-secondary opacity-75"
                          />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      {/* Footer Limpio */}
      <Modal.Footer className="px-4 py-3 border-top bg-light bg-opacity-50 d-flex justify-content-between align-items-center">
        <span className="text-muted fs-7">
          Total:{" "}
          <strong className="text-dark bg-white px-2 py-0.5 rounded border shadow-sm">
            {items.length}
          </strong>
        </span>
        <Button
          variant="white"
          className="btn-sm border shadow-sm fw-medium px-3 py-1.5 rounded-3 text-dark"
          onClick={closeModal}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default KpiDetailsModal;
