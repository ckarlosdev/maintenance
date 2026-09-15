import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type { UpdateIssueFlowRequest } from "../types";

const updateIssueFlow = async (data: UpdateIssueFlowRequest) => {
  const response = await api.patch(`v1/issue/flow`, data);
  return response.data;
};

export function useUpdateIssueFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIssueFlow,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issues"],
      });
    },
  });
}
