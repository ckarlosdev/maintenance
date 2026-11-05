import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import {
  FaCheck,
  FaEdit,
  FaExclamationCircle,
  FaInbox,
  FaPlus,
  FaTimes,
  FaTools,
} from "react-icons/fa";
import { isAxiosError } from "axios";
import { useModalStore } from "../../stores/useModalStore";
import {
  useCreateService,
  useServices,
  useUpdateService,
} from "../../hooks/useServices";
import type { ServiceType } from "../../types";

type Feedback = { variant: "success" | "danger"; text: string } | null;

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return (error as Error)?.message || "Unexpected error";
};

function ServicesModal() {
  const { activeModal, closeModal } = useModalStore();
  const isOpen = activeModal === "SERVICES_MANAGER";

  const { data: services = [], isLoading, isError, error } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  if (!isOpen) return null;

  const isDuplicate = (name: string, excludeId?: number) =>
    services.some(
      (s) =>
        s.id !== excludeId &&
        s.serviceName.trim().toLowerCase() === name.toLowerCase(),
    );

  const handleClose = () => {
    setNewName("");
    setEditingId(null);
    setEditValue("");
    setFeedback(null);
    createMutation.reset();
    updateMutation.reset();
    closeModal();
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();

    if (!name) {
      setFeedback({ variant: "danger", text: "Service name is required." });
      return;
    }
    if (isDuplicate(name)) {
      setFeedback({
        variant: "danger",
        text: `A service named "${name}" already exists.`,
      });
      return;
    }

    createMutation.mutate(
      { serviceName: name },
      {
        onSuccess: () => {
          setNewName("");
          setFeedback({
            variant: "success",
            text: `Service "${name}" created.`,
          });
        },
        onError: (err) =>
          setFeedback({ variant: "danger", text: getErrorMessage(err) }),
      },
    );
  };

  const startEdit = (service: ServiceType) => {
    setEditingId(service.id);
    setEditValue(service.serviceName);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleUpdate = (service: ServiceType) => {
    const name = editValue.trim();

    if (!name) {
      setFeedback({ variant: "danger", text: "Service name is required." });
      return;
    }
    if (name === service.serviceName) {
      cancelEdit();
      return;
    }
    if (isDuplicate(name, service.id)) {
      setFeedback({
        variant: "danger",
        text: `A service named "${name}" already exists.`,
      });
      return;
    }

    updateMutation.mutate(
      { id: service.id, serviceName: name },
      {
        onSuccess: () => {
          cancelEdit();
          setFeedback({
            variant: "success",
            text: `Service updated to "${name}".`,
          });
        },
        onError: (err) =>
          setFeedback({ variant: "danger", text: getErrorMessage(err) }),
      },
    );
  };

  const handleEditKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    service: ServiceType,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdate(service);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelEdit();
    }
  };

  const sortedServices = [...services].sort((a, b) => a.id - b.id);

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      centered
      size="lg"
      keyboard={editingId === null}
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden bg-white"
    >
      <Modal.Header
        closeButton
        className="px-4 pt-4 pb-3 border-bottom bg-light bg-gradient"
      >
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center">
            <FaTools size={20} />
          </div>
          <div>
            <Modal.Title className="fs-5 fw-bold text-dark mb-0">
              Services
            </Modal.Title>
            <p className="text-muted small mb-0">
              Add new service types or rename existing ones
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0 bg-white">
        {/* Formulario para agregar */}
        <Form onSubmit={handleCreate} className="px-4 pt-3 pb-3 border-bottom">
          <Form.Label className="small fw-semibold text-secondary mb-1">
            New service
          </Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              size="sm"
              placeholder="e.g. Oil change"
              value={newName}
              maxLength={100}
              disabled={createMutation.isPending}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="d-flex align-items-center gap-1 px-3 text-nowrap"
              disabled={createMutation.isPending || !newName.trim()}
            >
              {createMutation.isPending ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FaPlus size={11} />
              )}
              Add
            </Button>
          </div>
        </Form>

        {feedback && (
          <div className="px-4 pt-3">
            <Alert
              variant={feedback.variant}
              dismissible
              onClose={() => setFeedback(null)}
              className="border-0 rounded-3 py-2 small mb-0"
            >
              {feedback.text}
            </Alert>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-5 my-3">
            <Spinner
              animation="border"
              variant="primary"
              size="sm"
              className="mb-2"
            />
            <p className="text-muted small mb-0 fw-medium">
              Loading services...
            </p>
          </div>
        )}

        {isError && (
          <div className="p-4">
            <div className="alert alert-danger border-0 rounded-3 p-3 d-flex align-items-center gap-2 small mb-0 shadow-sm">
              <FaExclamationCircle size={18} className="flex-shrink-0" />
              <span>Error loading services: {getErrorMessage(error)}</span>
            </div>
          </div>
        )}

        {!isLoading && !isError && services.length === 0 && (
          <div className="text-center py-5 my-3 text-muted">
            <div className="p-3 rounded-circle bg-light d-inline-block mb-2">
              <FaInbox size={28} className="text-secondary opacity-50" />
            </div>
            <p className="mb-0 small fw-medium">No services registered yet.</p>
          </div>
        )}

        {!isLoading && !isError && services.length > 0 && (
          <div
            className="table-responsive mt-3"
            style={{ maxHeight: "420px", overflowY: "auto" }}
          >
            <Table hover className="mb-0 border-0 align-middle">
              <thead
                className="sticky-top bg-light shadow-sm"
                style={{ zIndex: 1 }}
              >
                <tr className="border-bottom text-secondary small text-uppercase">
                  <th
                    className="fw-bold bg-light py-2 ps-4"
                    style={{ width: 90 }}
                  >
                    ID
                  </th>
                  <th className="fw-bold bg-light py-2">Service name</th>
                  <th
                    className="fw-bold bg-light py-2 pe-4 text-end"
                    style={{ width: 130 }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service) => {
                  const isEditing = editingId === service.id;
                  const isSaving = isEditing && updateMutation.isPending;

                  return (
                    <tr key={service.id} className="border-bottom border-light">
                      <td className="py-2 ps-4 text-muted small">
                        #{service.id}
                      </td>
                      <td className="py-2">
                        {isEditing ? (
                          <Form.Control
                            size="sm"
                            autoFocus
                            value={editValue}
                            maxLength={100}
                            disabled={isSaving}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) =>
                              handleEditKeyDown(
                                e as KeyboardEvent<HTMLInputElement>,
                                service,
                              )
                            }
                          />
                        ) : (
                          <span className="fw-semibold text-dark">
                            {service.serviceName}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pe-4 text-end">
                        {isEditing ? (
                          <div className="d-inline-flex gap-1">
                            <Button
                              size="sm"
                              variant="success"
                              title="Save"
                              disabled={isSaving || !editValue.trim()}
                              onClick={() => handleUpdate(service)}
                            >
                              {isSaving ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <FaCheck size={12} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              title="Cancel"
                              disabled={isSaving}
                              onClick={cancelEdit}
                            >
                              <FaTimes size={12} />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            title="Edit"
                            disabled={
                              editingId !== null || updateMutation.isPending
                            }
                            onClick={() => startEdit(service)}
                          >
                            <FaEdit size={12} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="px-4 py-3 border-top bg-light bg-opacity-50 d-flex justify-content-between align-items-center">
        <span className="text-muted small">
          Total:{" "}
          <strong className="text-dark bg-white px-2 py-1 rounded border shadow-sm">
            {services.length}
          </strong>
        </span>
        <Button
          variant="white"
          className="btn-sm border shadow-sm fw-medium px-3 rounded-3 text-dark"
          onClick={handleClose}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ServicesModal;
