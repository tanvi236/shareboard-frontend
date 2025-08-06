import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Check, X, Clock, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Button, LoadingSpinner } from '../../styles/GlobalStyles';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const Icon = styled.div<{ type: 'success' | 'error' | 'pending' }>`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#48bb78';
      case 'error': return '#f56565';
      case 'pending': return '#ed8936';
    }
  }};
  color: white;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
  color: #1a202c;
`;

const Description = styled.p`
  color: #718096;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const BoardInfo = styled.div`
  background: #f7fafc;
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0;
  border-left: 4px solid #667eea;
`;

const BoardName = styled.h3`
  color: #2d3748;
  margin-bottom: 8px;
`;

const InviterInfo = styled.p`
  color: #718096;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const InvitationAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await apiService.getInvitationByToken(token!);
      setInvitation(response.data);
      
      // Check if invitation is for current user
      if (isAuthenticated && user?.email !== response.data.email) {
        setStatus('error');
        setMessage('This invitation is not for your account. Please logout and use the correct account.');
      } else if (response.data.status !== 'pending') {
        setStatus('error');
        setMessage('This invitation has already been used or has expired.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('Invitation not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      setAccepting(true);
      
      if (!isAuthenticated) {
        // Redirect to registration with invitation token
        navigate(`/auth?invitation=${token}&email=${invitation.email}`);
        return;
      }

      const response = await apiService.acceptInvitation(token!);
      
      if (response.data.requiresRegistration) {
        navigate(`/auth?invitation=${token}&email=${invitation.email}`);
      } else {
        setStatus('success');
        setMessage('Invitation accepted! You now have access to the board.');
        toast.success('Welcome to the board!');
        
        // Redirect to board after 2 seconds
        setTimeout(() => {
          navigate(`/board/${invitation.boardId._id}`);
        }, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('Failed to accept invitation. Please try again.');
      toast.error('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LoadingSpinner />
          <Title>Loading Invitation...</Title>
        </Card>
      </Container>
    );
  }

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <Check size={40} />;
      case 'error':
        return <X size={40} />;
      default:
        return <Users size={40} />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Invitation Accepted!';
      case 'error':
        return 'Invitation Error';
      default:
        return 'Board Invitation';
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Icon type={status}>
          {getIcon()}
        </Icon>

        <Title>{getTitle()}</Title>

        {message && <Description>{message}</Description>}

        {status === 'pending' && invitation && (
          <>
            <Description>
              You've been invited to collaborate on a board!
            </Description>

            <BoardInfo>
              <BoardName>{invitation.boardId.name}</BoardName>
              <InviterInfo>
                Invited by {invitation.invitedBy.name} ({invitation.invitedBy.email})
              </InviterInfo>
            </BoardInfo>

            {!isAuthenticated && (
              <Description>
                You'll need to create an account or login to accept this invitation.
              </Description>
            )}

            <ButtonGroup>
              <Button
                onClick={handleAcceptInvitation}
                disabled={accepting}
              >
                {accepting && <LoadingSpinner />}
                Accept Invitation
              </Button>
              <Button
                variant="secondary"
                onClick={handleDecline}
              >
                Decline
              </Button>
            </ButtonGroup>
          </>
        )}

        {status === 'success' && (
          <Description>
            Redirecting to the board...
          </Description>
        )}
      </Card>
    </Container>
  );
};

export default InvitationAccept;
