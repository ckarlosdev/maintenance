import { Button, Card, Col, Row } from "react-bootstrap";
import { useEquipmentsDetails } from "../../hooks/useEquipments";
import { useMemo } from "react";
import useViewStore from "../../stores/useViewStore";
import ItemView from "./ItemView";

type Props = {};

function Index({}: Props) {
  const {
    data: equipmentsDetails = [],
    isLoading,
    isError,
  } = useEquipmentsDetails();

  const {
    selectedFamily,
    setSelectedFamily,
    selectedSubtype,
    setSelectedSubtype,
  } = useViewStore();

  const filteredEquipments = useMemo(() => {
    return equipmentsDetails
      .filter((item) => item.number !== "E00")
      .sort((a, b) =>
        a.number.localeCompare(b.number, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );
  }, [equipmentsDetails]);

  // 1. Obtener familias únicas
  const families = Array.from(
    new Set(filteredEquipments?.map((item) => item.family) || []),
  );

  // 2. Obtener subtipos únicos de la familia seleccionada
  const subtypesInFamily = selectedFamily
    ? Array.from(
        new Set(
          filteredEquipments
            ?.filter((item) => item.family === selectedFamily)
            .map((item) => item.subtype) || [],
        ),
      )
    : [];

  // 3. Obtener ítems del subtipo seleccionado
  const itemsInSelectedSubtype =
    selectedFamily && selectedSubtype
      ? filteredEquipments?.filter(
          (item) =>
            item.family === selectedFamily && item.subtype === selectedSubtype,
        ) || []
      : [];

  // Función para manejar el botón "Back"
  const handleBack = () => {
    if (selectedSubtype) {
      setSelectedSubtype(null);
    } else if (selectedFamily) {
      setSelectedFamily(null);
    }
  };

  if (isLoading) return <div>Loading data...</div>;
  if (isError) return <div>Error loading data.</div>;

  return (
    <div className="mt-2">
      {/* ================= VISTA 1: FAMILIAS ================= */}
      {!selectedFamily && (
        <>
          <div className="mb-4">
            <h4 className="fw-semibold text-dark">Fleet types</h4>
            <p className="text-muted small">Select a fleet type</p>
          </div>

          <Row className="g-4">
            {families.map((family) => {
              const count =
                equipmentsDetails?.filter((i) => i.family === family).length ||
                0;

              return (
                <Col xs={12} md={4} key={family}>
                  <Card
                    className="border-0 shadow-sm rounded-4 h-100 transition-card"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#f8f9fa",
                    }}
                    onClick={() => setSelectedFamily(family)}
                  >
                    <Card.Body className="d-flex flex-column justify-content-between p-4">
                      <div>
                        <h3 className="fw-bold text-capitalize text-dark mb-1">
                          {family}
                        </h3>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <span className="text-muted small">{count} items</span>
                        <span className="text-primary fw-semibold small">
                          view subtypes &rarr;
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      {/* ================= VISTA 2: SUBTIPOS (CLICKEABLES) ================= */}
      {selectedFamily && !selectedSubtype && (
        <>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <Button
                variant="link"
                className="p-0 text-decoration-none mb-1 text-primary fw-semibold small"
                onClick={handleBack}
              >
                &larr; Back to fleet types
              </Button>
              <h3 className="fw-bold text-capitalize text-dark m-0">
                {selectedFamily}
              </h3>
            </div>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill text-capitalize">
              {selectedFamily}
            </span>
          </div>

          <Row className="g-4">
            {subtypesInFamily.map((subtype) => {
              const itemsInSubtypeCount =
                equipmentsDetails?.filter(
                  (item) =>
                    item.family === selectedFamily && item.subtype === subtype,
                ).length || 0;

              return (
                <Col xs={12} md={6} lg={4} key={subtype}>
                  <Card
                    className="border-0 shadow-sm rounded-4 h-100 bg-white transition-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedSubtype(subtype)}
                  >
                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                      <div>
                        <span className="badge bg-light text-secondary mb-2 text-uppercase px-2 py-1 rounded">
                          Subtype
                        </span>
                        <h5 className="fw-bold text-dark text-capitalize mb-1">
                          {subtype}
                        </h5>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <span className="text-muted small">
                          {itemsInSubtypeCount} items
                        </span>
                        <span className="text-primary fw-semibold small">
                          view equipments &rarr;
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      {/* ================= VISTA 3: EQUIPOS DEL SUBTIPO SELECCIONADO ================= */}
      {selectedFamily && selectedSubtype && (
        <ItemView itemsInSelectedSubtype={itemsInSelectedSubtype} />
      )}
    </div>
  );
}

export default Index;
