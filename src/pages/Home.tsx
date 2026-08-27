import { Col, Container, Row } from "react-bootstrap";
import Title from "../components/Title";
import SummaryBoxes from "../components/SummaryBoxes";
import { EquipmentTable } from "../components/EquipmentTable";
import IssuesModal from "../components/Issue/IssuesModal";
import ScheduleModal from "../components/schedule/ScheduleModal";
import { GlobalMessageBox } from "../components/GlobalMessageBox";
import ScheduleCreation from "../components/schedule/ScheduleCreation";
import KpiDetailsModal from "../components/KpiDetailsModal";
import WorkOrderCreation from "../components/WorkOrderCreation";
import { QuickView } from "../components/QuickView";

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
      <IssuesModal />
      <ScheduleModal />
      <GlobalMessageBox />
      <ScheduleCreation />
      <KpiDetailsModal />
      <WorkOrderCreation />
      <QuickView />
    </>
  );
}

export default Home;
