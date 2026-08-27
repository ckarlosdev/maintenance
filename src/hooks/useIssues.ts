import { useQuery } from "@tanstack/react-query";
import type { EquipmentIssueSummary } from "../types";
import { api } from "./apiConfig";

export type ActiveIssuesMap = Record<number, EquipmentIssueSummary[]>;

const queryIssuesByEquipmentIds = async (
  equipmentIds: number[],
): Promise<ActiveIssuesMap> => {
  if (!equipmentIds || equipmentIds.length === 0) return {};

  const { data } = await api.post<ActiveIssuesMap>(
    `v2/maintenance/issue/active-by-equipments`,
    equipmentIds,
  );
  return data;
};

export function useGetIssuesByEquipmentIds(equipmentIds: number[]) {
  return useQuery<ActiveIssuesMap>({
    queryKey: ["issues", "active-by-equipments", equipmentIds],
    queryFn: () => queryIssuesByEquipmentIds(equipmentIds),
    enabled: equipmentIds.length > 0,
    retry: false,
  });
}
