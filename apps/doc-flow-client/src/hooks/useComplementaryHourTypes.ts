import { useState, useEffect } from "react";
import { ComplementaryHourType } from "@/lib/types/certificate.types";
import ApiService from "@/api/services/api-service";

interface UseComplementaryHourTypesReturn {
  complementaryHourTypes: ComplementaryHourType[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const fetchComplementaryHourTypes = async (): Promise<ComplementaryHourType[]> => {
  try {
    const apiService = new ApiService(true);
    const response = await apiService.get('/complementary-activities/types');
    
    return response.map((type: any) => ({
      id: type.id.toString(),
      name: type.name,
      description: type.description
    }));
  } catch (error) {
    console.error('Erro ao buscar tipos de atividades:', error);
    throw new Error('Erro ao carregar tipos de atividades complementares');
  }
};

export function useComplementaryHourTypes(): UseComplementaryHourTypesReturn {
  const [complementaryHourTypes, setComplementaryHourTypes] = useState<ComplementaryHourType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComplementaryHourTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const types = await fetchComplementaryHourTypes();
      setComplementaryHourTypes(types);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setComplementaryHourTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplementaryHourTypes();
  }, []);

  const refetch = () => {
    loadComplementaryHourTypes();
  };

  return {
    complementaryHourTypes,
    loading,
    error,
    refetch
  };
}

export function useComplementaryHourType(id: string): ComplementaryHourType | null {
  const { complementaryHourTypes } = useComplementaryHourTypes();
  return complementaryHourTypes.find(type => type.id === id) || null;
} 
 
 