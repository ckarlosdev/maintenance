import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { useModalStore } from "../../stores/useModalStore";
import { useEffect, useState } from "react";
import type { CreateScheduleDTO, MaintenanceForm, Mechanic } from "../../types";
import { BsWrenchAdjustable } from "react-icons/bs";
import { useCreateSchedule } from "../../hooks/useSchedules";
import { UserPinValidationModal } from "../TaskValidationModal";
import { useGetWorkOrderById } from "../../hooks/useWorkOrders";

type Props = {};

type FormErrors = Partial<Record<keyof CreateScheduleDTO, string>>;

function ScheduleCreation({}: Props) {
  const { activeModal, equipmentSelected, closeModal, openModal } =
    useModalStore();
  const { mutate: handleCreateSchedule, isPending } = useCreateSchedule();
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPinModal, setShowPinModal] = useState(false);

  const isOpen = activeModal === "SCHEDULE_CREATION";

  const addMonths = (date: Date = new Date(), months: number): string => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result.toISOString().split("T")[0];
  };

  const today = new Date();
  const odometer = Number(equipmentSelected?.hour) ?? 0;

  const [formData, setFormData] = useState<MaintenanceForm>({
    preventivePlanId: 8,
    equipmentId: equipmentSelected?.equipmentsId || 10,
    lastPerformedDate: today.toISOString().split("T")[0],
    lastPerformedMeter: odometer,
    dueDate: addMonths(today, 6),
    dueMeter: odometer + 500,
    userName: "ckarlos",
  });

  useEffect(() => {
    if (equipmentSelected) {
      const initialOdometer = Number(equipmentSelected.hour) || 0;
      const now = new Date();

      setFormData({
        preventivePlanId: null,
        equipmentId: equipmentSelected.equipmentsId || 10,
        lastPerformedDate: now.toISOString().split("T")[0],
        lastPerformedMeter: initialOdometer,
        dueDate: addMonths(now, 6),
        dueMeter: initialOdometer + 500,
        userName: "No data",
      });
    }
  }, [equipmentSelected]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Limpiar error visual del campo interactuado
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    setFormData((prev) => {
      let updatedValue: number | "" | string = value;

      if (name.includes("Meter") || name.includes("Id")) {
        updatedValue = value === "" ? "" : Number(value);
      }

      // 1. Recálculo al cambiar la fecha de última ejecución
      if (name === "lastPerformedDate" && value) {
        const selectedDate = new Date(`${value}T00:00:00`);
        return {
          ...prev,
          [name]: value,
          dueDate: addMonths(selectedDate, 6),
        };
      }

      // 2. Recálculo al cambiar lastPerformedMeter
      if (name === "lastPerformedMeter") {
        const numericMeter = value === "" ? 0 : Number(value);
        const newLastPerformedMeter: number | "" =
          value === "" ? "" : Number(value);

        return {
          ...prev,
          lastPerformedMeter: newLastPerformedMeter,
          dueMeter: value === "" ? "" : numericMeter + 500,
        };
      }

      return {
        ...prev,
        [name]: updatedValue,
      };
    });
  };

  const handleClose = () => {
    setErrors({}); // Limpia las validaciones
    closeModal(); // Cierra el modal en el store
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Convertimos las lecturas a números
    const lastMeter = Number(formData.lastPerformedMeter);
    const dueMeter = Number(formData.dueMeter);

    // Verificamos qué grupos tienen información
    const hasDates = Boolean(formData.lastPerformedDate || formData.dueDate);
    const hasMeters = Boolean(
      formData.lastPerformedMeter !== "" || formData.dueMeter !== "",
    );

    // REGLA BASE: No se pueden dejar ambos pares de datos completamente vacíos
    if (!hasDates && !hasMeters) {
      newErrors.lastPerformedDate =
        "Debes ingresar las fechas o el millaje/horas.";
      newErrors.lastPerformedMeter =
        "Debes ingresar las fechas o el millaje/horas.";
      setErrors(newErrors);
      return false;
    }

    // 1. VALIDACIÓN DE FECHAS (se evalúa si se ingresó alguna fecha)
    if (hasDates) {
      if (!formData.lastPerformedDate) {
        newErrors.lastPerformedDate = "The last execution date is required.";
      }

      if (!formData.dueDate) {
        newErrors.dueDate = "The deadline is required.";
      } else if (
        formData.lastPerformedDate &&
        new Date(formData.dueDate) < new Date(formData.lastPerformedDate)
      ) {
        newErrors.dueDate =
          "The deadline cannot be earlier than the date of the last execution.";
      }
    }

    // 2. VALIDACIÓN DE ODÓMETRO / HORAS (se evalúa si se ingresó algún odómetro)
    if (hasMeters) {
      if (
        formData.lastPerformedMeter === "" ||
        isNaN(lastMeter) ||
        lastMeter < 0
      ) {
        newErrors.lastPerformedMeter =
          "The current reading must be a valid number.";
      }

      if (formData.dueMeter === "" || isNaN(dueMeter) || dueMeter <= 0) {
        newErrors.dueMeter = "The target reading must be greater than 0.";
      } else if (!isNaN(lastMeter) && dueMeter <= lastMeter) {
        newErrors.dueMeter = `The target reading (${dueMeter}) must be greater than the current reading (${lastMeter}).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   const payload: CreateScheduleDTO = {
  //     preventivePlanId: Number(formData.preventivePlanId),
  //     equipmentId: Number(formData.equipmentId),
  //     lastPerformedDate: formData.lastPerformedDate,
  //     lastPerformedMeter: Number(formData.lastPerformedMeter) || 0,
  //     dueDate: formData.dueDate,
  //     dueMeter: Number(formData.dueMeter) || 0,
  //     userName: formData.userName,
  //   };

  //   handleCreateSchedule(payload, {
  //     onSuccess: () => {
  //       handleClose();
  //     },
  //   });
  // };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Si los campos son válidos, solicitamos la autorización por PIN
    setShowPinModal(true);
  };

  const handleConfirmPin = (mechanic: Mechanic) => {
    setShowPinModal(false);

    const payload: CreateScheduleDTO = {
      preventivePlanId: Number(formData.preventivePlanId),
      equipmentId: Number(formData.equipmentId),
      lastPerformedDate: formData.lastPerformedDate,
      lastPerformedMeter: Number(formData.lastPerformedMeter) || 0,
      dueDate: formData.dueDate,
      dueMeter: Number(formData.dueMeter) || 0,
      userName: mechanic.fullName,
      orderStatus: "DRAFT", // O el valor/enum que corresponda por defecto
      scheduleStatus: "unasigned",
    };

    handleCreateSchedule(payload, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        show={isOpen}
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
                    Generate maintenance
                  </h6>
                  <span className="text-secondary small">
                    {equipmentSelected
                      ? `${equipmentSelected.name} ${equipmentSelected.number ? `(#${equipmentSelected.number})` : ""}`
                      : `Equipment #${formData.equipmentId}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close shadow-none opacity-50 opacity-100-hover"
                onClick={handleClose}
              />
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-medium text-secondary mb-1">
                Preventive Plan
              </Form.Label>
              <Form.Select
                size="sm"
                name="preventivePlanId"
                value={formData.preventivePlanId ?? ""}
                onChange={handleChange}
                isInvalid={!!errors.preventivePlanId}
                className="rounded-3 border-light-subtle shadow-none fs-7 py-2"
              >
                <option value="">Select plan...</option>
                <option value={8}>Oil change (Plan #8)</option>
                <option value={9}>Brakes check (Plan #9)</option>
                <option value={10}>Grease (Plan #10)</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.preventivePlanId}
              </Form.Control.Feedback>
            </Form.Group>

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
                    <InputGroup size="sm" hasValidation>
                      <Form.Control
                        type="date"
                        name="lastPerformedDate"
                        value={formData.lastPerformedDate || ""}
                        onChange={handleChange}
                        className="rounded-3 border-light-subtle fs-7 py-1"
                        isInvalid={!!errors.lastPerformedDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastPerformedDate}
                      </Form.Control.Feedback>
                    </InputGroup>
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
                      name="lastPerformedMeter"
                      placeholder="8500"
                      value={formData.lastPerformedMeter ?? ""}
                      onChange={handleChange}
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
                Due Target
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
                      name="dueDate"
                      value={formData.dueDate || ""}
                      onChange={handleChange}
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
                      name="dueMeter"
                      placeholder="9300"
                      value={formData.dueMeter ?? ""}
                      min="0"
                      onChange={handleChange}
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
          title="Authorise Schedule Creation"
          actionDescription={`Creating schedule for Equipment #${equipmentSelected?.number || formData.equipmentId}`}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleConfirmPin}
        />
      )}
    </>
  );
}

export default ScheduleCreation;
