import { useQuery } from "@tanstack/react-query";
import type { Equipment } from "../types";
import { api } from "./apiConfig";

const queryEquipments = (): Promise<Equipment[]> => {
  return api.get("v1/equipments").then((response) => response.data);
};

function useEquipments() {
  return useQuery({
    queryKey: ["equipments"],
    queryFn: queryEquipments,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default useEquipments;
