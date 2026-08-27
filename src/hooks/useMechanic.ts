import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type { Mechanic, ValidatePinDto } from "../types";

const validatePin = async (dto: ValidatePinDto) => {
  const response = await api.post(`v2/maintenance/mechanic/validate-pin`, dto);
  return response.data;
};

export function useValidatePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validatePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanic-validation"] });
    },
  });
}

// hook to get mechanics

const getActiveMechanics = async (): Promise<Mechanic[]> => {
  const response = await api.get<Mechanic[]>(
    `v2/maintenance/mechanic`,
  );
  return response.data;
};

export function useActiveMechanics() {
  return useQuery({
    queryKey: ["mechanics", "active"],
    queryFn: getActiveMechanics,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}
