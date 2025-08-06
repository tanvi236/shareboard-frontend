import { useState, useCallback } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export const useInvitations = () => {
  const [loading, setLoading] = useState(false);

  const getUserInvitations = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const invitations = await apiService.getUserInvitations(email);
      return invitations;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to fetch invitations');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvitation = useCallback(async (token: string) => {
    try {
      const result = await apiService.acceptInvitation(token);
      toast.success('Invitation accepted successfully!');
      return result;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
      throw error;
    }
  }, []);

  return {
    loading,
    getUserInvitations,
    acceptInvitation,
  };
};
