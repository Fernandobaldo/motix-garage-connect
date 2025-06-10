
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { toast } from '@/components/ui/use-toast';
import type { Notification } from './types';

export const useNotifications = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id, tenant?.id],
    queryFn: async () => {
      if (!user || !tenant) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user && !!tenant,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !tenant) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new channel
    const channel = supabase
      .channel(`notifications-${user.id}-${Date.now()}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add to cache
          queryClient.setQueryData(['notifications', user.id, tenant.id], (old: Notification[] = []) => 
            [newNotification, ...old]
          );

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'error' ? 'destructive' : 'default',
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, tenant?.id, queryClient]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
      return;
    }

    // Update cache
    queryClient.setQueryData(['notifications', user.id, tenant?.id], (old: Notification[] = []) =>
      old.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read_at: new Date().toISOString() }
          : notif
      )
    );
  };

  const markAllAsRead = async () => {
    if (!user || !tenant) return;

    const unreadIds = notifications
      .filter(n => !n.read_at)
      .map(n => n.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive'
      });
      return;
    }

    // Update cache
    const now = new Date().toISOString();
    queryClient.setQueryData(['notifications', user.id, tenant.id], (old: Notification[] = []) =>
      old.map(notif => ({ ...notif, read_at: notif.read_at || now }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
};
