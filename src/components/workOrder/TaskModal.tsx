import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import type { CreateTaskPayload, Mechanic } from "../../types";
import { UserPinValidationModal } from "../TaskValidationModal";
import { useAddTask } from "../../hooks/useWorkOrders";
import { useMemo, useState } from "react";
import { useGetChedulesByEquipmentIds } from "../../hooks/useSchedules";
import { useGetIssuesByEquipmentIds } from "../../hooks/useIssues";

type AddTaskModalProps = {
  show: boolean;
  onClose: () => void;
  workOrder: {
    id: number;
    equipmentId: number;
    equipmentNumber?: string;
    existingTasks?: Array<{
      equipmentIssueId?: number | null;
      preventivePlanId?: number | null;
    }>;
  };
};

export function TaskModal({ show, onClose, workOrder }: AddTaskModalProps) {
  // --- Mutación React Query ---
  const { mutate: addTaskMutation, isPending } = useAddTask();

  // --- Estados Locales ---
  const [taskDescription, setTaskDescription] = useState("");
  const [equipmentIssueId, setEquipmentIssueId] = useState<number | null>(null);
  const [preventivePlanId, setPreventivePlanId] = useState<number | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  // --- React Query Custom Hooks ---
  const { data: pendingSchedules } = useGetChedulesByEquipmentIds(
    workOrder.equipmentId ? [workOrder.equipmentId] : [],
  );

  const { data: reportedIssues } = useGetIssuesByEquipmentIds(
    workOrder.equipmentId ? [workOrder.equipmentId] : [],
  );

  const allIssues = useMemo(
    () => Object.values(reportedIssues ?? {}).flat(),
    [reportedIssues],
  );

  // --- Filtrado de Issues y Planes ya asignados ---
  const usedIssueIds = useMemo(() => {
    return new Set(
      (workOrder.existingTasks ?? [])
        .map((t) => t.equipmentIssueId)
        .filter((id): id is number => id !== null && id !== undefined),
    );
  }, [workOrder.existingTasks]);

  const usedPlanIds = useMemo(() => {
    return new Set(
      (workOrder.existingTasks ?? [])
        .map((t) => t.preventivePlanId)
        .filter((id): id is number => id !== null && id !== undefined),
    );
  }, [workOrder.existingTasks]);

  const availableIssues = useMemo(() => {
    return allIssues.filter((issue) => !usedIssueIds.has(issue.id));
  }, [allIssues, usedIssueIds]);

  const availablePlans = useMemo(() => {
    return (pendingSchedules ?? []).filter((plan) => {
      const planId =
        plan.preventivePlanId ?? plan.equipmentPreventiveScheduleId;
      return !usedPlanIds.has(planId);
    });
  }, [pendingSchedules, usedPlanIds]);

  // --- Handlers ---
  const handleOpenPinValidation = () => {
    if (!taskDescription.trim()) return;
    setShowPinModal(true);
  };

  const handleConfirmValidation = (mechanic: Mechanic) => {
    const payload: CreateTaskPayload = {
      taskDescription: taskDescription.trim(),
      equipmentIssueId: equipmentIssueId ?? null,
      preventivePlanId: preventivePlanId ?? null,
      createdBy: mechanic.fullName,
    };

    addTaskMutation(
      { workOrderId: workOrder.id, dto: payload },
      {
        onSuccess: () => {
          setShowPinModal(false);
          handleCloseAll();
        },
        onError: (error) => {
          console.error("Error adding task to Work Order:", error);
        },
      },
    );
  };

  const handleCloseAll = () => {
    setTaskDescription("");
    setEquipmentIssueId(null);
    setPreventivePlanId(null);
    setShowPinModal(false);
    onClose();
  };

  return (
    <>
      <Modal
        show={show && !showPinModal}
        onHide={handleCloseAll}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton className="py-2 px-3 border-bottom-0">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <span>📝</span> Add Task to Order #{workOrder.id}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3 pt-0">
          <Form.Group className="mb-3">
            <Form.Label
              className="fw-bold text-muted mb-1"
              style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}
            >
              TASK DESCRIPTION
            </Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="What needs to be done? (e.g., Check belt tension)..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="shadow-none fw-medium"
              style={{ fontSize: "0.82rem" }}
              autoFocus
            />
          </Form.Group>

          <Row className="g-2 mb-2">
            {/* Select de Issues */}
            <Col xs={6}>
              <Form.Label
                className="fw-bold text-muted mb-1"
                style={{ fontSize: "0.72rem" }}
              >
                LINK ISSUE
              </Form.Label>
              <Form.Select
                size="sm"
                className="shadow-none text-secondary border-light-subtle"
                style={{ fontSize: "0.76rem" }}
                value={equipmentIssueId ?? ""}
                onChange={(e) =>
                  setEquipmentIssueId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                disabled={
                  preventivePlanId !== null || availableIssues.length === 0
                }
              >
                <option value="">
                  {availableIssues.length === 0
                    ? "⚠️ No Issues Available"
                    : "⚠️ Optional"}
                </option>
                {availableIssues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    #{issue.id} - {issue.issueDescription}
                  </option>
                ))}
              </Form.Select>
            </Col>
            {/* Select de Plan Preventivo */}
            <Col xs={6}>
              <Form.Label
                className="fw-bold text-muted mb-1"
                style={{ fontSize: "0.72rem" }}
              >
                LINK PREVENTIVE PLAN
              </Form.Label>
              <Form.Select
                size="sm"
                className="shadow-none text-secondary border-light-subtle"
                style={{ fontSize: "0.76rem" }}
                value={preventivePlanId ?? ""}
                onChange={(e) =>
                  setPreventivePlanId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                disabled={
                  equipmentIssueId !== null || availablePlans.length === 0
                }
              >
                <option value="">
                  {availablePlans.length === 0
                    ? "📅 No Plans Available"
                    : "📅 Optional"}
                </option>
                {availablePlans.map((plan) => {
                  const planId = plan.equipmentPreventiveScheduleId;
                  return (
                    <option key={planId} value={planId}>
                      {plan.dueMeter
                        ? `Due at ${plan.dueMeter} hrs`
                        : `Due: ${plan.dueDate}`}
                      {plan.isOverdue ? " (OVERDUE)" : ""}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0 px-3 pb-3">
          <Button
            variant="light"
            size="sm"
            className="px-3 py-1.5 fw-semibold border"
            onClick={handleCloseAll}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="dark"
            size="sm"
            className="px-4 py-1.5 fw-semibold shadow-xs"
            onClick={handleOpenPinValidation}
            disabled={!taskDescription.trim() || isPending}
          >
            {isPending ? "Adding..." : "Add Task"}
          </Button>
        </Modal.Footer>
      </Modal>

      {showPinModal && (
        <UserPinValidationModal
          show={showPinModal}
          title="Authorise Task Addition"
          actionDescription={`Authorising new task for Order #${workOrder.id}`}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleConfirmValidation}
        />
      )}
    </>
  );
}
