import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, Mail, UserPlus, Crown, Users } from 'lucide-react';
import { Board } from '../../types';
import apiService from '../../services/api';
import { Button, Input, FormGroup, Label, ErrorText, LoadingSpinner } from '../../styles/GlobalStyles';
import toast from 'react-hot-toast';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  
  &:hover {
    background: #f7fafc;
    color: #4a5568;
  }
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Form = styled.form`
  display: flex;
  gap: 12px;
  align-items: end;
`;

const CollaboratorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CollaboratorItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  gap: 12px;
`;

const CollaboratorInfo = styled.div`
  flex: 1;
`;

const CollaboratorName = styled.div`
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CollaboratorEmail = styled.div`
  font-size: 14px;
  color: #718096;
`;

const RoleBadge = styled.span<{ isOwner: boolean }>`
  background: ${props => props.isOwner ? '#667eea' : '#48bb78'};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const ShareLink = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  color: #4a5568;
  word-break: break-all;
`;

interface CollaboratorModalProps {
  board: Board;
  onClose: () => void;
}

interface InviteForm {
  email: string;
}

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({ board, onClose }) => {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm<InviteForm>();

  const handleInvite = async (data: InviteForm) => {
    try {
      setLoading(true);
      await apiService.sendInvitation(board._id, data.email);
      toast.success(`Invitation sent to ${data.email}`);
      reset();
      // Optionally refresh board data to show pending invitations
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('email', { message: error.response.data.message });
      } else {
        toast.error('Failed to send invitation');
      }
    } finally {
      setLoading(false);
    }
  };

  const boardUrl = `${window.location.origin}/board/${board._id}`;

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>Share Board</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <Section>
          <SectionTitle>
            <UserPlus size={16} />
            Invite Collaborators
          </SectionTitle>
          
          <Form onSubmit={handleSubmit(handleInvite)}>
            <FormGroup style={{ flex: 1, marginBottom: 0 }}>
              <Input
                type="email"
                placeholder="Enter email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
            </FormGroup>
            
            <Button type="submit" disabled={loading}>
              {loading && <LoadingSpinner />}
              <Mail size={16} />
              Invite
            </Button>
          </Form>
        </Section>

        <Section>
          <SectionTitle>
            <Users size={16} />
            Current Members ({board.collaborators.length + 1})
          </SectionTitle>
          
          <CollaboratorList>
            <CollaboratorItem>
              <CollaboratorInfo>
                <CollaboratorName>
                  <Crown size={16} color="#667eea" />
                  {typeof board.owner === 'object' && 'name' in board.owner ? board.owner.name : board.owner}
                </CollaboratorName>
                <CollaboratorEmail>
                  {typeof board.owner === 'object' && 'email' in board.owner ? board.owner.email : ''}
                </CollaboratorEmail>
              </CollaboratorInfo>
              <RoleBadge isOwner={true}>Owner</RoleBadge>
            </CollaboratorItem>
            
            {board.collaborators.map(collaborator => (
              <CollaboratorItem key={collaborator.id}>
                <CollaboratorInfo>
                  <CollaboratorName>{collaborator.name}</CollaboratorName>
                  <CollaboratorEmail>{collaborator.email}</CollaboratorEmail>
                </CollaboratorInfo>
                <RoleBadge isOwner={false}>Editor</RoleBadge>
              </CollaboratorItem>
            ))}
          </CollaboratorList>
        </Section>

        {board.isPublic && (
          <Section>
            <SectionTitle>Public Link</SectionTitle>
            <ShareLink>{boardUrl}</ShareLink>
          </Section>
        )}
      </Modal>
    </Overlay>
  );
};

export default CollaboratorModal;
