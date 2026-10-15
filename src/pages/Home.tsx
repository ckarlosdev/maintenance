import { Col, Row } from "react-bootstrap";
import SummaryBoxes from "../components/SummaryBoxes";
import Blocks from "../components/Blocks";
import Title from "../components/Title";
import NavSection from "../components/NavSection";

export default function Home() {
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
      <Blocks />
    </>
  );
}
