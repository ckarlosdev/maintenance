import { useState } from "react";
import { Modal, Button, Row, Col, Card } from "react-bootstrap";
import { FaUser, FaLock, FaBackspace, FaCheck, FaTimes } from "react-icons/fa";
import "../styles/modalValidation.css";
import { useActiveMechanics, useValidatePin } from "../hooks/useMechanic";
import type { Mechanic } from "../types";

interface UserPinValidationModalProps {
  show: boolean;
  title?: string;
  actionDescription: string; // Descripción contextual (ej: "Task: Lubricación de chasis" o "Creación de Work Order #402")
  onClose: () => void;
  /** Devuelve el mecánico seleccionado y el PIN ingresado */
  onConfirm: (mechanic: Mechanic) => void;
}

export function UserPinValidationModal({
  show,
  title = "Validate Action",
  actionDescription,
  onClose,
  onConfirm,
}: UserPinValidationModalProps) {
  const [selectedMechanicId, setSelectedMechanicId] = useState<number | null>(
    null,
  );
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { data: mechanics } = useActiveMechanics();

  const { mutate: validatePin } = useValidatePin();

  const handleNumClick = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  const handlePinSubmit = () => {
    if (!selectedMechanicId) {
      setError("Please select a user.");
      return;
    }

    if (!pin || pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }

    setError(null);

    validatePin(
      { mechanicId: selectedMechanicId, pin },
      {
        onSuccess: (mechanicVerified) => {
          onConfirm(mechanicVerified);
          handleResetAndClose();
        },
        onError: () => {
          setError("Invalid PIN or mechanic not found.");
        },
      },
    );
  };

  const mechanicsSorted = mechanics?.sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );

  const handleResetAndClose = () => {
    setSelectedMechanicId(null);
    setPin("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleResetAndClose}
      centered
      backdrop="static"
      dialogClassName="responsive-touch-modal"
    >
      <Modal.Header
        closeButton
        className="bg-dark text-white border-0 py-2 px-3"
      >
        <Modal.Title className="fs-6 fw-bold">
          <FaCheck className="text-success me-2" /> {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 bg-light">
        {/* Detalle compacto de la Acción/Contexto */}
        <Card className="mb-3 border-0 shadow-sm bg-white">
          <Card.Body className="py-2 px-3">
            <small className="text-muted fw-bold text-uppercase fs-8">
              Action context:
            </small>
            <div className="fs-6 fw-bold text-dark text-truncate">
              {actionDescription}
            </div>
          </Card.Body>
        </Card>

        {error && (
          <div className="alert alert-danger fw-bold py-1 px-2 mb-2 text-center fs-7">
            {error}
          </div>
        )}

        <Row className="g-3">
          {/* Selección de Mecánico */}
          <Col xs={12} md={6}>
            <label className="fw-bold text-secondary mb-1 fs-7">
              <FaUser className="me-1" /> 1. Select User:
            </label>
            <div className="d-flex flex-column gap-1.5 mechanic-list-container">
              {mechanicsSorted?.map((mechanic) => {
                const isSelected = selectedMechanicId === mechanic.id;
                return (
                  <Button
                    key={mechanic.id}
                    variant={isSelected ? "primary" : "white"}
                    className={`text-start p-2 border rounded-3 d-flex justify-content-between align-items-center touch-btn shadow-sm ${
                      isSelected ? "border-primary fw-bold" : "text-dark"
                    }`}
                    onClick={() => {
                      setSelectedMechanicId(mechanic.id);
                      setError(null);
                    }}
                  >
                    <div>
                      <div className="fs-7">{mechanic.fullName}</div>
                    </div>
                    {isSelected && <FaCheck className="fs-7" />}
                  </Button>
                );
              })}
            </div>
          </Col>

          {/* Teclado Numérico */}
          <Col xs={12} md={6}>
            <label className="fw-bold text-secondary mb-1 fs-7">
              <FaLock className="me-1" /> 2. PIN:
            </label>

            <div className="bg-white border rounded-3 py-1 px-2 mb-2 text-center shadow-sm">
              <div
                className="fs-4 fw-bold text-primary tracking-widest"
                style={{ minHeight: "32px", letterSpacing: "8px" }}
              >
                {pin ? (
                  "•".repeat(pin.length)
                ) : (
                  <span className="text-muted fs-6">____</span>
                )}
              </div>
            </div>

            <div
              className="d-grid gap-1.5"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
            >
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <Button
                  key={num}
                  variant="outline-secondary"
                  className="py-2 fs-5 fw-bold bg-white touch-num-btn shadow-sm"
                  onClick={() => handleNumClick(num)}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline-danger"
                className="py-2 fs-6 fw-bold bg-white touch-num-btn"
                onClick={handleClear}
              >
                C
              </Button>
              <Button
                variant="outline-secondary"
                className="py-2 fs-5 fw-bold bg-white touch-num-btn shadow-sm"
                onClick={() => handleNumClick("0")}
              >
                0
              </Button>
              <Button
                variant="outline-warning"
                className="py-2 fs-6 fw-bold bg-white touch-num-btn"
                onClick={handleBackspace}
              >
                <FaBackspace />
              </Button>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-white p-2 border-top-0 d-flex gap-2">
        <Button
          variant="light"
          size="sm"
          className="flex-grow-1 py-2 border fw-bold text-secondary touch-btn fs-7"
          onClick={handleResetAndClose}
        >
          <FaTimes className="me-1" /> Cancel
        </Button>
        <Button
          variant="success"
          size="sm"
          className="flex-grow-1 py-2 fw-bold touch-btn fs-7"
          onClick={handlePinSubmit}
        >
          <FaCheck className="me-1" /> Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
