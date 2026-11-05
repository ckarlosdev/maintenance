import { Button, Form, Modal } from "react-bootstrap";
import { useModalStore } from "../../stores/useModalStore";
import { useMemo, useState } from "react";
import type { CreateScheduleDTO, Equipment, Mechanic } from "../../types";
import { BsWrenchAdjustable } from "react-icons/bs";
import {
  useCreateSchedule,
  useGetChedulesByEquipmentIds,
} from "../../hooks/useSchedules";
import {
  useEquipmentVehicleTypeId,
  useIntervalsByVehicleType,
  useServices,
} from "../../hooks/useServices";
import { UserPinValidationModal } from "../TaskValidationModal";
import { VEHICLE_TYPES } from "../../utilities/vehicleTypes";
import {
  addMonths,
  computeDueFromInterval,
  DEFAULT_INTERVAL_METER,
  DEFAULT_INTERVAL_MONTHS,
  formatInterval,
  isMeterInterval,
  isTimeInterval,
  parseISODate,
  toISODate,
} from "../../utilities/scheduleStatus";

type FormErrors = Partial<
  Record<
    | "preventivePlanId"
    | "lastPerformedDate"
    | "lastPerformedMeter"
    | "dueDate"
    | "dueMeter",
    string
  >
>;

type MeterValue = number | "";

const toMeter = (value: string): MeterValue =>
  value === "" ? "" : Number(value);

// Wrapper: el formulario se monta en cada apertura (key por equipo),
// así el estado arranca limpio sin useEffect de reseteo.
function ScheduleCreation() {
  const { activeModal, equipmentSelected } = useModalStore();
  if (activeModal !== "SCHEDULE_CREATION" || !equipmentSelected) return null;
  return (
    <ScheduleCreationForm
      key={equipmentSelected.equipmentsId}
      equipment={equipmentSelected}
    />
  );
}

