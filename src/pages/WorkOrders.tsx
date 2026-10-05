import { lazy, Suspense } from "react";
import { Col, Container, Row } from "react-bootstrap";
import PageTitle from "../components/PageTitle";
import WorkOrderTable from "../components/WorkOrderTable";
import EquipmentData from "../components/EquipmentData";
import WorkOrdersButtons from "../components/WorkOrdersButtons";

const WorkOrderCreation = lazy(() => import("../components/WorkOrderCreation"));

type Props = {};

function WorkOrders({}: Props) {
  return (
    <>
      <Container>
        <Row className="mb-1 mt-2">
          <Col xs={12}>
            <PageTitle>Work Orders</PageTitle>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col xs={12}>
            <EquipmentData />
          </Col>
        </Row>
        <Row className="my-3">
          <Col xs={12} className="d-flex justify-content-center">
            <WorkOrdersButtons />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <WorkOrderTable />
          </Col>
        </Row>
      </Container>

      <Suspense fallback={null}>
        <WorkOrderCreation />
      </Suspense>
    </>
  );
}

export default WorkOrders;
