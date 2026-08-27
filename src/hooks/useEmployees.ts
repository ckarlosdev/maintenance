import { useQuery } from "@tanstack/react-query";
import type { Employee } from "../types";
import { apiBase } from "./apiConfig";

const queryEmployees = (): Promise<Employee[]> => {
  return apiBase.get("v1/employee").then((response) => response.data);
};

function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: queryEmployees,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default useEmployees;