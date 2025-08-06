import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Card, Container } from '../../styles/GlobalStyles';

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a202c;
`;

const Subtitle = styled.p`
  color: #718096;
  margin-bottom: 32px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 32px;
  background: #f7fafc;
  border-radius: 8px;
  padding: 4px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#667eea' : '#718096'};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};
`;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthContainer>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AuthCard>
            <Title>Live Brainstorm</Title>
            <Subtitle>Collaborate visually in real-time</Subtitle>
            
            <TabContainer>
              <Tab 
                active={isLogin} 
                onClick={() => setIsLogin(true)}
              >
                Login
              </Tab>
              <Tab 
                active={!isLogin} 
                onClick={() => setIsLogin(false)}
              >
                Register
              </Tab>
            </TabContainer>

            {isLogin ? <LoginForm /> : <RegisterForm />}
          </AuthCard>
        </motion.div>
      </Container>
    </AuthContainer>
  );
};

export default AuthPage;
