import { useState, useEffect, useCallback } from 'react';
import { Board, Block } from '../types';
import apiService from '../services/api';
import socketService from '../services/socket';

export const useBoard = (boardId: string | undefined) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;

    try {
      setLoading(true);
      const boardData = await apiService.getBoard(boardId);
      setBoard(boardData);
      setBlocks(boardData.blocks || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    if (!boardId) return;

    // Join board room
    socketService.joinBoard(boardId);

    // Set up socket listeners
    const handleBlockCreate = (newBlock: Block) => {
      setBlocks(prev => [...prev, newBlock]);
    };

    const handleBlockUpdate = (updatedBlock: Block) => {
      setBlocks(prev =>
        prev.map(block =>
          block._id === updatedBlock._id ? updatedBlock : block
        )
      );
    };

    const handleBlockDelete = ({ blockId }: { blockId: string }) => {
      setBlocks(prev => prev.filter(block => block._id !== blockId));
    };

    const handleBlockMove = ({ blockId, position }: { blockId: string; position: { x: number; y: number } }) => {
      setBlocks(prev =>
        prev.map(block =>
          block._id === blockId ? { ...block, position } : block
        )
      );
    };

    socketService.onBlockCreate(handleBlockCreate);
    socketService.onBlockUpdate(handleBlockUpdate);
    socketService.onBlockDelete(handleBlockDelete);
    socketService.onBlockMove(handleBlockMove);

    return () => {
      socketService.removeAllListeners();
    };
  }, [boardId]);

  return {
    board,
    blocks,
    setBlocks,
    loading,
    error,
    refetch: fetchBoard,
  };
};
