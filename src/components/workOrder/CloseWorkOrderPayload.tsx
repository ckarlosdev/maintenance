import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Card, Badge } from "react-bootstrap";
import type { Task, WorkOrder } from "../../types";
import useWorkOrderStore from "../../stores/useWorkOrderStore";

export interface NextScheduleInput {
  preventivePlanId: number;
  nextDueDate?: string;
  nextDueMeter?: number;
}

interface CloseWorkOrderModalProps {
  show: boolean;
  workOrder: WorkOrder;
  onClose: () => void;
  onConfirm: (nextScheduleData: NextScheduleInput[]) => void;
}

// Auxiliar para sumar meses a una fecha formateada (YYYY-MM-DD)
const addMonthsToDateString = (monthsToAdd = 6): string => {
  const date = new Date();

  date.setMonth(date.getMonth() + monthsToAdd);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function CloseWorkOrderModal({
  show,
  workOrder,
  onClose,
  onConfirm,
}: CloseWorkOrderModalProps) {
  const equipmentSelected = useWorkOrderStore(
    (state) => state.equipmentSelected,
  );

  const [schedulesData, setSchedulesData] = useState<
    Record<number, { nextDueDate: string; nextDueMeter: string }>
  >({});

  // Filtrar estrictamente las tareas que tienen una programación preventiva (schedule != null)
  const preventiveTasks = (workOrder.tasks ?? []).filter(
    (t): t is Task & { schedule: NonNullable<Task["schedule"]> } =>
      Boolean(t.schedule),
  );

  useEffect(() => {
    if (!show || preventiveTasks.length === 0) {
      return;
    }

    const currentEquipmentMeter = Number(equipmentSelected?.hour ?? 0);

    const suggestedDate = addMonthsToDateString(6);
    const suggestedMeter = currentEquipmentMeter + 500;

    const initialMap: Record<
      number,
      { nextDueDate: string; nextDueMeter: string }
    > = {};

    preventiveTasks.forEach((task) => {
      const planId = task.schedule.preventivePlanId;

      if (planId !== undefined && planId !== null) {
        initialMap[planId] = {
          nextDueDate: suggestedDate,
          nextDueMeter: String(suggestedMeter),
        };
      }
    });

    setSchedulesData(initialMap);
  }, [show, workOrder, equipmentSelected?.hour]);

  const handleInputChange = (
    planId: number,
    field: "nextDueDate" | "nextDueMeter",
    value: string,
  ) => {
    setSchedulesData((prev) => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPayload: NextScheduleInput[] = Object.entries(
      schedulesData,
    ).map(([planId, data]) => ({
      preventivePlanId: Number(planId),
      nextDueDate: data.nextDueDate || undefined,
      nextDueMeter: data.nextDueMeter ? Number(data.nextDueMeter) : undefined,
    }));

    onConfirm(formattedPayload);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5 fw-bold text-dark">
            Schedule Next Maintenance — WO #{workOrder.id}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small mb-3">
            Suggested maintenance intervals have been pre-calculated based on
            current schedule goals and meter readings (Current equipment meter:{" "}
            <strong>{equipmentSelected?.hour ?? 0} hrs/km</strong>). You can
            adjust them as needed.
          </p>

          <div className="d-flex flex-column gap-3">
            {preventiveTasks.map((task) => {
              const schedule = task.schedule;
              const planId = schedule.preventivePlanId;
              const currentData = schedulesData[planId] || {
                nextDueDate: "",
                nextDueMeter: "",
              };

              return (
                <Card key={task.id} className="border shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Badge bg="info" text="dark">
                        Preventive Plan #{planId}
                      </Badge>
                      <span className="fw-semibold text-dark">
                        {task.taskDescription}
                      </span>
                    </div>

                    <div className="text-muted small mb-2">
                      <span className="me-3">
                        <strong>Previous Due Date:</strong>{" "}
                        {schedule.dueDate || "N/A"}
                      </span>
                      <span>
                        <strong>Previous Due Meter:</strong>{" "}
                        {schedule.dueMeter
                          ? `${schedule.dueMeter} hrs/km`
                          : "N/A"}
                      </span>
                    </div>

                    <Row className="g-3 mt-1">
                      <Col md={6}>
                        <Form.Group controlId={`dueDate-${task.id}`}>
                          <Form.Label className="small fw-bold text-secondary">
                            Next Due Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={currentData.nextDueDate}
                            onChange={(e) =>
                              handleInputChange(
                                planId,
                                "nextDueDate",
                                e.target.value,
                              )
                            }
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId={`dueMeter-${task.id}`}>
                          <Form.Label className="small fw-bold text-secondary">
                            Next Due Meter (Hrs / Km)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="e.g. 1500"
                            value={currentData.nextDueMeter}
                            onChange={(e) =>
                              handleInputChange(
                                planId,
                                "nextDueMeter",
                                e.target.value,
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" className="fw-bold">
            Proceed to Sign (PIN)
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CloseWorkOrderModal;
