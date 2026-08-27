import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./apiConfig";
import type { Schedule, CreateScheduleDTO } from "../types";

const querySchedules = async (equipmentIds: number[]): Promise<Schedule[]> => {
  if (!equipmentIds || equipmentIds.length === 0) return [];

  const { data } = await api.post(
    `v2/maintenance/schedule/active-by-equipments`,
    equipmentIds,
  );
  return data;
};

export function useGetChedulesByEquipmentIds(equipmentIds: number[]) {
  return useQuery({
    queryKey: ["schedules", "active-by-equipments", equipmentIds],
    queryFn: () => querySchedules(equipmentIds),
    enabled: equipmentIds.length > 0,
    retry: false,
  });
}

// CREATE A NEW SCHEDULE
const createSchedule = async (scheduleData: CreateScheduleDTO): Promise<Schedule> => {
  const { data } = await api.post("v2/maintenance/schedule", scheduleData);
  return data;
};

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (error) => {
      console.error("Error creating an schedule:", error);
    },
  });
}
