import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { Block, CreateBlockData } from '../../types';
import { useBlocks } from '../../hooks/useBlocks';
import apiService from '../../services/api';
import DraggableBlock from './DraggableBlock';
import BlockTypeMenu from './BlockTypeMenu';
import toast from 'react-hot-toast';

const CanvasContainer = styled.div<{ isOver: boolean }>`
  position: relative;
  flex: 1;
  background: 
    radial-gradient(circle at 1px 1px, rgba(0,0,0,.15) 1px, transparent 0);
  background-size: 20px 20px;
  overflow: hidden;
  cursor: crosshair;
  transition: background-color 0.2s ease;
  background-color: ${props => props.isOver ? 'rgba(102, 126, 234, 0.05)' : 'transparent'};
`;

const AddBlockButton = styled.button<{ position: { x: number; y: number } }>`
  position: absolute;
  left: ${props => props.position.x - 20}px;
  top: ${props => props.position.y - 20}px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #667eea;
  color: white;
  font-size: 20px;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #5a67d8;
    transform: scale(1.1);
  }
`;

interface BoardCanvasProps {
  boardId: string;
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

const BoardCanvas: React.FC<BoardCanvasProps> = ({ 
  boardId, 
  blocks, 
  onBlocksChange 
}) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [addButtonPosition, setAddButtonPosition] = useState({ x: 0, y: 0 });
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { createBlock, updateBlock, deleteBlock, moveBlock } = useBlocks();

  const [{ isOver }, drop] = useDrop({
    accept: 'block',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;
        return { x, y };
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setAddButtonPosition({ x, y });
      setShowAddButton(true);
      setShowTypeMenu(false);
    }
  }, []);

  const handleAddButtonClick = useCallback(() => {
    setShowTypeMenu(!showTypeMenu);
  }, [showTypeMenu]);

  const handleCreateBlock = useCallback(async (type: 'text' | 'image' | 'link') => {
    let content = '';
    
    // Handle image upload separately
    if (type === 'image') {
      // Create file input for image upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            // Show loading state
            toast.loading('Uploading image...', { id: 'image-upload' });
            
            // Upload image first
            const uploadResult = await apiService.uploadImage(file);
            content = uploadResult.url;
            
            // Create block with uploaded image URL
            const blockData: CreateBlockData = {
              type,
              content,
              position: { 
                x: Math.max(0, addButtonPosition.x - 100), 
                y: Math.max(0, addButtonPosition.y - 75) 
              },
              boardId
            };

            const newBlock = await createBlock(blockData);
            if (newBlock) {
              onBlocksChange([...blocks, newBlock]);
            }
            
            toast.success('Image uploaded successfully!', { id: 'image-upload' });
          } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image', { id: 'image-upload' });
          }
        }
        
        setShowAddButton(false);
        setShowTypeMenu(false);
      };
      
      input.click();
      return; // Exit early for image upload
    }
    
    // Handle text and link blocks
    const defaultContent = {
      text: 'Double-click to edit',
      link: 'https://example.com'
    };

    content = defaultContent[type as 'text' | 'link'];

    const blockData: CreateBlockData = {
      type,
      content,
      position: { 
        x: Math.max(0, addButtonPosition.x - 100), 
        y: Math.max(0, addButtonPosition.y - 75) 
      },
      boardId
    };

    const newBlock = await createBlock(blockData);
    if (newBlock) {
      onBlocksChange([...blocks, newBlock]);
    }
    
    setShowAddButton(false);
    setShowTypeMenu(false);
  }, [addButtonPosition, boardId, blocks, createBlock, onBlocksChange]);

  const handleMoveBlock = useCallback(async (blockId: string, position: { x: number; y: number }) => {
    // Optimistic update
    onBlocksChange(blocks.map(block => 
      block._id === blockId ? { ...block, position } : block
    ));

    // Update on server
    await moveBlock(blockId, position);
  }, [blocks, moveBlock, onBlocksChange]);

  const handleUpdateBlock = useCallback(async (blockId: string, content: string) => {
    const updatedBlock = await updateBlock(blockId, { content });
    if (updatedBlock) {
      onBlocksChange(blocks.map(block => 
        block._id === blockId ? updatedBlock : block
      ));
    }
  }, [blocks, updateBlock, onBlocksChange]);

  const handleDeleteBlock = useCallback(async (blockId: string) => {
    const success = await deleteBlock(blockId);
    if (success) {
      onBlocksChange(blocks.filter(block => block._id !== blockId));
    }
  }, [blocks, deleteBlock, onBlocksChange]);

  const handleCanvasKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowAddButton(false);
      setShowTypeMenu(false);
    }
  }, []);

  return (
    <CanvasContainer
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      isOver={isOver}
      onClick={handleCanvasClick}
      onKeyDown={handleCanvasKeyDown}
      tabIndex={0}
    >
      {blocks.map(block => (
        <DraggableBlock
          key={block._id}
          block={block}
          onMove={handleMoveBlock}
          onUpdate={handleUpdateBlock}
          onDelete={handleDeleteBlock}
        />
      ))}

      {showAddButton && (
        <AddBlockButton
          position={addButtonPosition}
          onClick={handleAddButtonClick}
        >
          +
        </AddBlockButton>
      )}

      {showTypeMenu && (
        <BlockTypeMenu
          position={addButtonPosition}
          onSelect={handleCreateBlock}
          onClose={() => {
            setShowTypeMenu(false);
            setShowAddButton(false);
          }}
        />
      )}
    </CanvasContainer>
  );
};

export default BoardCanvas;
