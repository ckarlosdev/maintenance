import type { EquipmentDetail } from "../types";

// Espejo de la tabla vehicle_types (no hay endpoint GET para listarla).
export const VEHICLE_TYPES: { id: number; typeName: string }[] = [
  { id: 1, typeName: "crusher" },
  { id: 2, typeName: "dozer" },
  { id: 3, typeName: "excavator" },
  { id: 4, typeName: "heavy truck" },
  { id: 5, typeName: "light truck" },
  { id: 6, typeName: "miscellaneous" },
  { id: 7, typeName: "semi trailer" },
  { id: 8, typeName: "skid loader" },
  { id: 9, typeName: "telehandler" },
  { id: 10, typeName: "trailer" },
  { id: 11, typeName: "wheel loader" },
];

const normalize = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/s$/, ""); // "Excavators" -> "excavator"

const findByName = (value?: string | null): number | null => {
  const name = normalize(value);
  if (!name) return null;
  const match = VEHICLE_TYPES.find((t) => normalize(t.typeName) === name);
  return match?.id ?? null;
};

/**
 * Intenta relacionar un equipo con un vehicle_type por nombre:
 * primero por subtype y luego por family. Devuelve null si no hay match.
 */
export function resolveVehicleTypeId(
  detail?: Pick<EquipmentDetail, "subtype" | "family"> | null,
): number | null {
  if (!detail) return null;
  return findByName(detail.subtype) ?? findByName(detail.family);
}
