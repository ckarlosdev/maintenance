import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SummaryBoxes from "../components/SummaryBoxes";
import { EquipmentTable } from "../components/EquipmentTable";
import NavSection from "../components/NavSection";
import Title from "../components/Title";

export default function Maintenance() {
  return (
    <>
      <Row className="mb-1 mt-2">
        <Col xs={12}>
          <Title>Maintenance</Title>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <SummaryBoxes />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <NavSection />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <EquipmentTable />
        </Col>
      </Row>
    </>
  );
}
