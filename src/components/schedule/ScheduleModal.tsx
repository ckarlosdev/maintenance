import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";
import { useModalStore } from "../../stores/useModalStore";
import useScheduleStore from "../../stores/useScheduleStore";
import useWorkOrderStore from "../../stores/useWorkOrderStore";

type Props = {};

function ScheduleModal({}: Props) {
  const { schedule } = useScheduleStore();
  const { activeModal, closeModal, openModal } = useModalStore();
  const { equipmentSelected, setShowModal } = useWorkOrderStore();

  const isOpen = activeModal === "SCHEDULE";

  if (!isOpen) return null;

  const renderValue = (
    value: string | number | null | undefined,
    suffix: string = "",
  ) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted fst-italic">No data</span>;
    }
    return (
      <strong className="text-dark">
        {value}
        {suffix}
      </strong>
    );
  };

  if (!schedule) {
    return (
      <Card.Body className="text-center py-4 text-muted">
        No maintenance information available.
      </Card.Body>
    );
  }

  const handleCreateWorkOrders = () => {
    console.log("handleWorkOrders", equipmentSelected);
    if (!equipmentSelected) {
      console.log("Equipment not found.");
      return;
    }
    setShowModal(true);
    closeModal();
  };

  const handleViewWorkOrder = async (workOrderId: number) => {
    openModal("WORK_ORDER_DETAIL", workOrderId);
  };

  return (
    <>
      <Modal
        show={isOpen}
        onHide={closeModal}
        backdrop="static"
        keyboard={false}
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Maintenance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="bg-light border-0 mb-2">
            <Card.Body className="py-2 px-3 d-flex gap-2 align-items-center">
              <div className="text-truncate">
                <small
                  className="text-muted d-block lh-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  Equipment:
                </small>
              </div>
              <strong className="text-dark small">
                {equipmentSelected?.number || "EQ-101"} -{" "}
                {equipmentSelected?.name || "Hydraulic Pump"}
              </strong>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body className="p-3 bg-light rounded-3">
              {/* 1. Encabezado con Badge de Estado y Folios */}
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                  <small
                    className="text-muted d-block text-uppercase fw-semibold"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Current Status
                  </small>
                  <MaintenanceStatusBadge
                    maintenance={schedule}
                    currentOdometer={Number(equipmentSelected?.hour) ?? 0}
                  />
                </div>

                {schedule.workOrderId ? (
                  <div className="text-end">
                    <small
                      className="text-muted d-block text-uppercase fw-semibold mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Work Order
                    </small>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="py-0 px-2 d-inline-flex align-items-center gap-1"
                      onClick={() => {
                        handleViewWorkOrder(schedule.workOrderId);
                      }}
                    >
                      <span>WO #{schedule.workOrderId}</span>
                      <small className="text-primary fw-semibold ms-1">
                        View →
                      </small>
                    </Button>
                  </div>
                ) : (
                  <div className="text-end">
                    <small
                      className="text-muted d-block text-uppercase fw-semibold mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      No Work Order
                    </small>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="py-0 px-2 fs-7"
                      onClick={handleCreateWorkOrders}
                    >
                      + Create Work Order
                    </Button>
                  </div>
                )}
              </div>

              {/* 2. Próximo Vencimiento (Due) */}
              <div className="mb-3">
                <h6
                  className="text-primary fw-bold mb-2 fs-7 text-uppercase"
                  style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                >
                  Next Due Schedule
                </h6>
                <Row className="g-2 bg-white p-2 rounded border">
                  <Col xs={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Due Date</span>
                      {renderValue(schedule.dueDate)}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">
                        Due Meter / Hours
                      </span>
                      {renderValue(schedule.dueMeter, " hrs")}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* 3. Último Mantenimiento Realizado (Last Performed) */}
              <div>
                <h6
                  className="text-secondary fw-bold mb-2 fs-7 text-uppercase"
                  style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                >
                  Last Performed
                </h6>
                <Row className="g-2 bg-white p-2 rounded border">
                  <Col xs={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Last Date</span>
                      {renderValue(schedule.lastPerformedDate)}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">
                        Last Meter / Hours
                      </span>
                      {renderValue(schedule.lastPerformedMeter, " hrs")}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* 4. Pie de tarjeta con IDs técnicos (Opcional, útil para auditoría) */}
              <div
                className="d-flex justify-content-between text-muted mt-3 pt-2 border-top"
                style={{ fontSize: "0.75rem" }}
              >
                <span>
                  Schedule ID:{" "}
                  {renderValue(schedule.equipmentPreventiveScheduleId)}
                </span>
                <span>Plan ID: {renderValue(schedule.preventivePlanId)}</span>
              </div>
            </Card.Body>
          </Card>
          <div className="d-flex align-items-center justify-content-between pt-1">
            <div className="d-flex align-items-center gap-1.5 text-secondary fs-8">
              {/* <FaPerson size={12} className="text-muted" />
              <span>
                Creado por:{" "}
                <strong className="text-dark fw-semibold">
                  {formData.userName}
                </strong>
              </span> */}
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="link"
                className="text-decoration-none text-secondary fs-7 px-2 py-1 shadow-none"
                onClick={closeModal}
              >
                Close
              </Button>
              {/* <Button
                type="submit"
                variant="primary"
                className="fw-medium fs-7 px-3 py-1.5 rounded-3 shadow-sm"
              >
                Save
              </Button> */}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ScheduleModal;
