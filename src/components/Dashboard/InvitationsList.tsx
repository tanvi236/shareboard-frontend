import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Clock, User, Mail, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Button, Card, LoadingSpinner } from '../../styles/GlobalStyles';
import toast from 'react-hot-toast';

const InvitationsContainer = styled.div`
  margin-top: 32px;
`;

const InvitationCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const InvitationHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const BoardInfo = styled.div`
  flex: 1;
`;

const BoardName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
`;

const InviterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  margin-bottom: 12px;
`;

const InvitationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #a0aec0;
  font-size: 12px;
  margin-bottom: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const AcceptButton = styled(Button)`
  background: #48bb78;
  &:hover {
    background: #38a169;
  }
`;

const DeclineButton = styled(Button)`
  background: #f56565;
  &:hover {
    background: #e53e3e;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #718096;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Badge = styled.span`
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

interface Invitation {
  _id: string;
  boardId: {
    _id: string;
    name: string;
  };
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  email: string;
  status: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

interface InvitationsListProps {
  onInvitationAccepted?: () => void;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ onInvitationAccepted }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingInvites, setAcceptingInvites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.email) {
      fetchInvitations();
    }
  }, [user?.email]);

  const fetchInvitations = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      // Now uses POST with email in body
      const invitationData = await apiService.getUserInvitations(user.email);
      setInvitations(invitationData);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      
      // If invitations feature is not implemented yet, just show empty state
      if (error.response?.status === 404) {
        console.log('Invitations feature not available yet');
        setInvitations([]);
      } else {
        toast.error('Failed to fetch invitations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      setAcceptingInvites(prev => new Set(prev).add(invitation._id));
      
      await apiService.acceptInvitation(invitation.token);
      
      toast.success(`Successfully joined "${invitation.boardId.name}"`);
      
      // Remove the accepted invitation from the list
      setInvitations(prev => prev.filter(inv => inv._id !== invitation._id));
      
      // Call the callback to refresh parent's boards list
      if (onInvitationAccepted) {
        onInvitationAccepted();
      }
      
      // Dispatch custom event for dashboard refresh
      window.dispatchEvent(new CustomEvent('boardsUpdated'));
      
      // Optionally redirect to the board after a short delay
      setTimeout(() => {
        window.location.href = `/board/${invitation.boardId._id}`;
      }, 1500);
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setAcceptingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation._id);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
    toast.success('Invitation declined');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (!user?.email) {
    return (
      <InvitationsContainer>
        <Card>
          <EmptyState>
            Please login to view your invitations.
          </EmptyState>
        </Card>
      </InvitationsContainer>
    );
  }

  if (loading) {
    return (
      <InvitationsContainer>
        <SectionTitle>
          <Mail size={24} />
          Your Invitations
        </SectionTitle>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <LoadingSpinner />
          </div>
        </Card>
      </InvitationsContainer>
    );
  }

  // Don't render section if no invitations
  if (invitations.length === 0) {
    return null;
  }

  return (
    <InvitationsContainer>
      <SectionTitle>
        <Mail size={24} />
        Your Invitations
        <Badge>{invitations.length}</Badge>
      </SectionTitle>

      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InvitationHeader>
            <BoardInfo>
              <BoardName>{invitation.boardId.name}</BoardName>
              <InviterInfo>
                <User size={16} />
                Invited by {invitation.invitedBy.name}
                <span>({invitation.invitedBy.email})</span>
              </InviterInfo>
            </BoardInfo>
          </InvitationHeader>

          <InvitationMeta>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              Invited {formatTimeAgo(invitation.createdAt)}
            </div>
            <div>
              Expires {formatDate(invitation.expiresAt)}
            </div>
          </InvitationMeta>

          <ActionButtons>
            <DeclineButton
              variant="secondary"
              size="sm"
              onClick={() => handleDeclineInvitation(invitation._id)}
            >
              <X size={16} />
              Decline
            </DeclineButton>
            
            <AcceptButton
              size="sm"
              onClick={() => handleAcceptInvitation(invitation)}
              disabled={acceptingInvites.has(invitation._id)}
            >
              {acceptingInvites.has(invitation._id) ? (
                <LoadingSpinner />
              ) : (
                <Check size={16} />
              )}
              Accept
            </AcceptButton>
          </ActionButtons>
        </InvitationCard>
      ))}
    </InvitationsContainer>
  );
};

export default InvitationsList;
