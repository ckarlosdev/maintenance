import { Card, Col, Form, Row } from "react-bootstrap";
import useWorkOrderStore from "../stores/useWorkOrderStore";
import type { WorkOrder } from "../types";
import { useGetWorkOrdesrsByEquipmentId } from "../hooks/useWorkOrders";

type Props = {};

function EquipmentData({}: Props) {
  const { equipmentSelected } = useWorkOrderStore();

  const { data: workOrders } = useGetWorkOrdesrsByEquipmentId(
    equipmentSelected?.equipmentsId!!,
  );

  function getLastWorkOrderDate(workOrders: WorkOrder[]): string | null {
    if (!workOrders || workOrders.length === 0) return null;

    const latestWorkOrder = workOrders.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt)
        ? current
        : latest;
    });

    return latestWorkOrder.createdAt;
  }

  function formatDate(dateString: string | undefined | null): string | null {
    if (!dateString) return null;

    // Extrae la parte "YYYY-MM-DD" omitiendo la hora
    const [datePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-");

    // Retorna en formato MM/DD/YYYY
    return `${month}/${day}/${year}`;
  }

  return (
    <>
      <Card className="shadow-sm border-0 bg-light">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center mb-2 pb-1 border-bottom border-light-subtle">
            <span
              className="badge bg-success-subtle text-success border border-success-subtle rounded-circle me-2"
              style={{ padding: "4px" }}
            >
              =
            </span>
            <span
              className="fw-bold text-secondary text-uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.05em" }}
            >
              Equipment Selected
            </span>
          </div>

          {/* Grilla 2x2 perfecta para iPad */}
          <Row className="g-2">
            {/* 1. No. de Trabajo */}
            <Col sm={6} xs={12}>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text bg-white border-secondary-subtle text-muted fw-semibold"
                  style={{ fontSize: "12px", width: "85px" }}
                >
                  No.
                </span>
                <Form.Control
                  type="text"
                  className="bg-white fw-bold border-secondary-subtle text-dark"
                  value={equipmentSelected?.number}
                  readOnly
                  disabled
                />
              </div>
            </Col>

            {/* 2. Nombre del Trabajo */}
            <Col sm={6} xs={12}>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text bg-white border-secondary-subtle text-muted fw-semibold"
                  style={{ fontSize: "12px", width: "85px" }}
                >
                  Name
                </span>
                <Form.Control
                  type="text"
                  className="bg-white fw-semibold border-secondary-subtle text-dark"
                  value={equipmentSelected?.name}
                  readOnly
                  disabled
                />
              </div>
            </Col>

            {/* 3. Dirección */}
            <Col sm={6} xs={12}>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text bg-white border-secondary-subtle text-muted fw-semibold"
                  style={{ fontSize: "12px", width: "85px" }}
                >
                  Odometer
                </span>
                <Form.Control
                  type="text"
                  className="bg-white fw-semibold border-secondary-subtle text-dark"
                  value={equipmentSelected?.hour}
                  readOnly
                  disabled
                />
              </div>
            </Col>

            {/* 4. Contratista */}
            <Col sm={6} xs={12}>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text bg-white border-secondary-subtle text-muted fw-semibold"
                  style={{ fontSize: "12px", width: "85px" }}
                >
                  Last time
                </span>
                <Form.Control
                  type="text"
                  className="bg-white fw-semibold border-secondary-subtle text-dark"
                  value={
                    formatDate(getLastWorkOrderDate(workOrders!!)) || "No data found"
                  }
                  readOnly
                  disabled
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}

export default EquipmentData;
