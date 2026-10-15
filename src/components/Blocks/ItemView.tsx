import { Button, Card, Col, Row } from "react-bootstrap";
import type { Equipment, EquipmentDetail, Schedule } from "../../types";
import useViewStore from "../../stores/useViewStore";
import { useNavigate } from "react-router-dom";
import { useGetChedulesByEquipmentIds } from "../../hooks/useSchedules";
import {
  useGetIssuesByEquipmentIds,
  type ActiveIssuesMap,
} from "../../hooks/useIssues";
import { useMemo } from "react";
import { ScheduleBadge } from "./ScheduleBadge";
import useScheduleStore from "../../stores/useScheduleStore";
import { useModalStore } from "../../stores/useModalStore";
import useWorkOrderStore from "../../stores/useWorkOrderStore";
import { useEquipments } from "../../hooks/useEquipments";
import { ReportBadge } from "./ReportBadge";

type Props = {
  itemsInSelectedSubtype: EquipmentDetail[];
};

function ItemView({ itemsInSelectedSubtype }: Props) {
  const navigate = useNavigate();
  const { setSchedule } = useScheduleStore();
  const { openModal } = useModalStore();
  const { setEquipmentSelected } = useWorkOrderStore();
  const { data: equipments } = useEquipments();

  const equipmentIdsShown = useMemo(() => {
    return itemsInSelectedSubtype.map((equipment) => equipment.equipmentsId);
  }, [itemsInSelectedSubtype]);

  const { data: schedules = [] } =
    useGetChedulesByEquipmentIds(equipmentIdsShown);

  const { data: issuesMap = {} as ActiveIssuesMap } =
    useGetIssuesByEquipmentIds(equipmentIdsShown);

  const maintenanceMap = useMemo(() => {
    const map = new Map();
    schedules.forEach((item) => map.set(item.equipmentId, item));
    return map;
  }, [schedules]);

  const {
    selectedFamily,
    setSelectedFamily,
    selectedSubtype,
    setSelectedSubtype,
  } = useViewStore();

  const handleWorkOrders = (equipmentId: number) => {
    if (!equipmentId) return;
    navigate(`/work-orders/${equipmentId}`);
  };

  const handleBack = () => {
    if (selectedSubtype) {
      setSelectedSubtype(null);
    } else if (selectedFamily) {
      setSelectedFamily(null);
    }
  };

  const handleScheduleModal = (item: Equipment, maintenance: Schedule) => {
    setSchedule(maintenance);
    setEquipmentSelected(item);
    openModal("SCHEDULE");
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <Button
            variant="link"
            className="p-0 text-decoration-none mb-1 text-primary fw-semibold small"
            onClick={handleBack}
          >
            &larr; Back to {selectedFamily}
          </Button>
          <h3 className="fw-bold text-capitalize text-dark m-0">
            {selectedSubtype}
          </h3>
        </div>
        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
          {itemsInSelectedSubtype.length} items
        </span>
      </div>

      <Row className="g-3">
        {itemsInSelectedSubtype.map((eq) => {
          const equipmentIssues = issuesMap[eq.equipmentsId] || [];

          return (
            <Col xs={12} md={6} lg={4} key={eq.equipmentsId}>
              <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="fw-bold text-dark mb-0"># {eq.number}</h4>
                    <span className="badge bg-light text-secondary border">
                      {eq.hour} hrs
                    </span>
                  </div>
                  <div className="text-muted small">
                    <div>
                      Name:{" "}
                      <span className="text-dark fw-medium">{eq.name}</span>
                    </div>
                    {eq.licensePlate &&
                      eq.licensePlate.trim().toUpperCase() !== "N/A" && (
                        <div>
                          License Plate:{" "}
                          <span className="text-dark fw-medium">
                            {eq.licensePlate}
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    {/* Contenedor izquierdo para los badges */}
                    <div className="d-flex gap-2">
                      <ScheduleBadge
                        maintenance={maintenanceMap.get(eq.equipmentsId)}
                        currentOdometer={Number(eq.hour)}
                        equipment={eq}
                        onClick={() => {
                          const selected = equipments?.find(
                            (i) => i.equipmentsId === eq.equipmentsId,
                          );
                          if (!selected) return;
                          handleScheduleModal(
                            selected,
                            maintenanceMap.get(eq.equipmentsId),
                          );
                        }}
                      />
                      <ReportBadge issues={equipmentIssues} equipment={eq} />
                    </div>

                    {/* Enlace a la derecha */}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                      onClick={() => handleWorkOrders(eq.equipmentsId)}
                    >
                      View Work Orders &rarr;
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}

export default ItemView;
