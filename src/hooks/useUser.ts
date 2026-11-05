import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "./apiConfig";
import { useEffect } from "react";

const queryMe = async () => {
  const { data } = await api.get("auth/me");
  return data;
};

function useUser() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const query = useQuery({
    queryKey: ["user", token],
    queryFn: queryMe,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setAuth(query.data);
    }
    if (query.isError) {
      clearAuth();
    }
  }, [query.data, query.isError, setAuth, clearAuth]);

  return query;
}

export default useUser;
