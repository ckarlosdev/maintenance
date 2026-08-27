import { Button } from "react-bootstrap";
import useWorkOrderStore from "../stores/useWorkOrderStore";

type Props = {};

function WorkOrdersButtons({}: Props) {
  const { setShowModal, showClosed, setShowClosed } = useWorkOrderStore();

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 w-100">
      {/* Filtros de estado */}
      <div className="btn-group shadow-sm" role="group">
        <Button
          variant={!showClosed ? "primary" : "outline-primary"}
          size="sm"
          className="px-3 py-2 fw-medium"
          onClick={() => setShowClosed(false)}
        >
          Active Orders
        </Button>
        <Button
          variant={showClosed ? "primary" : "outline-primary"}
          size="sm"
          className="px-3 py-2 fw-medium"
          onClick={() => setShowClosed(true)}
        >
          All (Include Closed)
        </Button>
      </div>

      {/* Botón de creación */}
      <Button
        variant="outline-primary"
        className="rounded-pill px-4 py-2 shadow-sm border-1 fw-medium d-inline-flex align-items-center gap-2 custom-btn-hover"
        onClick={() => setShowModal(true)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Work Order
      </Button>
    </div>
  );
}

export default WorkOrdersButtons;
