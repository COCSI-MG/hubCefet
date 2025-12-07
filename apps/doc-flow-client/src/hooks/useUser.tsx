import useAuth from './useAuth';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User } from '@/lib/schemas/user.schema';
import { userService } from '@/api/services/users.service';
import { ApiError } from '@/api/errors/ApiError';

interface UseUser {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const useUser = (): UseUser => {
  const [loadedUser, setLoadedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  if (!user) {
    throw new Error('useUser must be used within an AuthProvider');
  }

  const fetchUser = useCallback(async () => {
    toast.info("Carregando usuário...");
    setIsLoading(true);

    try {
      const response = await userService.getOne(user.sub);
      const fetchedUser = response;

      if (!fetchedUser) {
        toast.error("Erro ao carregar usuário");
        return;
      }

      if (import.meta.env.DEV) {
        toast.info("Usuário carregado com sucesso");
      }

      setLoadedUser(fetchedUser);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Erro inesperado ao carregar usuário");
    } finally {
      setIsLoading(false);
    }
  }, [user.sub]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user: loadedUser,
    setUser: setLoadedUser,
    isLoading,
  };
};

export default useUser;
