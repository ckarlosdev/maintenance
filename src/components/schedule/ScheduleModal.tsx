import { useMemo } from "react";
import { Button, Card, Col, Modal, Row, Spinner } from "react-bootstrap";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";
import { useModalStore } from "../../stores/useModalStore";
import useWorkOrderStore from "../../stores/useWorkOrderStore";
import { useGetChedulesByEquipmentIds } from "../../hooks/useSchedules";
import { useServiceNames, useServices } from "../../hooks/useServices";
import {
  getScheduleStatus,
  type ScheduleStatus,
} from "../../utilities/scheduleStatus";

// Orden de la lista: lo más urgente primero
const LIST_ORDER: Record<ScheduleStatus, number> = {
  overdue: 0,
  dueSoon: 1,
  working: 2,
  upToDate: 3,
  completed: 4,
  noData: 5,
};

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

function ScheduleModal() {
  const { activeModal, closeModal, openModal, equipmentSelected } =
    useModalStore();
  const { setShowModal, setEquipmentSelected } = useWorkOrderStore();
  const { data: services = [] } = useServices();
  const serviceNames = useServiceNames();

  const isOpen = activeModal === "SCHEDULE";
  const equipmentId = equipmentSelected?.equipmentsId;
  const currentOdometer = Number(equipmentSelected?.hour) || 0;

  const { data: schedules = [], isLoading } = useGetChedulesByEquipmentIds(
    isOpen && equipmentId != null ? [equipmentId] : [],
  );

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort(
        (a, b) =>
          LIST_ORDER[getScheduleStatus(a, currentOdometer)] -
          LIST_ORDER[getScheduleStatus(b, currentOdometer)],
      ),
    [schedules, currentOdometer],
  );

  const allServicesUsed = useMemo(() => {
    if (services.length === 0) return false;
    const used = new Set(schedules.map((s) => s.preventivePlanId));
    return services.every((s) => used.has(s.id));
  }, [services, schedules]);

  if (!isOpen) return null;

  const handleCreateWorkOrder = () => {
    if (!equipmentSelected) {
      console.log("Equipment not found.");
      return;
    }
    setEquipmentSelected(equipmentSelected);
    setShowModal(true);
    closeModal();
  };

  const handleViewWorkOrder = (workOrderId: number) => {
    openModal("WORK_ORDER_DETAIL", workOrderId);
  };

  const handleAddReminder = () => {
    openModal("SCHEDULE_CREATION");
  };

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      backdrop="static"
      keyboard={false}
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Maintenance reminders</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Card className="bg-light border-0 mb-3">
          <Card.Body className="py-2 px-3 d-flex justify-content-between align-items-center">
            <div>
              <small
                className="text-muted d-block lh-1"
                style={{ fontSize: "0.75rem" }}
              >
                Equipment
              </small>
              <strong className="text-dark small">
                #{equipmentSelected?.number} - {equipmentSelected?.name}
              </strong>
            </div>
            <div className="text-end">
              <small
                className="text-muted d-block lh-1"
                style={{ fontSize: "0.75rem" }}
              >
                Current meter
              </small>
              <strong className="text-dark small">{currentOdometer} hrs</strong>
            </div>
          </Card.Body>
        </Card>

        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : sortedSchedules.length === 0 ? (
          <div className="text-center py-4 text-muted rounded-3 bg-white border border-dashed small">
            No maintenance reminders yet for this equipment.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {sortedSchedules.map((schedule) => (
              <Card
                key={schedule.equipmentPreventiveScheduleId}
                className="border shadow-sm"
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <div>
                      <div className="fw-bold text-dark">
                        {schedule.preventivePlanId != null
                          ? (serviceNames[schedule.preventivePlanId] ??
                            `Service #${schedule.preventivePlanId}`)
                          : "Unassigned service"}
                      </div>
                      <MaintenanceStatusBadge
                        maintenance={schedule}
                        currentOdometer={currentOdometer}
                        showDetail={false}
                      />
                    </div>

                    {schedule.workOrderId ? (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="py-0 px-2 d-inline-flex align-items-center gap-1 flex-shrink-0"
                        onClick={() =>
                          handleViewWorkOrder(schedule.workOrderId)
                        }
                      >
                        <span>WO #{schedule.workOrderId}</span>
                        <small className="text-primary fw-semibold ms-1">
                          View →
                        </small>
                      </Button>
                    ) : (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="py-0 px-2 flex-shrink-0"
                        onClick={handleCreateWorkOrder}
                      >
                        + Work Order
                      </Button>
                    )}
                  </div>

                  <Row className="g-2 small">
                    <Col xs={6}>
                      <span className="text-primary fw-semibold d-block text-uppercase" style={{ fontSize: "0.7rem" }}>
                        Next due
                      </span>
                      <div>{renderValue(schedule.dueDate)}</div>
                      <div>{renderValue(schedule.dueMeter, " hrs")}</div>
                    </Col>
                    <Col xs={6}>
                      <span className="text-secondary fw-semibold d-block text-uppercase" style={{ fontSize: "0.7rem" }}>
                        Last performed
                      </span>
                      <div>{renderValue(schedule.lastPerformedDate)}</div>
                      <div>
                        {renderValue(schedule.lastPerformedMeter, " hrs")}
                      </div>
                    </Col>
                  </Row>

                  <div
                    className="text-muted mt-2 pt-2 border-top"
                    style={{ fontSize: "0.72rem" }}
                  >
                    Reminder ID: {schedule.equipmentPreventiveScheduleId}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddReminder}
          disabled={allServicesUsed || !equipmentSelected}
          title={
            allServicesUsed
              ? "All services already have a reminder"
              : "Add a maintenance reminder"
          }
        >
          + Add reminder
        </Button>
        <Button
          variant="link"
          className="text-decoration-none text-secondary"
          onClick={closeModal}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ScheduleModal;
