import { lazy, Suspense } from "react";
import { Col, Container, Row } from "react-bootstrap";

// 1. Mantenemos las importaciones estáticas para lo que se ve INMEDIATAMENTE en pantalla
import Title from "../components/Title";
import SummaryBoxes from "../components/SummaryBoxes";
import { EquipmentTable } from "../components/EquipmentTable";
import { GlobalMessageBox } from "../components/GlobalMessageBox";
import { QuickView } from "../components/QuickView";
const ReportedIssuesModal = lazy(() => import("../components/Issue/ReportedIssuesModal"));

// 2. Transformamos los modales y componentes secundarios en Dynamic Imports
const IssuesModal = lazy(() => import("../components/Issue/IssuesModal"));
const ScheduleModal = lazy(
  () => import("../components/schedule/ScheduleModal"),
);
// const GlobalMessageBox = lazy(() => import("../components/GlobalMessageBox"));
const ScheduleCreation = lazy(
  () => import("../components/schedule/ScheduleCreation"),
);
const KpiDetailsModal = lazy(() => import("../components/KpiDetailsModal"));
const WorkOrderCreation = lazy(() => import("../components/WorkOrderCreation"));
// const QuickView = lazy(() => import("../components/QuickView"));

function Home() {
  return (
    <>
      <Container className="py-3">
        <Row>
          <Col xs={12}>
            <Title>Maintenance</Title>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <SummaryBoxes />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <EquipmentTable />
          </Col>
        </Row>
      </Container>
      <Suspense fallback={null}>
        <IssuesModal />
        <ScheduleModal />
        <GlobalMessageBox />
        <ScheduleCreation />
        <KpiDetailsModal />
        <WorkOrderCreation />
        <QuickView />
        <ReportedIssuesModal />
      </Suspense>
    </>
  );
}

export default Home;
