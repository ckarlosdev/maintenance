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
  const { data } = await api.get(
    `v2/maintenance/work-order/${workOrderId}`,
  );
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
}) => {
  return api.post("v2/maintenance/work-order", workOrder);
};

export function useSaveWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      // 1. Refresca la lista de órdenes de trabajo
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });

      // 2. Refresca la lista de schedules para desmarcar el que ya se asignó
      queryClient.invalidateQueries({
        queryKey: ["schedules", "active-by-equipments"],
      }); // Ajusta a la queryKey exacta que uses en useGetChedulesByEquipmentIds

      // 3. Refresca los issues pendientes por si la orden consumió alguno
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
