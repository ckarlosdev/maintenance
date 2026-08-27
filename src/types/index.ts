export interface EquipmentData {
  equipmentsId: number;
  number: string;
  name: string;
  type: string;
  dueDate: string;
  hour: number;
  maintenancePending: string;
  status: "pending" | "due" | "ok";
}

export type Employee = {
  employeesId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  title: string;
};

export type Equipment = {
  equipmentsId: number;
  family: string;
  number: string;
  name: string;
  manufacturing: string;
  model: string;
  year: string;
  serialNumber: string;
  hour: string;
};

export type Issue = {
  id: number;
  equipmentId: number;
  reportedBy: string;
  reportedAt: string;
  issueDescription: string;
  severity: string;
  issueStatus: string;
  workOrderId: number | null;
  parentIssueId: number | null;
};

export type EquipmentIssueSummary = {
  id: number;
  equipmentId: number;
  reportedBy: string;
  reportedAt: string;
  issueDescription: string;
  severity: "LOW" | "MEDIUM" | "CRITICAL";
  issueStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  workOrderId: number | null;
  orderType: string | null;
  orderStatus: string | null;
  isCompleted: boolean;
  scheduleStatus: string;
};

export type Schedule = {
  equipmentPreventiveScheduleId: number;
  preventivePlanId: number | null;
  equipmentId: number;
  lastPerformedDate: string;
  lastPerformedMeter: number;
  dueDate: string;
  dueMeter: number;
  isOverdue: boolean;

  workOrderId: number;
  orderStatus: string | null;
  isCompleted: boolean;
  scheduleStatus: string;
};

export type CreateScheduleDTO = Omit<
  Schedule,
  "equipmentPreventiveScheduleId" | "isOverdue" | "workOrderId" | "isCompleted"
> & {
  userName: string;
};

export interface MaintenanceForm {
  preventivePlanId: number | null;
  equipmentId: number;
  lastPerformedDate: string;
  lastPerformedMeter: number | "";
  dueDate: string;
  dueMeter: number | "";
  userName: string;
}

export type WorkOrder = {
  id: number;
  equipmentId: number;
  orderType: string;
  orderStatus: string;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  tasks: Task[];
};

export type Task = {
  id: number;
  taskDescription: string;
  schedule: PreventiveScheduleResponseDto | null;
  issue: EquipmentIssueResponseDto | null;
  createdBy: string;
  isCompleted: boolean;
};

export type PreventiveScheduleResponseDto = {
  id: number;
  preventivePlanId: number;
  equipmentId: number;
  lastPerformedDate: string;
  lastPerformedMeter: number;
  dueDate: string;
  dueMeter: number;
  isOverdue: boolean;
};

export type EquipmentIssueResponseDto = {
  id: number;
  equipmentId: number;
  reportedBy: string;
  reportedAt: string;
  issueDescription: string;
  severity: string;
  issueStatus: string;
  workOrderId: number;
  parentIssueId: number;
};

export type Metric = {
  dueSoonMaintenances: number;
  criticalOpenIssues: number;
  pendingWorkOrders: number;
  inProgressIssues: number;
};

export interface KpiDetailResponseDto {
  id: number;
  equipmentId: number;
  title: string;
  subtitle: string;
  status: string;
  severity: string | null;
  date: string | null; // LocalDateTime llega como string ISO en JSON
}

export type KpiType =
  | "PENDING_WOS"
  | "DUE_SOON"
  | "IN_PROGRESS"
  | "CRITICAL_ISSUES";

export type OrderType = "CORRECTIVE" | "PREVENTIVE";

export type CreateWorkOrderPayload = {
  equipmentId: number | null;
  orderType: string;
  createdBy: string;
  tasks: CreateTaskPayload[];
};

export type CreateTaskPayload = {
  taskDescription: string;
  preventivePlanId: number | null;
  equipmentIssueId: number | null;
  createdBy: string;
};

export interface UpdateWorkOrderTaskDto {
  taskDescription?: string;
  isCompleted?: boolean;
  preventivePlanId?: number | null;
  equipmentIssueId?: number | null;
  updatedBy?: string;
}

export type UpdateStatus = {
  orderStatus: string;
  totalCost: number;
  userName: string;
  nextSchedule?: NextScheduleInput[] | null;
};

export interface NextScheduleInput {
  preventivePlanId: number;
  nextDueDate?: string;
  nextDueMeter?: number;
}

export interface UpdateWorkOrderStatusDto {
  orderStatus: string;
  userName?: string;
  totalCost?: number;
  mechanicId: number;
  pin: string;
  nextSchedules?: NextScheduleInput[] | null;
}

export interface ValidatePinDto {
  mechanicId: number;
  pin: string;
}

export interface Mechanic {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  active: boolean;
}

export type User = {
  id: number;
  fullName: string;
  email: string;
  roles: Role[];
};

export type Role = {
  id: number;
  name: string;
};
