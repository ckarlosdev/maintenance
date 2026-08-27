import { Badge, Button, ProgressBar, Table } from "react-bootstrap";
import useWorkOrderStore from "../stores/useWorkOrderStore";
import {
  useCloseWorkOrder,
  useGetWorkOrdesrsByEquipmentId,
  useUpdateTask,
} from "../hooks/useWorkOrders";
import { useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaRegCircle,
} from "react-icons/fa";
import { UserPinValidationModal } from "./TaskValidationModal";
import type {
  Mechanic,
  Task,
  UpdateWorkOrderTaskDto,
  WorkOrder,
} from "../types";
import { TaskModal } from "./workOrder/TaskModal";
import React from "react";
import { CloseWorkOrderModal } from "./workOrder/CloseWorkOrderPayload";

type ActionType = "TASK_TOGGLE" | "CREATE_WORK_ORDER" | "CLOSE_WORK_ORDER";

interface ValidationContext {
  type: ActionType;
  title: string;
  description: string;
  payload?: any;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const [datePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-");
  return `${month}/${day}/${year}`;
};

export function WorkOrderTable() {
  const equipmentSelected = useWorkOrderStore(
    (state) => state.equipmentSelected,
  );
  const { showClosed } = useWorkOrderStore();

  const [validationContext, setValidationContext] =
    useState<ValidationContext | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null,
  );
  const [workOrderToClose, setWorkOrderToClose] = useState<WorkOrder | null>(
    null,
  );

  const equipmentId = equipmentSelected?.equipmentsId ?? 0;
  const { data: workOrders } = useGetWorkOrdesrsByEquipmentId(equipmentId);

  const { mutate: updateTask } = useUpdateTask();
  const { mutate: closeWorkOrder } = useCloseWorkOrder();