function ScheduleCreationForm({ equipment }: { equipment: Equipment }) {
  const { openModal } = useModalStore();
  const { mutate: handleCreateSchedule, isPending } = useCreateSchedule();
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: existingSchedules = [] } = useGetChedulesByEquipmentIds([
    equipment.equipmentsId,
  ]);

  const detectedVehicleTypeId = useEquipmentVehicleTypeId(
    equipment.equipmentsId,
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPinModal, setShowPinModal] = useState(false);

  // --- Estado del formulario ---
  const [serviceId, setServiceId] = useState<number | null>(null);
  // undefined = usar el vehicle type detectado; null = "sin tipo"
  const [vehicleTypeOverride, setVehicleTypeOverride] = useState<
    number | null | undefined
  >(undefined);
  const [lastPerformedDate, setLastPerformedDate] = useState(
    toISODate(new Date()),
  );
  const [lastPerformedMeter, setLastPerformedMeter] = useState<MeterValue>(
    Number(equipment.hour) || 0,
  );
  // undefined = usar el valor sugerido; cualquier otro valor = editado a mano
  const [dueDateOverride, setDueDateOverride] = useState<string | undefined>();
  const [dueMeterOverride, setDueMeterOverride] = useState<
    MeterValue | undefined
  >();

  const vehicleTypeId =
    vehicleTypeOverride !== undefined
      ? vehicleTypeOverride
      : detectedVehicleTypeId;

  const { data: intervals = [], isFetching: loadingIntervals } =
    useIntervalsByVehicleType(vehicleTypeId);

  const usedServiceIds = useMemo(
    () => new Set(existingSchedules.map((s) => s.preventivePlanId)),
    [existingSchedules],
  );

  const activeInterval = useMemo(() => {
    if (serviceId == null) return null;
    const interval = intervals.find((i) => i.serviceId === serviceId);
    if (!interval) return null;
    return isTimeInterval(interval) || isMeterInterval(interval)
      ? interval
      : null;
  }, [intervals, serviceId]);

  // Vencimiento sugerido: por intervalo del servicio o por defecto
  const suggested = useMemo((): { dueDate: string; dueMeter: MeterValue } => {
    const lastMeter =
      lastPerformedMeter === "" ? null : Number(lastPerformedMeter);

    if (activeInterval) {
      const computed = computeDueFromInterval(
        activeInterval,
        lastPerformedDate,
        lastMeter,
      );
      return {
        dueDate: computed.dueDate ?? "",
        dueMeter: computed.dueMeter ?? "",
      };
    }

    return {
      dueDate: lastPerformedDate
        ? addMonths(parseISODate(lastPerformedDate), DEFAULT_INTERVAL_MONTHS)
        : "",
      dueMeter: lastMeter == null ? "" : lastMeter + DEFAULT_INTERVAL_METER,
    };
  }, [activeInterval, lastPerformedDate, lastPerformedMeter]);

  const dueDate = dueDateOverride ?? suggested.dueDate;
  const dueMeter = dueMeterOverride ?? suggested.dueMeter;

  // Al cambiar los datos base se descartan las ediciones manuales del vencimiento
  const resetDueOverrides = () => {
    setDueDateOverride(undefined);
    setDueMeterOverride(undefined);
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    setErrors({});
    openModal("SCHEDULE"); // regresar a la lista de reminders
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const lastMeter = Number(lastPerformedMeter);
    const dueMeterNum = Number(dueMeter);

    if (serviceId == null) {
      newErrors.preventivePlanId = "Select a service.";
    } else if (usedServiceIds.has(serviceId)) {
      newErrors.preventivePlanId =
        "This equipment already has a reminder for this service.";
    }

    if (!dueDate && dueMeter === "") {
      newErrors.dueDate = "Enter a due date and/or a due meter.";
      newErrors.dueMeter = "Enter a due date and/or a due meter.";
    }

    if (lastPerformedMeter !== "" && (isNaN(lastMeter) || lastMeter < 0)) {
      newErrors.lastPerformedMeter =
        "The current reading must be a valid number.";
    }

    if (dueDate) {
      if (!lastPerformedDate) {
        newErrors.lastPerformedDate = "The last execution date is required.";
      } else if (parseISODate(dueDate) < parseISODate(lastPerformedDate)) {
        newErrors.dueDate =
          "The deadline cannot be earlier than the date of the last execution.";
      }
    }

    if (dueMeter !== "") {
      if (isNaN(dueMeterNum) || dueMeterNum <= 0) {
        newErrors.dueMeter = "The target reading must be greater than 0.";
      } else if (lastPerformedMeter === "") {
        newErrors.lastPerformedMeter = "The current reading is required.";
      } else if (dueMeterNum <= lastMeter) {
        newErrors.dueMeter = `The target reading (${dueMeterNum}) must be greater than the current reading (${lastMeter}).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowPinModal(true);
  };

  const handleConfirmPin = (mechanic: Mechanic) => {
    setShowPinModal(false);
    if (serviceId == null) return;

    const payload: CreateScheduleDTO = {
      preventivePlanId: serviceId,
      equipmentId: equipment.equipmentsId,
      lastPerformedDate: lastPerformedDate || null,
      lastPerformedMeter:
        lastPerformedMeter === "" ? null : Number(lastPerformedMeter),
      dueDate: dueDate || null,
      dueMeter: dueMeter === "" ? null : Number(dueMeter),
      userName: mechanic.fullName,
    };

    handleCreateSchedule(payload, {
      onSuccess: () => handleClose(),
    });
  };

  const selectedServiceName = services.find((s) => s.id === serviceId)
    ?.serviceName;

  const renderIntervalHint = () => {
    if (serviceId == null) return null;
    if (vehicleTypeId == null) {
      return "Select a vehicle type to use the service intervals. Using default (6 months / 500 hrs).";
    }
    if (loadingIntervals) return "Loading intervals...";
    if (activeInterval) {
      return `Interval for this vehicle type: every ${formatInterval(activeInterval)}.`;
    }
    return "No interval configured for this service and vehicle type. Using default (6 months / 500 hrs).";
  };

  return (
    <>
      <Modal
        show={!showPinModal}
        onHide={handleClose}
        centered
        backdrop="static"
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-4">
            {/* Encabezado */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center bg-primary-subtle rounded-circle text-primary"
                  style={{ width: "36px", height: "36px" }}
                >
                  <BsWrenchAdjustable size={18} />
                </div>
                <div>
                  <h6 className="fw-semibold mb-0 text-dark fs-6">
                    New maintenance reminder
                  </h6>
                  <span className="text-secondary small">
                    {equipment.name}{" "}
                    {equipment.number ? `(#${equipment.number})` : ""}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close shadow-none opacity-50 opacity-100-hover"
                onClick={handleClose}
              />
            </div>

            <div className="row g-2 mb-3">
              {/* Servicio */}
              <div className="col-7">
                <Form.Group>
                  <Form.Label className="small fw-medium text-secondary mb-1">
                    Service
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={serviceId ?? ""}
                    onChange={(e) => {
                      setServiceId(
                        e.target.value === "" ? null : Number(e.target.value),
                      );
                      resetDueOverrides();
                      clearError("preventivePlanId");
                    }}
                    isInvalid={!!errors.preventivePlanId}
                    disabled={loadingServices}
                    className="rounded-3 border-light-subtle shadow-none fs-7 py-2"
                  >
                    <option value="">
                      {loadingServices ? "Loading..." : "Select service..."}
                    </option>
                    {services.map((service) => {
                      const used = usedServiceIds.has(service.id);
                      return (
                        <option
                          key={service.id}
                          value={service.id}
                          disabled={used}
                        >
                          {service.serviceName}
                          {used ? " (already scheduled)" : ""}
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.preventivePlanId}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              {/* Tipo de vehículo (para los intervalos) */}
              <div className="col-5">
                <Form.Group>
                  <Form.Label className="small fw-medium text-secondary mb-1">
                    Vehicle type
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={vehicleTypeId ?? ""}
                    onChange={(e) => {
                      setVehicleTypeOverride(
                        e.target.value === "" ? null : Number(e.target.value),
                      );
                      resetDueOverrides();
                    }}
                    className="rounded-3 border-light-subtle shadow-none fs-7 py-2 text-capitalize"
                  >
                    <option value="">Not set</option>
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.typeName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {serviceId != null && (
              <div
                className={`small mb-3 ${activeInterval ? "text-primary" : "text-muted"}`}
                style={{ fontSize: "0.75rem" }}
              >
                {renderIntervalHint()}
              </div>
            )}

            {/* Bloque 1: Última Ejecución */}
            <div className="bg-light p-2.5 rounded-3 mb-3 border border-light-subtle">
              <div className="text-uppercase fw-bold text-secondary fs-8 mb-2 tracking-wide">
                Last Performed
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="fs-8 text-secondary mb-1">
                      Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={lastPerformedDate}
                      onChange={(e) => {
                        setLastPerformedDate(e.target.value);
                        resetDueOverrides();
                        clearError("lastPerformedDate");
                        clearError("dueDate");
                      }}
                      className="rounded-3 border-light-subtle fs-7 py-1"
                      isInvalid={!!errors.lastPerformedDate}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastPerformedDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="fs-8 text-secondary mb-1">
                      Actual Meter
                    </Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      placeholder="8500"
                      value={lastPerformedMeter}
                      onChange={(e) => {
                        setLastPerformedMeter(toMeter(e.target.value));
                        resetDueOverrides();
                        clearError("lastPerformedMeter");
                        clearError("dueMeter");
                      }}
                      isInvalid={!!errors.lastPerformedMeter}
                      className="rounded-3 border-light-subtle fs-7 py-1"
                      min="0"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastPerformedMeter}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>
            </div>

            {/* Bloque 2: Vencimiento Objetivo */}
            <div className="p-2.5 rounded-3 mb-3 border border-primary-subtle bg-primary-subtle bg-opacity-10">
              <div className="text-uppercase fw-bold text-primary fs-8 mb-2 tracking-wide">
                Due Target{selectedServiceName ? ` — ${selectedServiceName}` : ""}
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="fs-8 text-secondary mb-1">
                      Date limit
                    </Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDateOverride(e.target.value);
                        clearError("dueDate");
                      }}
                      isInvalid={!!errors.dueDate}
                      className="rounded-3 border-light-subtle fs-7 py-1"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dueDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="fs-8 text-secondary mb-1">
                      Meter limit
                    </Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      placeholder="9300"
                      value={dueMeter}
                      min="0"
                      onChange={(e) => {
                        setDueMeterOverride(toMeter(e.target.value));
                        clearError("dueMeter");
                      }}
                      isInvalid={!!errors.dueMeter}
                      className="rounded-3 border-light-subtle fs-7 py-1"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dueMeter}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>
            </div>

            {/* Footer de Acciones */}
            <div className="d-flex align-items-center justify-content-end pt-1">
              <div className="d-flex gap-2">
                <Button
                  variant="link"
                  className="text-decoration-none text-secondary fs-7 px-2 py-1 shadow-none"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="fw-medium fs-7 px-3 py-1.5 rounded-3 shadow-sm"
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {showPinModal && (
        <UserPinValidationModal
          show={showPinModal}
          title="Authorise Reminder Creation"
          actionDescription={`Creating ${selectedServiceName ?? "maintenance"} reminder for Equipment #${equipment.number}`}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleConfirmPin}
        />
      )}
    </>
  );
}

export default ScheduleCreation;
