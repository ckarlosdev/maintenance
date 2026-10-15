import type { EquipmentDetail } from "../types";

type GroupedEquipments = Record<string, Record<string, EquipmentDetail[]>>;

export function groupEquipmentsByFamilyAndSubtype(
  data: EquipmentDetail[] = [],
): GroupedEquipments {
  return data.reduce((acc, item) => {
    const { family, subtype } = item;

    // Si la familia no existe en el acumulador, la inicializamos
    if (!acc[family]) {
      acc[family] = {};
    }

    // Si el subtipo no existe dentro de esa familia, lo inicializamos con un array vacío
    if (!acc[family][subtype]) {
      acc[family][subtype] = [];
    }

    // Agregamos el elemento al array correspondiente
    acc[family][subtype].push(item);

    return acc;
  }, {} as GroupedEquipments);
}
