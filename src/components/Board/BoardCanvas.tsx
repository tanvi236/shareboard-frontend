import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { Block, CreateBlockData } from '../../types';
import { useBlocks } from '../../hooks/useBlocks';
import DraggableBlock from './DraggableBlock';
import BlockTypeMenu from './BlockTypeMenu';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Fixed: Added shouldForwardProp to prevent isOver prop from going to DOM
const CanvasContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOver',
})<{ isOver: boolean }>`
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

// Fixed: Added shouldForwardProp for position prop
const AddBlockButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'position',
})<{ position: { x: number; y: number } }>`
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

  // Helper function to properly extract the block from API response
  const extractBlockFromResponse = (response: any): Block | null => {
    if (!response) return null;
    
    // Handle different possible response structures
    if (response.data && response.data._id) {
      return response.data;
    } else if (response._id) {
      return response;
    } else if (response.block && response.block._id) {
      return response.block;
    }
    
    return null;
  };

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
            const uploadResult = await api.uploadImage(file);
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

            console.log('Creating image block with data:', blockData);
            const response = await createBlock(blockData);
            console.log('Create block response:', response);
            
            // Extract the block properly from response
            const newBlock = extractBlockFromResponse(response);
            
            if (newBlock && newBlock._id) {
              console.log('Successfully created image block:', newBlock);
              onBlocksChange([...blocks, newBlock]);
              toast.success('Image uploaded successfully!', { id: 'image-upload' });
            } else {
              console.error('Failed to create image block: Invalid response', response);
              toast.error('Failed to create image block', { id: 'image-upload' });
            }
            
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

    try {
      console.log('Creating block with data:', blockData);
      const response = await createBlock(blockData);
      console.log('Create block response:', response);
      
      // Extract the block properly from response
      const newBlock = extractBlockFromResponse(response);
      
      if (newBlock && newBlock._id) {
        console.log('Successfully created block:', newBlock);
        onBlocksChange([...blocks, newBlock]);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} block created!`);
      } else {
        console.error('Failed to create block: Invalid response', response);
        toast.error('Failed to create block');
      }
    } catch (error) {
      console.error('Failed to create block:', error);
      toast.error('Failed to create block');
    }
    
    setShowAddButton(false);
    setShowTypeMenu(false);
  }, [addButtonPosition, boardId, blocks, createBlock, onBlocksChange]);

  const handleMoveBlock = useCallback(async (blockId: string, position: { x: number; y: number }) => {
    try {
      // Optimistic update
      onBlocksChange(blocks.map(block => 
        block._id === blockId ? { ...block, position } : block
      ));

      // Update on server
      await moveBlock(blockId, position);
    } catch (error) {
      console.error('Failed to move block:', error);
      toast.error('Failed to move block');
    }
  }, [blocks, moveBlock, onBlocksChange]);

  // Fixed: Improved handleUpdateBlock with proper response handling
  const handleUpdateBlock = useCallback(async (blockId: string, content: string) => {
    try {
      console.log('Updating block:', blockId, 'with content:', content);
      
      // Optimistic update first - update UI immediately
      const updatedBlocks = blocks.map(block => 
        block._id === blockId ? { ...block, content } : block
      );
      onBlocksChange(updatedBlocks);
      
      // Update on server
      const response = await updateBlock(blockId, { content });
      console.log('Update block response:', response);
      
      // Extract the updated block properly from response
      const updatedBlock = extractBlockFromResponse(response);
      
      if (updatedBlock && updatedBlock._id) {
        console.log('Successfully updated block:', updatedBlock);
        // Update with the server response to ensure consistency
        onBlocksChange(blocks.map(block => 
          block._id === blockId ? updatedBlock : block
        ));
        toast.success('Block updated successfully!');
      } else {
        console.error('Failed to update block: Invalid response', response);
        // If server update failed, revert to original state
        onBlocksChange(blocks);
        toast.error('Failed to update block');
      }
    } catch (error) {
      console.error('Failed to update block:', error);
      // Revert optimistic update on error
      onBlocksChange(blocks);
      toast.error('Failed to update block');
    }
  }, [blocks, updateBlock, onBlocksChange]);

  const handleDeleteBlock = useCallback(async (blockId: string) => {
    try {
      const success = await deleteBlock(blockId);
      if (success) {
        onBlocksChange(blocks.filter(block => block._id !== blockId));
        toast.success('Block deleted');
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
      toast.error('Failed to delete block');
    }
  }, [blocks, deleteBlock, onBlocksChange]);

  const handleCanvasKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowAddButton(false);
      setShowTypeMenu(false);
    }
  }, []);

  // Filter out any blocks without valid _id and generate safe keys
  const validBlocks = blocks.filter(block => block && block._id);
  
  return (
    <CanvasContainer
      ref={(node) => {
        if (node) {
          // @ts-expect-error: canvasRef is readonly, but we need to assign for drag-and-drop
          canvasRef.current = node;
          drop(node);
        }
      }}
      isOver={isOver}
      onClick={handleCanvasClick}
      onKeyDown={handleCanvasKeyDown}
      tabIndex={0}
    >
      {validBlocks.map((block) => (
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
