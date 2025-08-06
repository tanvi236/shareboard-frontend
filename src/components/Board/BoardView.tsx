import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { ArrowLeft, Users, Share2, Settings } from 'lucide-react';
import { useBoard } from '../../hooks/useBoard';
import BoardCanvas from './BoardCanvas';
import BoardToolbar from './BoardToolbar';
import CollaboratorModal from './CollaboratorModal';
import { Button, LoadingSpinner } from '../../styles/GlobalStyles';

const BoardContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
`;

const BoardHeader = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
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

const BoardTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CollaboratorCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #718096;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 8px;
  color: #4a5568;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const BoardView: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { board, blocks, setBlocks, loading, error } = useBoard(boardId);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <BoardContainer>
        <BoardHeader>
          <LeftSection>
            <BackButton onClick={handleBackClick}>
              <ArrowLeft size={20} />
            </BackButton>
            <BoardTitle>Loading...</BoardTitle>
          </LeftSection>
        </BoardHeader>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </BoardContainer>
    );
  }

  if (error || !board) {
    return (
      <BoardContainer>
        <BoardHeader>
          <LeftSection>
            <BackButton onClick={handleBackClick}>
              <ArrowLeft size={20} />
            </BackButton>
            <BoardTitle>Error</BoardTitle>
          </LeftSection>
        </BoardHeader>
        <ErrorContainer>
          <ErrorTitle>Board not found</ErrorTitle>
          <p>{error || 'The board you are looking for does not exist or you do not have access to it.'}</p>
          <Button onClick={handleBackClick} style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </ErrorContainer>
      </BoardContainer>
    );
  }

  const totalCollaborators = board.collaborators.length + 1; // +1 for owner

  return (
    <DndProvider backend={HTML5Backend}>
      <BoardContainer>
        <BoardHeader>
          <LeftSection>
            <BackButton onClick={handleBackClick}>
              <ArrowLeft size={20} />
            </BackButton>
            <BoardTitle>{board.name}</BoardTitle>
          </LeftSection>

          <RightSection>
            <CollaboratorCount>
              <Users size={16} />
              <span>{totalCollaborators} member{totalCollaborators !== 1 ? 's' : ''}</span>
            </CollaboratorCount>

            <Button 
              variant="secondary" 
              onClick={() => setShowCollaboratorModal(true)}
            >
              <Share2 size={16} />
              Share
            </Button>

            <Button variant="secondary">
              <Settings size={16} />
              Settings
            </Button>
          </RightSection>
        </BoardHeader>

        <BoardToolbar />

        <BoardCanvas
          boardId={boardId!}
          blocks={blocks}
          onBlocksChange={setBlocks}
        />

        {showCollaboratorModal && (
          <CollaboratorModal
            board={board}
            onClose={() => setShowCollaboratorModal(false)}
          />
        )}
      </BoardContainer>
    </DndProvider>
  );
};

export default BoardView;
