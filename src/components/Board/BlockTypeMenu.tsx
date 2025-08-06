import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Type, Image, Link } from 'lucide-react';

const MenuContainer = styled(motion.div)<{ position: { x: number; y: number } }>`
  position: absolute;
  left: ${props => props.position.x - 60}px;
  top: ${props => props.position.y + 50}px;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
  z-index: 20;
`;

const TypeButton = styled.button<{ color: string }>`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: ${props => props.color};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

interface BlockTypeMenuProps {
  position: { x: number; y: number };
  onSelect: (type: 'text' | 'image' | 'link') => void;
  onClose: () => void;
}

const BlockTypeMenu: React.FC<BlockTypeMenuProps> = ({ position, onSelect, onClose }) => {
  const handleSelect = (type: 'text' | 'image' | 'link') => {
    onSelect(type);
    onClose();
  };

  return (
    <MenuContainer
      position={position}
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <TypeButton 
        color="#667eea" 
        onClick={() => handleSelect('text')}
        title="Text Block"
      >
        <Type size={16} />
      </TypeButton>
      
      <TypeButton 
        color="#48bb78" 
        onClick={() => handleSelect('image')}
        title="Image Block"
      >
        <Image size={16} />
      </TypeButton>
      
      <TypeButton 
        color="#ed8936" 
        onClick={() => handleSelect('link')}
        title="Link Block"
      >
        <Link size={16} />
      </TypeButton>
    </MenuContainer>
  );
};

export default BlockTypeMenu;
