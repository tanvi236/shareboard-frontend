import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CreateBoardData } from '../../types';
import { Button, Input, FormGroup, Label, ErrorText, LoadingSpinner } from '../../styles/GlobalStyles';

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #667eea;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

interface CreateBoardModalProps {
  onClose: () => void;
  onSubmit: (data: CreateBoardData) => Promise<void>;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateBoardData>();

  const handleFormSubmit = async (data: CreateBoardData) => {
    try {
      setLoading(true);
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

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
          <ModalTitle>Create New Board</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormGroup>
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter board name"
              {...register('name', {
                required: 'Board name is required',
                minLength: {
                  value: 1,
                  message: 'Board name cannot be empty'
                },
                maxLength: {
                  value: 100,
                  message: 'Board name must be less than 100 characters'
                }
              })}
            />
            {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <CheckboxGroup>
              <Checkbox
                id="isPublic"
                type="checkbox"
                {...register('isPublic')}
              />
              <CheckboxLabel htmlFor="isPublic">
                Make this board public (anyone can view)
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <LoadingSpinner />}
              Create Board
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default CreateBoardModal;
