import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'manager' | 'user';

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isManager: boolean;
  isAdminOrManager: boolean;
  role: AppRole | null;
  isLoading: boolean;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data?.role as AppRole || null);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchRole();
    }
  }, [user, authLoading]);

  return {
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isAdminOrManager: role === 'admin' || role === 'manager',
    role,
    isLoading: authLoading || isLoading,
  };
}
