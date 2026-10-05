import { Card, Col, Row } from "react-bootstrap";
import {
  FaRegClock,
  FaExclamationTriangle,
  FaTools,
  FaTimesCircle,
} from "react-icons/fa";
import { useMetrics } from "../hooks/useMetrics";
import type { KpiType } from "../types";
import type { IconType } from "react-icons/lib";
import { useModalStore } from "../stores/useModalStore";
import { useIssueReports } from "../hooks/useIssues";

type Props = {};

interface MetricConfig {
  id: string;
  label: string;
  kpiType: KpiType;
  apiKey?:
    | "pendingWorkOrders"
    | "dueSoonMaintenances"
    | "inProgressIssues";
  icon: IconType;
  theme: string;
  bgColor: string;
  textColor: string;
}

const METRICS_CONFIG: MetricConfig[] = [
  {
    id: "pending",
    label: "Pending WOs",
    kpiType: "PENDING_WOS",
    apiKey: "pendingWorkOrders",
    icon: FaRegClock,
    theme: "warning",
    bgColor: "bg-warning-subtle",
    textColor: "text-warning",
  },
  {
    id: "due_soon",
    label: "Due Soon",
    kpiType: "DUE_SOON",
    apiKey: "dueSoonMaintenances",
    icon: FaExclamationTriangle,
    theme: "danger",
    bgColor: "bg-danger-subtle",
    textColor: "text-danger",
  },
  {
    id: "in_progress",
    label: "In Progress",
    kpiType: "IN_PROGRESS",
    apiKey: "inProgressIssues",
    icon: FaTools,
    theme: "info",
    bgColor: "bg-info-subtle",
    textColor: "text-info",
  },
  {
    id: "reports",
    label: "Reported Issues",
    kpiType: "REPORTED_ISSUES",
    icon: FaTimesCircle,
    theme: "danger",
    bgColor: "bg-danger",
    textColor: "text-white",
  },
];

function SummaryBoxes({}: Props) {
  const { data: metricsData, isLoading: metricsLoading } = useMetrics();
  const { data: reports, isLoading: reportsLoading } = useIssueReports();
  const { openModal } = useModalStore();

  const handleCardClick = (kpiType: KpiType, label: string) => {
    if (kpiType === "REPORTED_ISSUES") {
    openModal("REPORTED_ISSUES_LIST");
  } else {
    openModal("KPI_DETAILS", { category: kpiType, title: label });
  }
  };

  const getMetricDetails = (metric: MetricConfig) => {
    if (metric.kpiType === "REPORTED_ISSUES") {
      return {
        value: Array.isArray(reports) ? reports.length : 0,
        isLoading: reportsLoading,
      };
    }

    return {
      value: metricsData && metric.apiKey ? metricsData[metric.apiKey] ?? 0 : 0,
      isLoading: metricsLoading,
    };
  };

  return (
    <Row className="g-2 g-md-3 justify-content-center">
      {METRICS_CONFIG.map((metric) => {
        const IconComponent = metric.icon;
        const { value, isLoading } = getMetricDetails(metric);

        return (
          <Col xs={6} sm={6} md={3} key={metric.id}>
            <Card
              className={`h-100 border-0 metric-card metric-glow-${metric.theme} cursor-pointer`}
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(metric.kpiType, metric.label)}
            >
              <Card.Body className="p-2 p-sm-3 d-flex align-items-center justify-content-between">
                <div className="w-100 pe-1">
                  <span className="text-muted fw-semibold text-uppercase d-block text-truncate metric-label">
                    {metric.label}
                  </span>
                  <h3 className="fw-bold text-dark m-0 metric-value mt-1">
                    {isLoading ? "..." : value}
                  </h3>
                </div>
                <div
                  className={`d-none d-sm-flex p-2 rounded-circle align-items-center justify-content-center flex-shrink-0 ${metric.bgColor} ${metric.textColor}`}
                  style={{ width: "44px", height: "44px" }}
                >
                  <IconComponent size={22} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default SummaryBoxes;
