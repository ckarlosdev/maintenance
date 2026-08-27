import {
  Table,
  Button,
  Row,
  Col,
  Form,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import "../styles/EquipmentTable.css";
import { useNavigate } from "react-router-dom";
import useEquipments from "../hooks/useEquipments";
import useWorkOrderStore from "../stores/useWorkOrderStore";
import { useEffect, useMemo, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { getPageNumbers } from "../utilities/helper";
import { useGetChedulesByEquipmentIds } from "../hooks/useSchedules";
import {
  useGetIssuesByEquipmentIds,
  type ActiveIssuesMap,
} from "../hooks/useIssues";
import { IssuesStatusBadge } from "./Issue/IssuesStatusBadge";
import useScheduleStore from "../stores/useScheduleStore";
import { MaintenanceStatusBadge } from "./schedule/MaintenanceStatusBadge";
import { FaWrench } from "react-icons/fa";
import type { Equipment, Schedule } from "../types";
import { useModalStore } from "../stores/useModalStore";

export function EquipmentTable() {
  const navigate = useNavigate();
  const { setEquipmentSelected } = useWorkOrderStore();
  const { data: equipments = [] } = useEquipments();
  const { setSchedule } = useScheduleStore();
  const { openModal } = useModalStore();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const sortedList = useMemo(() => {
    return equipments
      .filter((item) => item.number !== "E00")
      .sort((a, b) =>
        a.number.localeCompare(b.number, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );
  }, [equipments]);

  const filteredEquipments = useMemo(() => {
    const value = search.toLowerCase().trim();

    return sortedList.filter((equipment) => {
      const nameMatch = equipment.name?.toLowerCase().includes(value) ?? false;
      const numberMatch =
        equipment.number?.toLowerCase().includes(value) ?? false;

      return nameMatch || numberMatch;
    });
  }, [sortedList, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEquipments.length / ITEMS_PER_PAGE),
  );

  const pages = getPageNumbers(currentPage, totalPages);

  const paginatedEquipments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEquipments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEquipments, currentPage]);

  const equipmentIdsShown = useMemo(() => {
    return paginatedEquipments.map((equipment) => equipment.equipmentsId);
  }, [paginatedEquipments]);

  const { data: schedules = [] } =
    useGetChedulesByEquipmentIds(equipmentIdsShown);

  const { data: issuesMap = {} as ActiveIssuesMap } =
    useGetIssuesByEquipmentIds(equipmentIdsShown);

  const maintenanceMap = useMemo(() => {
    const map = new Map();
    schedules.forEach((item) => map.set(item.equipmentId, item));
    return map;
  }, [schedules]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const start =
    filteredEquipments.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const end =
    filteredEquipments.length === 0
      ? 0
      : Math.min(currentPage * ITEMS_PER_PAGE, filteredEquipments.length);

  const handleWorkOrders = (equipmentId: number) => {
    if (!equipmentId) return;
    const equipmentSelected = equipments?.find(
      (equip) => equip.equipmentsId === equipmentId,
    );
    if (!equipmentSelected) {
      console.log("Equipment noot found.");
      return;
    }

    setEquipmentSelected(equipmentSelected);
    navigate(`/work-orders/${equipmentId}`);
  };

  const handleScheduleModal = (item: Equipment, maintenance: Schedule) => {
    setSchedule(maintenance);
    setEquipmentSelected(item);
    openModal("SCHEDULE");
  };

  // const handleHistorical = (equipmentId: number) => {
  //   if (!equipmentId) return;
  //   navigate(`/history/${equipmentId}`);
  // };=

  return (
    <>
      <div className="equipment-container mt-2">
        {/* 💻 VISTA DESKTOP (Tabla tradicional limpia) */}
        <Row className="mb-2">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <IoMdSearch />
              </InputGroup.Text>

              <Form.Control
                className="border-start-0"
                placeholder="Search by name or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
        <div className="d-none d-md-block table-responsive shadow-sm rounded-3 bg-white border">
          <Table hover className="align-middle mb-0 custom-equipment-table">
            <thead className="table-light">
              <tr style={{ textAlign: "center" }}>
                <th>Equipment</th>
                <th>Odometer</th>
                <th>Maintenance</th>
                <th>Reports</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEquipments?.map((item) => {
                const equipmentIssues = issuesMap[item.equipmentsId] || [];

                return (
                  <tr key={item.equipmentsId} style={{ textAlign: "center" }}>
                    {/* Number & Name juntos para ahorrar espacio */}
                    <td>
                      <div className="fw-bold text-dark">#{item.number}</div>
                      <div className="text-muted fs-7">{item.name}</div>
                    </td>
                    <td className="fw-semibold text-secondary">{item.hour}</td>
                    <td>
                      <MaintenanceStatusBadge
                        maintenance={maintenanceMap.get(item.equipmentsId)}
                        currentOdometer={Number(item.hour)}
                        equipment={item}
                        onClick={() => {
                          handleScheduleModal(
                            item,
                            maintenanceMap.get(item.equipmentsId),
                          );
                        }}
                      />
                      {/* <div className="fw-bold text-dark">MM/DD/YYYY</div>
                  {renderStatusBadge("pending")} */}
                    </td>
                    <td className="text-wrap" style={{ maxWidth: "200px" }}>
                      <IssuesStatusBadge
                        issues={equipmentIssues}
                        equipment={item}
                      />
                    </td>
                    {/* Botones de acción */}
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1 action-btn-table"
                          onClick={() => handleWorkOrders(item.equipmentsId)}
                          title="See Work Orders"
                        >
                          <FaWrench size={14} />
                          <span>Work Orders</span>
                        </Button>
                        {/* <Button
                          variant="outline-secondary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1 action-btn-table"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHistorical(item.equipmentsId);
                          }}
                          title="View History"
                        >
                          <LuHistory size={14} />
                          <span>History</span>
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            Showing{" "}
            <strong>
              {start}-{end}
            </strong>{" "}
            of <strong>{filteredEquipments.length}</strong> equipments
          </div>

          <Pagination className="mb-0">
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            />

            {pages.map((page, index) =>
              page === "..." ? (
                <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
              ) : (
                <Pagination.Item
                  key={`page-${page}`}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              ),
            )}

            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            />
          </Pagination>
        </div>
      </div>
    </>
  );
}
