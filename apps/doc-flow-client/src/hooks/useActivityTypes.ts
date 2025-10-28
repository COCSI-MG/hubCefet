import { useState, useEffect } from "react";
import { ActivityType } from "@/lib/types/certificate.types";
import ApiService from "@/api/services/api-service";

interface UseActivityTypesReturn {
  activityTypes: ActivityType[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const fetchActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const apiService = new ApiService(true);
    const response = await apiService.get('/activities/types');

    return response.map((type: any) => ({
      id: type.id.toString(),
      name: type.name,
    }));
  } catch (error) {
    console.error('Erro ao buscar tipos de atividades:', error);
    throw new Error('Erro ao carregar tipos de atividades');
  }
};

export function useActivityTypes(): UseActivityTypesReturn {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivityTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const types = await fetchActivityTypes();
      setActivityTypes(types);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setActivityTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivityTypes();
  }, []);

  const refetch = () => {
    loadActivityTypes();
  };

  return {
    activityTypes,
    loading,
    error,
    refetch
  };
}

export function useActivityType(id: string): ActivityType | null {
  const { activityTypes } = useActivityTypes();
  return activityTypes.find(type => type.id === id) || null;
}


