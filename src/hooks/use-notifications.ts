import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';
import type { Notification } from '../types';

/**
 * Fetches notifications for the current user.
 */
export function useNotifications(userId: string) {
  return useQuery<Notification[]>(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data ?? [];
  }, [userId]);
}
