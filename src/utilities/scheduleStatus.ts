import type {
  Schedule,
  SchedulesByEquipment,
  ServiceInterval,
} from "../types";

// ---------------------------------------------------------------------------
// Estados de un reminder (schedule preventivo)
// ---------------------------------------------------------------------------

export type ScheduleStatus =
  | "working"
  | "completed"
  | "overdue"
  | "dueSoon"
  | "upToDate"
  | "noData";

type DueStatus = "overdue" | "dueSoon" | "upToDate" | "noData";

export const DUE_SOON_DAYS = 15;
export const DUE_SOON_METER = 50;

export function getDueDateStatus(
  dueDate?: string | null,
  isOverdueFlag?: boolean,
): DueStatus {
  if (!dueDate) return "noData";
  if (isOverdueFlag) return "overdue";

  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();
  const daysDiff = (due - now) / (1000 * 3600 * 24);

  if (daysDiff <= 0) return "overdue";
  if (daysDiff <= DUE_SOON_DAYS) return "dueSoon";
  return "upToDate";
}

export function getDueMeterStatus(
  dueMeter?: number | null,
  currentMeter?: number,
  isOverdueFlag?: boolean,
): DueStatus {
  if (dueMeter == null || currentMeter == null) return "noData";
  if (isOverdueFlag) return "overdue";

  const diff = dueMeter - currentMeter;

  if (diff <= 0) return "overdue";
  if (diff <= DUE_SOON_METER) return "dueSoon";
  return "upToDate";
}

export function hasDueData(schedule?: Schedule | null): schedule is Schedule {
  return Boolean(schedule && (schedule.dueDate || schedule.dueMeter != null));
}

/**
 * Estado de un reminder. Jerarquía:
 * WO activa > completado > overdue > dueSoon > upToDate > noData
 */
export function getScheduleStatus(
  schedule: Schedule | null | undefined,
  currentOdometer?: number,
): ScheduleStatus {
  if (!hasDueData(schedule)) return "noData";
  if (schedule.workOrderId) return "working";
  if (schedule.isCompleted) return "completed";

  const dateStatus = getDueDateStatus(schedule.dueDate, schedule.isOverdue);
  const meterStatus = getDueMeterStatus(
    schedule.dueMeter,
    currentOdometer,
    schedule.isOverdue,
  );

  if (dateStatus === "overdue" || meterStatus === "overdue") return "overdue";
  if (dateStatus === "dueSoon" || meterStatus === "dueSoon") return "dueSoon";
  if (dateStatus === "upToDate" || meterStatus === "upToDate")
    return "upToDate";
  return "noData";
}

// Prioridad para el resumen de varios reminders (mayor = más urgente)
const STATUS_PRIORITY: Record<ScheduleStatus, number> = {
  overdue: 5,
  dueSoon: 4,
  working: 3,
  upToDate: 2,
  completed: 1,
  noData: 0,
};

export function getWorstStatus(
  schedules: Schedule[],
  currentOdometer?: number,
): ScheduleStatus {
  return schedules.reduce<ScheduleStatus>((worst, schedule) => {
    const status = getScheduleStatus(schedule, currentOdometer);
    return STATUS_PRIORITY[status] > STATUS_PRIORITY[worst] ? status : worst;
  }, "noData");
}

export const STATUS_UI: Record<
  ScheduleStatus,
  { label: string; bg: string; text?: "dark" | "white" }
> = {
  overdue: { label: "Overdue", bg: "danger" },
  dueSoon: { label: "Due Soon", bg: "warning", text: "dark" },
  working: { label: "Working on", bg: "info", text: "dark" },
  upToDate: { label: "Up to Date", bg: "success" },
  completed: { label: "Up to Date", bg: "success" },
  noData: { label: "No Data", bg: "secondary" },
};

export function formatDueDetail(schedule?: Schedule | null): string {
  if (!schedule) return "";
  const { dueDate, dueMeter } = schedule;
  if (dueDate && dueMeter != null) return `${dueDate} / ${dueMeter} hrs`;
  if (dueDate) return dueDate;
  if (dueMeter != null) return `${dueMeter} hrs`;
  return "";
}

export function groupSchedulesByEquipment(
  schedules: Schedule[],
): SchedulesByEquipment {
  return schedules.reduce<SchedulesByEquipment>((acc, schedule) => {
    (acc[schedule.equipmentId] ??= []).push(schedule);
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Fechas e intervalos
// ---------------------------------------------------------------------------

/** YYYY-MM-DD en hora local (evita el corrimiento de toISOString). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parsea YYYY-MM-DD como fecha local. */
export function parseISODate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function addMonths(date: Date, months: number): string {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return toISODate(result);
}

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return toISODate(result);
}

// Valores por defecto cuando no hay intervalo configurado
export const DEFAULT_INTERVAL_MONTHS = 6;
export const DEFAULT_INTERVAL_METER = 500;

type UnitKind =
  | { kind: "time"; days?: number; months?: number }
  | { kind: "meter" };

function classifyUnit(unit: string): UnitKind | null {
  const u = unit.toLowerCase().trim().replace(/\.$/, "");

  if (["d", "day", "days"].includes(u)) return { kind: "time", days: 1 };
  if (["w", "wk", "week", "weeks"].includes(u))
    return { kind: "time", days: 7 };
  if (["mo", "mon", "month", "months"].includes(u))
    return { kind: "time", months: 1 };
  if (["y", "yr", "yrs", "year", "years"].includes(u))
    return { kind: "time", months: 12 };

  if (
    [
      "h", "hr", "hrs", "hour", "hours",
      "mi", "mile", "miles",
      "km", "kms", "kilometer", "kilometers",
      "meter", "meters",
    ].includes(u)
  )
    return { kind: "meter" };

  return null;
}

export function isTimeInterval(interval: ServiceInterval): boolean {
  return classifyUnit(interval.unit)?.kind === "time";
}

export function isMeterInterval(interval: ServiceInterval): boolean {
  return classifyUnit(interval.unit)?.kind === "meter";
}

/**
 * Calcula el siguiente vencimiento a partir de un intervalo de servicio.
 * - Unidad de tiempo  -> dueDate
 * - Unidad de medidor -> dueMeter
 * - Unidad desconocida -> {}
 */
export function computeDueFromInterval(
  interval: ServiceInterval,
  lastDate: string | null | undefined,
  lastMeter: number | null | undefined,
): { dueDate?: string; dueMeter?: number } {
  const unit = classifyUnit(interval.unit);
  if (!unit) return {};

  if (unit.kind === "time") {
    if (!lastDate) return {};
    const base = parseISODate(lastDate);
    if (unit.months) return { dueDate: addMonths(base, unit.months * interval.value) };
    return { dueDate: addDays(base, (unit.days ?? 1) * interval.value) };
  }

  if (lastMeter == null || isNaN(lastMeter)) return {};
  return { dueMeter: lastMeter + interval.value };
}

/** Texto legible del intervalo, p.ej. "250 hours". */
export function formatInterval(interval: ServiceInterval): string {
  return `${interval.value} ${interval.unit}`;
}
