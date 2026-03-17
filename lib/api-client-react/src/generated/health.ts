import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { HealthCheckResponse } from "@workspace/api-zod";
import { apiInstance } from "../custom-fetch";

const HEALTH_BASE_URL = "/api/health";

export const healthCheck = async () => {
  return apiInstance.get<HealthCheckResponse>(HEALTH_BASE_URL);
};

export const useHealthCheck = (
  options?: UseQueryOptions<HealthCheckResponse>,
) => {
  return useQuery({
    queryKey: ["health"],
    queryFn: healthCheck,
    ...options,
  });
};
