import { useQuery } from "@tanstack/react-query";
import type { Equipment, EquipmentDetail } from "../types";
import { api } from "./apiConfig";

const queryEquipments = (): Promise<Equipment[]> => {
  return api.get("v1/equipments").then((response) => response.data);
};

export function useEquipments() {
  return useQuery({
    queryKey: ["equipments"],
    queryFn: queryEquipments,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

const queryEquipmentsDetails = (): Promise<EquipmentDetail[]> => {
  return api.get("v1/equipments/with-details").then((response) => response.data);
};

export function useEquipmentsDetails() {
  return useQuery({
    queryKey: ["equipments", "details"],
    queryFn: queryEquipmentsDetails,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}
