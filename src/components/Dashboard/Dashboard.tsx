import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Plus, Users, Calendar, Eye, LogOut } from 'lucide-react';
import { Board, CreateBoardData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import CreateBoardModal from './CreateBoardModal';
import InvitationsList from './InvitationsList';
import { Container, Button, Card, LoadingSpinner } from '../../styles/GlobalStyles';
import toast from 'react-hot-toast';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  cursor: pointer;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-weight: 500;
`;

const Content = styled.div`
  padding: 40px 0;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const BoardCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
  }
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const BoardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
`;

const BoardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #718096;
  font-size: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PrivacyBadge = styled.span<{ isPublic: boolean }>`
  background: ${props => props.isPublic ? '#48bb78' : '#ed8936'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const CollaboratorBadge = styled.span`
  background: #48bb78;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #718096;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 8px;
  color: #4a5568;
`;

const EmptyDescription = styled.p`
  margin-bottom: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const SectionDivider = styled.div`
  margin: 48px 0;
`;

const BoardsSection = styled.div`
  margin-top: 24px;
`;

const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
    
    // Listen for board updates (when invitation is accepted)
    const handleBoardsUpdated = () => {
      fetchBoards();
    };
    
    window.addEventListener('boardsUpdated', handleBoardsUpdated);
    
    return () => {
      window.removeEventListener('boardsUpdated', handleBoardsUpdated);
    };
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const boardsData = await apiService.getBoards();
      setBoards(boardsData);
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (data: CreateBoardData) => {
    try {
      const newBoard = await apiService.createBoard(data);
      setBoards(prev => [newBoard, ...prev]);
      setShowCreateModal(false);
      toast.success('Board created successfully!');
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board');
    }
  };

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  const handleInvitationAccepted = () => {
    fetchBoards(); // Refresh the boards list when invitation is accepted
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if user is owner of the board
  const isOwner = (board: Board) => {
    if (typeof board.owner === 'object' && board.owner._id) {
      return board.owner._id === user?._id;
    }
    return board.owner === user?._id;
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Header>
          <HeaderContent>
            <Logo>Live Brainstorm</Logo>
            <UserSection>
              <UserInfo>
                <span>{user?.name}</span>
              </UserInfo>
              <Button variant="secondary" onClick={logout}>
                <LogOut size={16} />
                Logout
              </Button>
            </UserSection>
          </HeaderContent>
        </Header>
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        </Container>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Logo>Live Brainstorm</Logo>
          <UserSection>
            <UserInfo>
              <span>{user?.name}</span>
            </UserInfo>
            <Button variant="secondary" onClick={logout}>
              <LogOut size={16} />
              Logout
            </Button>
          </UserSection>
        </HeaderContent>
      </Header>
      
      <Container>
        <Content>
          {/* Invitations List Section */}
          <InvitationsList onInvitationAccepted={handleInvitationAccepted} />
          
          {/* Section Divider */}
          <SectionDivider />
          
          {/* Boards Section */}
          <BoardsSection>
            <HeaderSection>
              <Title>My Boards</Title>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={16} />
                Create Board
              </Button>
            </HeaderSection>

            {boards.length === 0 ? (
              <EmptyState>
                <EmptyTitle>No boards yet</EmptyTitle>
                <EmptyDescription>
                  Create your first board to start collaborating with your team
                </EmptyDescription>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus size={16} />
                  Create Your First Board
                </Button>
              </EmptyState>
            ) : (
              <BoardsGrid>
                {boards.map((board, index) => (
                  <motion.div
                    key={board._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <BoardCard onClick={() => handleBoardClick(board._id)}>
                      <BoardHeader>
                        <div>
                          <BoardTitle>{board.name}</BoardTitle>
                          <BadgeContainer>
                            <PrivacyBadge isPublic={board.isPublic}>
                              {board.isPublic ? 'Public' : 'Private'}
                            </PrivacyBadge>
                            {!isOwner(board) && (
                              <CollaboratorBadge>
                                Collaborator
                              </CollaboratorBadge>
                            )}
                          </BadgeContainer>
                        </div>
                        <Eye size={16} color="#718096" />
                      </BoardHeader>
                      
                      <BoardMeta>
                        <MetaItem>
                          <Users size={14} />
                          <span>
                            {Array.isArray(board.collaborators) 
                              ? board.collaborators.length + 1 
                              : 1} members
                          </span>
                        </MetaItem>
                        <MetaItem>
                          <Calendar size={14} />
                          <span>{formatDate(board.createdAt)}</span>
                        </MetaItem>
                      </BoardMeta>
                    </BoardCard>
                  </motion.div>
                ))}
              </BoardsGrid>
            )}
          </BoardsSection>
        </Content>
      </Container>

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBoard}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
