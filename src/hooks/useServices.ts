import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type { ServiceInterval, ServiceType } from "../types";
import { useEquipmentsDetails } from "./useEquipments";
import { resolveVehicleTypeId } from "../utilities/vehicleTypes";

const queryServices = async (): Promise<ServiceType[]> => {
  const { data } = await api.get<ServiceType[]>("v2/maintenance/services");
  return data;
};

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: queryServices,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });
}

/** Map service_id -> serviceName, útil para mostrar el nombre de cada reminder. */
export function useServiceNames() {
  const { data: services = [] } = useServices();
  return useMemo(() => {
    const map: Record<number, string> = {};
    services.forEach((s) => (map[s.id] = s.serviceName));
    return map;
  }, [services]);
}

const queryIntervals = async (
  vehicleTypeId: number,
): Promise<ServiceInterval[]> => {
  const { data } = await api.get<ServiceInterval[]>(
    `v2/maintenance/interval/${vehicleTypeId}`,
  );
  return data;
};

export function useIntervalsByVehicleType(vehicleTypeId: number | null) {
  return useQuery({
    queryKey: ["intervals", vehicleTypeId],
    queryFn: () => queryIntervals(vehicleTypeId as number),
    enabled: vehicleTypeId != null,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });
}

/** Vehicle type detectado a partir del subtype/family del equipo. */
export function useEquipmentVehicleTypeId(
  equipmentId: number | null | undefined,
): number | null {
  const { data: details } = useEquipmentsDetails();
  return useMemo(() => {
    if (equipmentId == null) return null;
    const detail = details?.find((d) => d.equipmentsId === equipmentId);
    return resolveVehicleTypeId(detail);
  }, [details, equipmentId]);
}