  const sortedWorkOrders = useMemo(() => {
    const orders = workOrders ?? [];
    const filtered = orders.filter((order) =>
      showClosed ? true : order.orderStatus !== "CLOSED",
    );
    return [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [workOrders, showClosed]);

  const toggleRow = (id: number) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  const handleValidationConfirm = (mechanic: Mechanic) => {
    if (!validationContext) return;
    console.log(mechanic);

    switch (validationContext.type) {
      case "TASK_TOGGLE": {
        const { task } = validationContext.payload;

        const payload: UpdateWorkOrderTaskDto = {
          taskDescription: task.taskDescription,
          isCompleted: !task.isCompleted,
          preventivePlanId: task.preventivePlanId ?? null,
          equipmentIssueId: task.equipmentIssueId ?? null,
          updatedBy: mechanic.fullName,
        };

        updateTask(
          { taskId: task.id, dto: payload },
          {
            onSuccess: () => setValidationContext(null),
            onError: (error) => {
              console.error("Error al actualizar la tarea:", error);
            },
          },
        );
        break;
      }

      case "CLOSE_WORK_ORDER": {
        const { workOrderId, nextScheduleData } = validationContext.payload;

        closeWorkOrder(
          {
            workOrderId,
            data: {
              orderStatus: "CLOSED",
              userName: mechanic.fullName,
              totalCost: 0,
              nextSchedule: nextScheduleData ?? null,
            },
          },
          {
            onSuccess: () => setValidationContext(null),
            onError: (error) => {
              console.error("Error al cerrar la orden de trabajo:", error);
            },
          },
        );
        break;
      }

      default:
        break;
    }
  };

  const handleOpenTaskValidation = (task: Task) => {
    setValidationContext({
      type: "TASK_TOGGLE",
      title: task.isCompleted ? "Reopen Task" : "Complete Task",
      description: task.taskDescription,
      payload: { task },
    });
  };

  const handleInitiateCloseWorkOrder = (workOrder: WorkOrder) => {
    const tasks = workOrder.tasks ?? [];
    const hasPreventiveTask = tasks.some((task) => Boolean(task.schedule));

    if (hasPreventiveTask) {
      setWorkOrderToClose(workOrder);
    } else {
      setValidationContext({
        type: "CLOSE_WORK_ORDER",
        title: "Close Work Order",
        description: `Are you sure you want to close Work Order #${workOrder.id}?`,
        payload: { workOrderId: workOrder.id },
      });
    }
  };

  const handleCloseWorkOrderModalConfirm = (nextScheduleData: any) => {
    if (!workOrderToClose) return;

    setValidationContext({
      type: "CLOSE_WORK_ORDER",
      title: "Confirm Work Order Closure",
      description: `Close Work Order #${workOrderToClose.id} and set next schedule?`,
      payload: {
        workOrderId: workOrderToClose.id,
        nextScheduleData,
      },
    });

    setWorkOrderToClose(null);
  };

  const handleOpenAddTaskModal = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
  };

  const handleCloseAddTaskModal = () => {
    setSelectedWorkOrder(null);
  };

  return (
    <>
      <div className="equipment-container mt-1">
        <div className="text-muted small mb-2 px-1">
          Showing <strong>{sortedWorkOrders.length}</strong>{" "}
          {showClosed ? "total" : "active"} work orders
        </div>
        <div className="table-responsive shadow-sm rounded-3 bg-white border">
          <Table hover className="align-middle mb-0 custom-equipment-table">
            <thead className="table-light text-center">
              <tr>
                <th style={{ width: "50px" }}></th>
                <th>WO #</th>
                <th>Type</th>
                <th>Status</th>
                <th>Progress / Tasks</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedWorkOrders.map((item) => {
                const tasks = item.tasks ?? [];
                const completedTasksCount = tasks.filter(
                  (t) => t.isCompleted,
                ).length;
                const totalTasks = tasks.length;
                const progressPercentage =
                  totalTasks > 0
                    ? Math.round((completedTasksCount / totalTasks) * 100)
                    : 0;
                const isExpanded = activeAccordion === item.id;
                const isClosed =
                  item.orderStatus === "CLOSED" || item.orderStatus === "CLOSE";

                return (
                  <React.Fragment key={item.id}>
                    {/* Fila Principal */}
                    <tr className="text-center">
                      <td>
                        <Button
                          variant="light"
                          size="sm"
                          className="rounded-circle p-2 touch-btn"
                          onClick={() => toggleRow(item.id)}
                        >
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </Button>
                      </td>
                      <td className="fw-bold text-dark fs-6">#{item.id}</td>
                      <td>
                        <Badge
                          pill
                          className="bg-light text-dark border px-3 py-2 fs-7"
                        >
                          {item.orderType}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={
                            item.orderStatus === "CLOSED"
                              ? "success"
                              : item.orderStatus === "OPEN"
                                ? "warning"
                                : "secondary"
                          }
                          className="px-3 py-2 fs-7"
                        >
                          {item.orderStatus}
                        </Badge>
                      </td>
                      <td className="px-3" style={{ minWidth: "200px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-bold text-muted">
                            {completedTasksCount} / {totalTasks} Tasks
                          </small>
                          <small className="fw-bold text-primary">
                            {progressPercentage}%
                          </small>
                        </div>
                        <ProgressBar
                          now={progressPercentage}
                          variant={
                            progressPercentage === 100 ? "success" : "primary"
                          }
                          style={{ height: "8px" }}
                        />
                      </td>
                      <td>
                        <span className="text-muted fs-7">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(item.createdAt)}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant={isExpanded ? "primary" : "outline-primary"}
                          size="sm"
                          className="px-3 py-2 fw-medium touch-btn"
                          onClick={() => toggleRow(item.id)}
                        >
                          {isExpanded ? "Hide Tasks" : "View Tasks"}
                        </Button>
                      </td>
                    </tr>

                    {/* Fila Acordeón Expandible */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0 border-0">
                          <div className="bg-light p-4 border-bottom text-start shadow-inner">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="fw-bold text-secondary mb-0">
                                Work Order Tasks Checklist
                              </h6>
                              <div className="d-flex gap-2">
                                {!isClosed && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="fw-bold touch-btn"
                                    onClick={() => handleOpenAddTaskModal(item)}
                                  >
                                    + Add task
                                  </Button>
                                )}
                                {completedTasksCount === totalTasks &&
                                  totalTasks > 0 &&
                                  !isClosed && (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      className="fw-bold touch-btn"
                                      onClick={() =>
                                        handleInitiateCloseWorkOrder(item)
                                      }
                                    >
                                      Complete Work Order
                                    </Button>
                                  )}
                              </div>
                            </div>

                            {tasks.length === 0 ? (
                              <div className="text-muted fst-italic p-2">
                                No tasks assigned to this order.
                              </div>
                            ) : (
                              <div className="d-flex flex-column gap-2">
                                {tasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className={`d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white ${
                                      task.isCompleted
                                        ? "border-success-subtle bg-success-subtle"
                                        : ""
                                    }`}
                                    style={{ minHeight: "72px" }}
                                  >
                                    {/* Izquierda: Check + Descripción */}
                                    <div
                                      className="d-flex align-items-center gap-3"
                                      style={{
                                        minWidth: "220px",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {task.isCompleted ? (
                                        <FaCheckCircle className="text-success fs-4" />
                                      ) : (
                                        <FaRegCircle className="text-muted fs-4" />
                                      )}
                                      <span
                                        className={`fs-6 ${
                                          task.isCompleted
                                            ? "text-decoration-line-through text-muted"
                                            : "fw-medium"
                                        }`}
                                      >
                                        {task.taskDescription}
                                      </span>
                                    </div>

                                    {/* Centro: Contexto (Issue / Schedule / Manual) */}
                                    <div className="flex-grow-1 px-3 border-start mx-3">
                                      {task.issue && (
                                        <div className="d-flex flex-wrap align-items-center gap-2 small">
                                          <Badge
                                            bg="warning"
                                            text="dark"
                                            className="fw-normal"
                                          >
                                            Equipment Issue
                                          </Badge>
                                          <span className="text-muted">
                                            Issue ID: {task.issue.id}
                                          </span>
                                          <Badge
                                            bg={
                                              task.issue.severity === "HIGH"
                                                ? "danger"
                                                : "warning"
                                            }
                                            text="white"
                                            className="fw-bold"
                                          >
                                            {task.issue.severity}
                                          </Badge>

                                          <div className="w-100 text-muted mt-1 small">
                                            <span>
                                              <strong>By:</strong>{" "}
                                              {task.issue.reportedBy}
                                            </span>
                                            <span className="ms-3">
                                              <strong>Date:</strong>{" "}
                                              {task.issue.reportedAt
                                                ? new Date(
                                                    task.issue.reportedAt,
                                                  ).toLocaleDateString()
                                                : "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {task.schedule && (
                                        <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
                                          <Badge
                                            bg="info"
                                            text="dark"
                                            className="fw-normal"
                                          >
                                            Preventive Plan
                                          </Badge>
                                          <span>
                                            Plan ID:{" "}
                                            {task.schedule.preventivePlanId}
                                          </span>
                                          <span className="ms-2 fw-medium text-dark">
                                            📅 Due:{" "}
                                            {task.schedule.dueDate || "N/A"}
                                            {task.schedule.dueMeter &&
                                              ` (${task.schedule.dueMeter} hrs/km)`}
                                          </span>
                                        </div>
                                      )}

                                      {!task.issue && !task.schedule && (
                                        <span className="text-muted fst-italic small">
                                          Manual Task
                                        </span>
                                      )}
                                    </div>

                                    {/* Derecha: Acciones */}
                                    {!isClosed && (
                                      <Button
                                        variant={
                                          task.isCompleted
                                            ? "outline-secondary"
                                            : "outline-success"
                                        }
                                        size="sm"
                                        className="px-3 py-2 touch-btn fw-bold"
                                        onClick={() =>
                                          handleOpenTaskValidation(task)
                                        }
                                      >
                                        {task.isCompleted
                                          ? "Reopen"
                                          : "Mark Done"}
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal para ingresar PIN */}
      {validationContext && (
        <UserPinValidationModal
          show={Boolean(validationContext)}
          title={validationContext.title}
          actionDescription={validationContext.description}
          onClose={() => setValidationContext(null)}
          onConfirm={handleValidationConfirm}
        />
      )}

      {/* Modal para agregar tareas manuales */}
      {selectedWorkOrder && (
        <TaskModal
          show={Boolean(selectedWorkOrder)}
          onClose={handleCloseAddTaskModal}
          workOrder={{
            id: selectedWorkOrder.id,
            equipmentId: selectedWorkOrder.equipmentId,
            equipmentNumber: "test",
            existingTasks: (selectedWorkOrder.tasks ?? []).map((task) => ({
              preventivePlanId: task.schedule?.preventivePlanId ?? null,
              equipmentIssueId: task.issue?.id ?? null,
            })),
          }}
        />
      )}

      {/* Modal para calcular/programar el próximo mantenimiento antes del PIN */}
      {workOrderToClose && (
        <CloseWorkOrderModal
          show={Boolean(workOrderToClose)}
          workOrder={workOrderToClose}
          onClose={() => setWorkOrderToClose(null)}
          onConfirm={handleCloseWorkOrderModalConfirm}
        />
      )}
    </>
  );
}

export default WorkOrderTable;
