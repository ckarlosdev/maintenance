import { lazy, Suspense } from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { GlobalMessageBox } from "../components/GlobalMessageBox";
import { QuickView } from "../components/QuickView";

const ReportedIssuesModal = lazy(
  () => import("../components/Issue/ReportedIssuesModal"),
);
const IssuesModal = lazy(() => import("../components/Issue/IssuesModal"));
const ScheduleModal = lazy(
  () => import("../components/schedule/ScheduleModal"),
);
const ScheduleCreation = lazy(
  () => import("../components/schedule/ScheduleCreation"),
);
const KpiDetailsModal = lazy(() => import("../components/KpiDetailsModal"));
const WorkOrderCreation = lazy(() => import("../components/WorkOrderCreation"));

export default function MainLayout() {

  return (
    <>
      <Container>
        <Outlet />
      </Container>

      {/* Modales montados dinámicamente a nivel global */}
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
