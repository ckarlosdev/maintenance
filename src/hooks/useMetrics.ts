import { useQuery } from "@tanstack/react-query";
import type { KpiDetailResponseDto, KpiType, Metric } from "../types";
import { api } from "./apiConfig";

const queryMetrics = (): Promise<Metric> => {
  return api
    .get("v2/maintenance/work-order/metrics")
    .then((response) => response.data);
};

export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: queryMetrics,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

interface UseKpiDetailsParams {
  type: KpiType | null;
  equipmentId?: number | null;
  enabled?: boolean; // Útil para diferir la carga (ej. solo cuando el modal está abierto)
}

const queryKpis = async (
  type: KpiType,
  equipmentId?: number | null,
): Promise<KpiDetailResponseDto[]> => {
  const params: Record<string, any> = { type };

  if (equipmentId) {
    params.equipmentId = equipmentId;
  }

  const { data } = await api.get(
    `v2/maintenance/work-order/details?type=${type}`,
    params,
  );

  return data;
};

export const useKpiDetails = ({
  type,
  equipmentId,
  enabled = true,
}: UseKpiDetailsParams) => {
  return useQuery({
    queryKey: ["kpi-details", type, equipmentId ?? "all"],
    queryFn: () => queryKpis(type!, equipmentId),
    enabled: enabled && !!type,
    staleTime: 1000 * 60 * 5,
  });
};
