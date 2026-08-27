import { Badge, Button, Card, Col, Modal, Row } from "react-bootstrap";
import useIssueStore from "../../stores/useIssueStore";
import { FaEye, FaPlus } from "react-icons/fa";
import useWorkOrderStore from "../../stores/useWorkOrderStore";
import { useModalStore } from "../../stores/useModalStore";

function IssuesModal() {
  const { showModal, setShowModal, issues, equipmentSelected } =
    useIssueStore();

  const { setEquipmentSelected, setShowModal: setShowModalWo } =
    useWorkOrderStore();

  const { openModal } = useModalStore();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge bg="danger">Critical</Badge>;
      case "MEDIUM":
        return (
          <Badge bg="warning" text="dark">
            Medium
          </Badge>
        );
      default:
        return (
          <Badge bg="info" text="dark">
            Low
          </Badge>
        );
    }
  };

  // Helper para estado de la falla
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return <Badge bg="primary">In progress</Badge>;
      case "OPEN":
        return <Badge bg="secondary">Open</Badge>;
      default:
        return <Badge bg="success">Resolved</Badge>;
    }
  };

  const handleCreateWorkOrders = () => {
    console.log("handleCreateWorkOrders");
    if (!equipmentSelected) {
      console.log("Equipment not found.");
      return;
    }
    setEquipmentSelected(equipmentSelected);
    setShowModalWo(true);
    setShowModal(false);
  };

  const handleViewWorkOrder = (workOrderId: number) => {
    setShowModal(false); // 1. Cerramos el IssuesModal actual
    openModal("WORK_ORDER_DETAIL", workOrderId); // 2. Abrimos QuickView
  };

  return (
    <>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        keyboard={false}
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Issues Reported</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="py-3"
          style={{ maxHeight: "50vh", overflowY: "auto" }}
        >
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
          {issues.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-check-circle fs-1 text-success d-block mb-2"></i>
              <p className="mb-0">This equipment doesn't have issues.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {issues.map((issue) => (
                <Card key={issue.id} className="border shadow-sm">
                  <Card.Body className="py-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        {getSeverityBadge(issue.severity)}
                        {getStatusBadge(issue.issueStatus)}
                        <small className="text-muted fw-semibold">
                          #ISSUE-{issue.id}
                        </small>
                      </div>
                      <small className="text-muted">
                        {new Date(issue.reportedAt).toLocaleDateString()}
                      </small>
                    </div>

                    {/* Descripción principal */}
                    <p className="mb-3 text-dark fw-medium fs-6">
                      {issue.issueDescription}
                    </p>

                    <hr className="my-2 opacity-25" />

                    {/* Metadata en Grid / Footer de la Card */}
                    <Row className="g-2 text-muted small align-items-center">
                      <Col xs={12} sm={6}>
                        <i className="bi bi-person me-1"></i>
                        Reported by: <strong>{issue.reportedBy}</strong>
                      </Col>

                      <Col xs={12} sm={6} className="text-sm-end">
                        {issue.workOrderId ? (
                          <Button
                            variant="outline-secondary"
                            className="d-inline-flex align-items-center justify-content-center gap-1"
                            style={{
                              fontSize: "9px",
                              height: "25px",
                              width: "120px",
                              fontWeight: "bold",
                            }}
                            onClick={() => {
                              handleViewWorkOrder(issue.workOrderId!!);
                            }}
                          >
                            View Work Order
                            <FaEye />
                          </Button>
                        ) : (
                          <Button
                            variant="outline-primary"
                            className="d-inline-flex align-items-center justify-content-center gap-1"
                            style={{
                              fontSize: "9px",
                              height: "25px",
                              width: "120px",
                              fontWeight: "bold",
                            }}
                            onClick={handleCreateWorkOrders}
                          >
                            Create Work Order
                            <FaPlus />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
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
                onClick={() => setShowModal(false)}
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
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default IssuesModal;
