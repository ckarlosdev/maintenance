import React from "react";
import {
  Modal,
  Badge,
  Card,
  Row,
  Col,
  Button,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import {
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiMaximize2,
} from "react-icons/fi";
import { useModalStore } from "../stores/useModalStore";
import { useGetWorkOrderById } from "../hooks/useWorkOrders";
import useEquipments from "../hooks/useEquipments";

export const QuickView: React.FC = () => {
  const { activeModal, data, closeModal } = useModalStore();
  const isOpen = activeModal === "WORK_ORDER_DETAIL";
  const workOrderId = typeof data === "number" ? data : null;
  const activeId = isOpen && workOrderId ? workOrderId : 0;
  const { data: workOrder, isLoading, isError } = useGetWorkOrderById(activeId);
  const { data: equipments } = useEquipments();

  if (!isOpen) return null;

  const equipment = equipments?.find(
    (equip) => equip.equipmentsId === workOrder?.equipmentId,
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      DRAFT: { bg: "secondary-subtle", text: "dark" },
      IN_PROGRESS: { bg: "primary", text: "white" },
      COMPLETED: { bg: "success", text: "white" },
      CANCELLED: { bg: "danger", text: "white" },
    };

    // Si el estado no coincide con ninguno, usa un estilo neutro por defecto
    const current = styles[status] || { bg: "light", text: "dark" };

    return (
      <Badge
        bg={current.bg}
        text={current.text}
        className="fw-semibold px-2 py-1 fs-7 border"
      >
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: "secondary",
      MEDIUM: "warning",
      HIGH: "danger",
      CRITICAL: "dark",
    };

    const bg = colors[severity] || "secondary";

    return (
      <Badge bg={bg} className="fs-8">
        {severity}
      </Badge>
    );
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-EN", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      centered
      scrollable
      className="font-sans"
    >
      {/* 1. Estado de Carga (Loading) */}
      {isLoading && (
        <Modal.Body className="text-center py-5">
          <Spinner
            animation="border"
            variant="primary"
            role="status"
            className="mb-2"
          />
          <p className="text-muted mb-0 fs-7">Loading work order details...</p>
        </Modal.Body>
      )}

      {/* 2. Estado de Error */}
      {isError && (
        <Modal.Body className="text-center py-5">
          <p className="text-danger mb-2">Error al cargar la información.</p>
          <Button variant="outline-secondary" size="sm" onClick={closeModal}>
            Close
          </Button>
        </Modal.Body>
      )}

      {/* 3. Contenido Principal cuando workOrder EXISTE */}
      {workOrder && (
        <>
          <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="text-uppercase tracking-wider fw-bold text-muted fs-8">
                  Work Order #{workOrder.id}
                </span>
                <Badge
                  bg={workOrder.orderType === "CORRECTIVE" ? "warning" : "info"}
                  text="dark"
                  className="fs-8"
                >
                  {workOrder.orderType}
                </Badge>
                {getStatusBadge(workOrder.orderStatus)}
              </div>
              <Modal.Title className="fw-bold fs-4 text-dark">
                Equipment #{equipment?.number}
              </Modal.Title>
            </div>
          </Modal.Header>

          <Modal.Body className="px-4 py-3">
            {/* Metadatos Generales */}
            <Card className="border-0 bg-light rounded-3 mb-4 shadow-sm">
              <Card.Body className="p-3">
                <Row className="g-3 fs-7">
                  <Col xs={6} md={4}>
                    <div className="text-muted mb-1 d-flex align-items-center gap-1">
                      <FiUser size={14} /> Created By
                    </div>
                    <strong className="text-dark d-block text-truncate">
                      {workOrder.createdBy}
                    </strong>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="text-muted mb-1 d-flex align-items-center gap-1">
                      <FiClock size={14} /> Created At
                    </div>
                    <strong className="text-dark d-block">
                      {formatDate(workOrder.createdAt)}
                    </strong>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="text-muted mb-1 d-flex align-items-center gap-1">
                      <FiMaximize2 size={14} /> Tasks Count
                    </div>
                    <strong className="text-dark d-block">
                      {workOrder.tasks?.length ?? 0} tasks
                    </strong>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Lista de Tareas */}
            <h6 className="fw-bold text-dark mb-3 fs-7 text-uppercase tracking-wide">
              Tasks Breakdown
            </h6>

            <ListGroup variant="flush" className="gap-2">
              {workOrder.tasks?.map((task) => (
                <ListGroup.Item
                  key={task.id}
                  className="border rounded-3 p-3 bg-white shadow-sm"
                >
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <FiCheckCircle
                        size={18}
                        className={
                          task.isCompleted
                            ? "text-success"
                            : "text-muted opacity-50"
                        }
                      />
                      <span
                        className={`fw-semibold fs-6 ${
                          task.isCompleted
                            ? "text-decoration-line-through text-muted"
                            : "text-dark"
                        }`}
                      >
                        {task.taskDescription}
                      </span>
                    </div>
                    <span className="text-muted fs-8">Task #{task.id}</span>
                  </div>

                  {/* Sub-tarjeta de Issue */}
                  {task.issue && (
                    <div className="mt-2 p-2.5 bg-danger-subtle border border-danger-subtle rounded-2 fs-7">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-danger d-inline-flex align-items-center gap-1">
                          <FiAlertCircle size={14} /> Linked Issue #
                          {task.issue.id}
                        </span>
                        {getSeverityBadge(task.issue.severity)}
                      </div>
                      <p className="mb-1 text-dark-emphasis">
                        {task.issue.issueDescription}
                      </p>
                      <div className="text-muted fs-8">
                        Reported by <strong>{task.issue.reportedBy}</strong> on{" "}
                        {formatDate(task.issue.reportedAt)}
                      </div>
                    </div>
                  )}

                  {/* Sub-tarjeta de Schedule */}
                  {task.schedule && (
                    <div className="mt-2 p-2.5 bg-primary-subtle border border-primary-subtle rounded-2 fs-7">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-primary d-inline-flex align-items-center gap-1">
                          <FiCalendar size={14} /> Preventive Schedule #
                          {task.schedule.id}
                        </span>
                        {task.schedule.isOverdue && (
                          <Badge bg="danger" className="fs-8">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <Row className="g-2 text-muted fs-8">
                        <Col xs={6}>
                          Due Date:{" "}
                          <strong className="text-dark">
                            {task.schedule.dueDate || "N/A"}
                          </strong>
                        </Col>
                        <Col xs={6}>
                          Due Meter:{" "}
                          <strong className="text-dark">
                            {task.schedule.dueMeter
                              ? `${task.schedule.dueMeter} hrs`
                              : "N/A"}
                          </strong>
                        </Col>
                      </Row>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-2 pb-4 px-4">
            <Button
              variant="light"
              className="px-4 fw-semibold border fs-7"
              onClick={closeModal}
            >
              Close
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};
