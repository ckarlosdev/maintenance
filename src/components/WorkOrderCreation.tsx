import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import useWorkOrderStore from "../stores/useWorkOrderStore";
import { useEffect, useMemo, useState } from "react";
import { useGetChedulesByEquipmentIds } from "../hooks/useSchedules";
import { useGetIssuesByEquipmentIds } from "../hooks/useIssues";
import { UserPinValidationModal } from "./TaskValidationModal";
import type { CreateWorkOrderPayload, Mechanic } from "../types";
import { useSaveWorkOrder } from "../hooks/useWorkOrders";

type Props = {};

function WorkOrderCreation({}: Props) {
  // --- Zustand Store State & Actions ---
  const workOrderData = useWorkOrderStore((state) => state.workOrderData);
  const { mutate: saveWorkOrder } = useSaveWorkOrder();
  const equipmentSelected = useWorkOrderStore(
    (state) => state.equipmentSelected,
  );
  const showModal = useWorkOrderStore((state) => state.showModal);
  const [showPinModal, setShowPinModal] = useState(false);

  const setShowModal = useWorkOrderStore((state) => state.setShowModal);
  const setWorkOrderField = useWorkOrderStore(
    (state) => state.setWorkOrderField,
  );
  const addTask = useWorkOrderStore((state) => state.addTask);
  const removeTask = useWorkOrderStore((state) => state.removeTask);
  const resetWorkOrder = useWorkOrderStore((state) => state.resetWorkOrder);

  // --- React Query Custom Hooks ---
  const { data: pendingSchedules } = useGetChedulesByEquipmentIds(
    equipmentSelected?.equipmentsId != null
      ? [equipmentSelected.equipmentsId]
      : [],
  );

  const { data: reportedIssues } = useGetIssuesByEquipmentIds(
    equipmentSelected?.equipmentsId != null
      ? [equipmentSelected.equipmentsId]
      : [],
  );

  const allIssues = useMemo(
    () => Object.values(reportedIssues ?? {}).flat(),
    [reportedIssues],
  );

  // --- Local Form State ---
  const [taskDescription, setTaskDescription] = useState("");
  const [equipmentIssueId, setEquipmentIssueId] = useState<number | null>(null);
  const [preventivePlanId, setPreventivePlanId] = useState<number | null>(null);

  // 1. Obtener los IDs que YA fueron asignados a alguna tarea creada
  const usedIssueIds = useMemo(() => {
    return new Set(
      workOrderData.tasks
        .map((t) => t.equipmentIssueId)
        .filter((id): id is number => id !== null && id !== undefined),
    );
  }, [workOrderData.tasks]);

  const usedPlanIds = useMemo(() => {
    return new Set(
      workOrderData.tasks
        .map((t) => t.preventivePlanId)
        .filter((id): id is number => id !== null && id !== undefined),
    );
  }, [workOrderData.tasks]);

  // 2. Filtrar listas excluyendo los ya asignados
  const availableIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      // 1. Excluir si ya fue añadido a la lista local de tareas del modal
      if (usedIssueIds.has(issue.id)) return false;

      // 2. Excluir si en la base de datos ya está en progreso o resuelto/cerrado
      if (
        issue.issueStatus === "IN_PROGRESS" ||
        issue.issueStatus === "RESOLVED"
      )
        return false;

      // 3. Excluir si el backend ya le asignó un workOrderId
      if (issue.workOrderId !== null && issue.workOrderId !== undefined)
        return false;

      return true;
    });
  }, [allIssues, usedIssueIds]);

  const availablePlans = useMemo(() => {
    return (pendingSchedules ?? []).filter((plan) => {
      const planId =
        plan.preventivePlanId ?? plan.equipmentPreventiveScheduleId;

      return !usedPlanIds.has(planId) && plan.scheduleStatus === "unassigned";
    });
  }, [pendingSchedules, usedPlanIds]);

  useEffect(() => {
    if (equipmentSelected?.equipmentsId) {
      setWorkOrderField("equipmentId", equipmentSelected.equipmentsId);
    }
  }, [equipmentSelected, setWorkOrderField]);

  // --- Handlers ---
  const handleAddNewTask = () => {
    if (!taskDescription.trim()) return;

    addTask({
      taskDescription: taskDescription.trim(),
      equipmentIssueId: equipmentIssueId,
      preventivePlanId: preventivePlanId,
      createdBy: "currentUser",
    });

    // Limpiar estado local del formulario de tarea
    setTaskDescription("");
    setEquipmentIssueId(null);
    setPreventivePlanId(null);
  };

  const handleSubmit = () => {
    if (workOrderData.tasks.length === 0) return;
    setShowPinModal(true);
  };

  const handleConfirmValidation = (
    mechanic: Mechanic
  ) => {
    // Construimos el payload alineado exactamente a tus tipos
    const payload: CreateWorkOrderPayload = {
      equipmentId:
        equipmentSelected?.equipmentsId ?? workOrderData.equipmentId ?? null,
      orderType: workOrderData.orderType || "CORRECTIVE",
      createdBy: mechanic.fullName, // ID del mecánico autenticado
      tasks: workOrderData.tasks.map((task) => ({
        taskDescription: task.taskDescription,
        preventivePlanId: task.preventivePlanId ?? null,
        equipmentIssueId: task.equipmentIssueId ?? null,
        createdBy: mechanic.fullName,
      })),
    };

    // Ejecutamos la mutación enviando el objeto { workOrder: payload }
    saveWorkOrder(
      { workOrder: payload },
      {
        onSuccess: () => {
          setShowPinModal(false);
          handleClose(); // Cierra el modal principal y resetea la store Zustand
        },
        onError: (error) => {
          console.error("Error al crear la Work Order:", error);
          // Opcional: Notificar al usuario mediante un Toast o Alerta
        },
      },
    );
  };

  const handleClose = () => {
    resetWorkOrder();
    setShowModal(false);
  };

  return (
    <>
      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton className="py-2 px-3 border-bottom-0">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <span>🛠️</span> Create Work Order
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3 pt-0">
          {/* Banner del Equipo */}
          <Card className="bg-light border-0 mb-2">
            <Card.Body className="py-2 px-3 d-flex justify-content-between align-items-center">
              <div className="text-truncate">
                <small
                  className="text-muted d-block lh-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  Equipment
                </small>
              </div>

              <strong className="text-dark small">
                {equipmentSelected?.number || "EQ-101"} -{" "}
                {equipmentSelected?.name || "Hydraulic Pump"}
              </strong>
            </Card.Body>
          </Card>

          {/* Tipo de Orden */}
          <Form.Group className="mb-3">
            <Form.Label
              className="fw-bold text-muted mb-1.5"
              style={{ fontSize: "0.75rem", letterSpacing: "0.3px" }}
            >
              ORDER TYPE
            </Form.Label>
            <Row className="g-1.5">
              {["PREVENTIVE", "CORRECTIVE", "MIXED"].map((type) => {
                const isSelected =
                  (workOrderData?.orderType || "PREVENTIVE") === type;
                return (
                  <Col key={type} xs={4}>
                    <Button
                      variant={isSelected ? "dark" : "outline-secondary"}
                      size="sm"
                      className={`w-100 py-1.5 fw-bold text-capitalize border ${isSelected ? "shadow-sm" : "border-light-subtle"}`}
                      style={{ fontSize: "0.78rem" }}
                      onClick={() => setWorkOrderField("orderType", type)}
                    >
                      {type.toLowerCase()}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </Form.Group>

          {/* Creador de Tareas */}
          <div className="bg-body-tertiary rounded-3 p-3 border shadow-xs">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span
                className="fw-bold text-dark d-flex align-items-center gap-1.5"
                style={{ fontSize: "0.85rem" }}
              >
                <span>📋</span> Tasks Checklist
              </span>
              <span
                className="badge bg-primary-subtle text-primary fw-bold px-2 py-1 rounded-pill"
                style={{ fontSize: "0.72rem" }}
              >
                {workOrderData.tasks.length}{" "}
                {workOrderData.tasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-3 border shadow-2xs mb-3">
              <Form.Control
                size="sm"
                type="text"
                placeholder="What needs to be done? (e.g., Check belt tension)..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="shadow-none mb-2 border-light-subtle fw-medium"
                style={{ fontSize: "0.82rem" }}
              />

              <Row className="g-2 mb-2">
                {/* Select de Issues */}
                <Col xs={6}>
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
                    // Deshabilitado si:
                    // 1. Hay un plan seleccionado actualmente para esta tarea.
                    // 2. No hay opciones de issues disponibles (ya usados o vacíos desde backend).
                    disabled={
                      preventivePlanId !== null || availableIssues.length === 0
                    }
                  >
                    <option value="">
                      {availableIssues.length === 0
                        ? "⚠️ No Issues Available"
                        : "⚠️ Link Issue (Optional)"}
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
                    // Deshabilitado si:
                    // 1. Hay un issue seleccionado actualmente para esta tarea.
                    // 2. No hay planes disponibles (ya usados o vacíos desde backend).
                    disabled={
                      equipmentIssueId !== null || availablePlans.length === 0
                    }
                  >
                    <option value="">
                      {availablePlans.length === 0
                        ? "📅 No Plans Available"
                        : "📅 Link Plan (Optional)"}
                    </option>
                    {availablePlans.map((plan) => {
                      const planId = plan.equipmentPreventiveScheduleId;
                      return (
                        <option
                          key={plan.equipmentPreventiveScheduleId}
                          value={planId}
                        >
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

              <Button
                variant="primary"
                size="sm"
                className="w-100 py-1.5 fw-bold shadow-2xs d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: "0.8rem" }}
                onClick={handleAddNewTask}
                disabled={!taskDescription.trim()}
              >
                <span>+</span> Add Task
              </Button>
            </div>

            {/* Lista de Tareas Agregadas */}
            <div
              className="d-flex flex-column gap-2 overflow-auto pe-1"
              style={{ maxHeight: "190px" }}
            >
              {workOrderData.tasks.length > 0 ? (
                workOrderData.tasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-2.5 rounded-3 border border-start-4 border-start-primary shadow-2xs d-flex align-items-center justify-content-between"
                  >
                    <div className="d-flex align-items-start gap-2 overflow-hidden me-2">
                      <span
                        className="badge bg-light text-secondary rounded-circle px-2 py-1 border fw-bold"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {idx + 1}
                      </span>
                      <div className="d-flex flex-column overflow-hidden">
                        <span
                          className="fw-semibold text-dark text-truncate"
                          style={{ fontSize: "0.82rem" }}
                        >
                          {t.taskDescription}
                        </span>

                        {(t.equipmentIssueId || t.preventivePlanId) && (
                          <div className="d-flex gap-1 mt-1 flex-wrap">
                            {t.equipmentIssueId && (
                              <span
                                className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-medium px-2 py-0.5 rounded-pill"
                                style={{ fontSize: "0.68rem" }}
                              >
                                ⚠️ Issue #{t.equipmentIssueId}
                              </span>
                            )}
                            {t.preventivePlanId && (
                              <span
                                className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-medium px-2 py-0.5 rounded-pill"
                                style={{ fontSize: "0.68rem" }}
                              >
                                📅 Plan #{t.preventivePlanId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="btn-icon-sm rounded-circle border-0 p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "26px",
                        height: "26px",
                        fontSize: "0.85rem",
                      }}
                      onClick={() => removeTask(idx)}
                      title="Remove Task"
                    >
                      🗑️
                    </Button>
                  </div>
                ))
              ) : (
                <div
                  className="text-center py-3 text-muted rounded-3 bg-white border border-dashed d-flex flex-column align-items-center gap-1"
                  style={{ fontSize: "0.78rem" }}
                >
                  <span style={{ fontSize: "1.2rem" }}>📝</span>
                  <span>
                    No tasks added yet. Fill out the field above to start.
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0 px-3 pb-3">
          <Button
            variant="light"
            size="sm"
            className="px-3 py-1.5 fw-semibold border"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="dark"
            size="sm"
            className="px-4 py-1.5 fw-semibold shadow-xs"
            onClick={handleSubmit}
            disabled={workOrderData.tasks.length === 0}
          >
            Create Order
          </Button>
        </Modal.Footer>
      </Modal>

      {showPinModal && (
        <UserPinValidationModal
          show={showPinModal}
          title="Authorise Work Order Creation"
          actionDescription={`Authorising WO for Equipment #${equipmentSelected?.number || ""}`}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleConfirmValidation}
        />
      )}
    </>
  );
}

export default WorkOrderCreation;
