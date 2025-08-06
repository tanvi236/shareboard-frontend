import React, { useState, useRef, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Trash2, Edit3, ExternalLink } from 'lucide-react';
import { Block } from '../../types';

// Fixed: Added shouldForwardProp to prevent DOM warnings
const BlockContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isDragging', 'type', 'isEditing'].includes(prop),
})<{ 
  isDragging: boolean; 
  type: string;
  isEditing: boolean;
}>`
  position: absolute;
  min-width: 200px;
  min-height: 150px;
  background: ${props => {
    switch (props.type) {
      case 'text': return '#ffffff';
      case 'image': return '#f7fafc';
      case 'link': return '#ebf8ff';
      default: return '#ffffff';
    }
  }};
  border: 2px solid ${props => {
    if (props.isEditing) return '#667eea';
    switch (props.type) {
      case 'text': return '#e2e8f0';
      case 'image': return '#bee3f8';
      case 'link': return '#90cdf4';
      default: return '#e2e8f0';
    }
  }};
  border-radius: 12px;
  padding: 16px;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  opacity: ${props => props.isDragging ? 0.7 : 1};
  box-shadow: ${props => props.isDragging ? 
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 
    '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };
  transition: box-shadow 0.2s ease;
  user-select: none;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const BlockActions = styled.div`
  position: absolute;
  top: -12px;
  right: -12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${BlockContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'danger' }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: ${props => props.variant === 'danger' ? '#f56565' : '#667eea'};
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.variant === 'danger' ? '#e53e3e' : '#5a67d8'};
  }
`;

const BlockContent = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isEditing',
})<{ isEditing: boolean }>`
  width: 100%;
  min-height: 100px;
  font-size: 14px;
  line-height: 1.6;
  color: #2d3748;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  overflow: hidden;
  display: ${props => props.isEditing ? 'none' : 'block'};
  word-wrap: break-word;
`;

const EditableTextarea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== 'isEditing',
})<{ isEditing: boolean }>`
  width: 100%;
  min-height: 100px;
  font-size: 14px;
  line-height: 1.6;
  color: #2d3748;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  display: ${props => props.isEditing ? 'block' : 'none'};
  font-family: inherit;
`;

const BlockImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
`;

const BlockLink = styled.a`
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(49, 130, 206, 0.1);
    text-decoration: underline;
  }
`;

const TypeBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type: string }>`
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.type) {
      case 'text': return '#e2e8f0';
      case 'image': return '#bee3f8';
      case 'link': return '#90cdf4';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'text': return '#4a5568';
      case 'image': return '#2b6cb0';
      case 'link': return '#2c5282';
      default: return '#4a5568';
    }
  }};
`;

interface DraggableBlockProps {
  block: Block;
  onMove: (blockId: string, position: { x: number; y: number }) => void;
  onUpdate: (blockId: string, content: string) => void;
  onDelete: (blockId: string) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  block, 
  onMove, 
  onUpdate, 
  onDelete 
}) => {
  // Early return if block is undefined
  if (!block) {
    console.warn('DraggableBlock: Block is undefined');
    return null;
  }

  // Safe access to position with default values
  const safePosition = {
    x: block.position?.x ?? 0,
    y: block.position?.y ?? 0
  };

  // Safe access to dimensions with default values
  const safeDimensions = {
    width: block.width ?? 200,
    height: block.height ?? 150
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(block.content || '');
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { id: block._id, type: 'block' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult() as { x: number; y: number } | null;
      if (dropResult) {
        onMove(block._id, dropResult);
      }
    },
  });

  drag(ref);

  const handleDoubleClick = useCallback(() => {
    if (block.type === 'text' || block.type === 'link') {
      setIsEditing(true);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    }
  }, [block.type]);

  const handleEditBlur = useCallback(() => {
    setIsEditing(false);
    if (editContent !== block.content) {
      onUpdate(block._id, editContent);
    }
  }, [editContent, block.content, block._id, onUpdate]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditBlur();
    } else if (e.key === 'Escape') {
      setEditContent(block.content || '');
      setIsEditing(false);
    }
  }, [block.content, handleEditBlur]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  }, []);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case 'image':
        return (
          <BlockImage 
            src={block.content || ''} 
            alt="Block content"
            onError={(e) => {
              // Fixed: Using placehold.co instead of via.placeholder.com
              e.currentTarget.src = 'https://placehold.co/200x150/e2e8f0/a0aec0?text=Invalid+Image';
            }}
          />
        );
      case 'link':
        return (
          <BlockLink 
            href={isValidUrl(block.content || '') ? block.content : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => !isValidUrl(block.content || '') && e.preventDefault()}
          >
            <ExternalLink size={16} />
            {block.content || 'Empty link'}
          </BlockLink>
        );
      default:
        return block.content || 'Empty block';
    }
  };

  return (
    <BlockContainer
      ref={ref}
      isDragging={isDragging}
      type={block.type}
      isEditing={isEditing}
      style={{
        left: safePosition.x,
        top: safePosition.y,
        width: safeDimensions.width,
        height: safeDimensions.height
      }}
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <TypeBadge type={block.type}>{block.type}</TypeBadge>
      
      <BlockActions>
        {(block.type === 'text' || block.type === 'link') && (
          <ActionButton onClick={handleEdit} title="Edit">
            <Edit3 size={12} />
          </ActionButton>
        )}
        <ActionButton 
          variant="danger" 
          onClick={() => onDelete(block._id)}
          title="Delete"
        >
          <Trash2 size={12} />
        </ActionButton>
      </BlockActions>

      <BlockContent isEditing={isEditing}>
        {renderContent()}
      </BlockContent>

      <EditableTextarea
        ref={textareaRef}
        isEditing={isEditing}
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        onBlur={handleEditBlur}
        onKeyDown={handleEditKeyDown}
        placeholder={`Enter ${block.type} content...`}
      />
    </BlockContainer>
  );
};

export default DraggableBlock;
