import { useState } from 'react';
import { Block, CreateBlockData, UpdateBlockData } from '../types';
import apiService from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

export const useBlocks = () => {
  const [loading, setLoading] = useState(false);

  const createBlock = async (data: CreateBlockData): Promise<Block | null> => {
    try {
      setLoading(true);
      const newBlock = await apiService.createBlock(data);
      socketService.emitBlockCreate(newBlock);
      toast.success('Block created!');
      return newBlock;
    } catch (error: any) {
      toast.error('Failed to create block');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBlock = async (blockId: string, data: UpdateBlockData): Promise<Block | null> => {
    try {
      const updatedBlock = await apiService.updateBlock(blockId, data);
      socketService.emitBlockUpdate(updatedBlock);
      return updatedBlock;
    } catch (error: any) {
      toast.error('Failed to update block');
      return null;
    }
  };

  const deleteBlock = async (blockId: string): Promise<boolean> => {
    try {
      await apiService.deleteBlock(blockId);
      socketService.emitBlockDelete(blockId);
      toast.success('Block deleted!');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete block');
      return false;
    }
  };

  const moveBlock = async (blockId: string, position: { x: number; y: number }): Promise<boolean> => {
    try {
      await apiService.updateBlock(blockId, { position });
      socketService.emitBlockMove(blockId, position);
      return true;
    } catch (error: any) {
      toast.error('Failed to move block');
      return false;
    }
  };

  return {
    createBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    loading,
  };
};
