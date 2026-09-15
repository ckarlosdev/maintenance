import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type {
  CreateTaskPayload,
  CreateWorkOrderPayload,
  UpdateStatus,
  UpdateWorkOrderTaskDto,
  WorkOrder,
} from "../types";

const queryGetWorkOrdersByEquipmentId = async (
  equipmentID: number,
): Promise<WorkOrder[]> => {
  const { data } = await api.get(
    `v2/maintenance/work-order/equipment/${equipmentID}`,
  );
  return data;
};

export function useGetWorkOrdesrsByEquipmentId(equipmentID: number) {
  return useQuery({
    queryKey: ["workOrders", equipmentID],
    queryFn: () => queryGetWorkOrdersByEquipmentId(equipmentID),
    enabled: !!equipmentID,
    retry: false,
  });
}

const queryGetWorkOrderById = async (
  workOrderId: number,
): Promise<WorkOrder> => {
  const { data } = await api.get(`v2/maintenance/work-order/${workOrderId}`);
  return data;
};

export function useGetWorkOrderById(workOrderId: number) {
  return useQuery({
    queryKey: ["workOrders", workOrderId],
    queryFn: () => queryGetWorkOrderById(workOrderId),
    enabled: !!workOrderId,
    retry: false,
  });
}

const createWorkOrder = async ({
  workOrder,
}: {
  workOrder: CreateWorkOrderPayload;
}): Promise<WorkOrder> => {
  const response = await api.post<WorkOrder>(
    "v2/maintenance/work-order",
    workOrder,
  );
  return response.data;
};

export function useSaveWorkOrder() {
  const queryClient = useQueryClient();

  // Passing <WorkOrder, Error, { workOrder: CreateWorkOrderPayload }>
  return useMutation<
    WorkOrder, // 1. TData: Tipo de respuesta de la API (lo que retorna mutateAsync)
    Error, // 2. TError: Tipo de error
    { workOrder: CreateWorkOrderPayload } // 3. TVariables: El objeto payload que recibe la función
  >({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["schedules", "active-by-equipments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["issues", "active-by-equipments"],
      });
    },
  });
}

// CLOSE WORK ORDER (change order status)

const closeWorkOrder = async ({
  workOrderId,
  data,
}: {
  workOrderId: number;
  data: UpdateStatus;
}) => {
  const response = await api.patch(
    `v2/maintenance/work-order/${workOrderId}/status`,
    data,
  );
  return response.data;
};

export function useCloseWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}

// update task

interface UpdateTaskParams {
  taskId: number;
  dto: UpdateWorkOrderTaskDto;
}

const patchTask = async ({ taskId, dto }: UpdateTaskParams) => {
  const response = await api.patch(
    `v2/maintenance/work-order/task/${taskId}`,
    dto,
  );
  return response.data;
};

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchTask,
    onSuccess: () => {
      // Invalida la query para refrescar la tabla automáticamente
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}

// Add a new task for a work order

const addTask = async ({
  workOrderId,
  dto,
}: {
  workOrderId: number;
  dto: CreateTaskPayload;
}) => {
  const response = await api.post(
    `v2/maintenance/work-order/${workOrderId}/tasks`,
    dto,
  );
  return response.data;
};

export function useAddTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}
