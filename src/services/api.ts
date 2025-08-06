import axios, { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Board, 
  Block, 
  CreateBlockData, 
  UpdateBlockData, 
  CreateBoardData, 
  LoginData, 
  RegisterData, 
  AuthResponse 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005/api',
      timeout: 10000,
    });

    // Request interceptor for auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
          toast.error('Session expired. Please login again.');
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An error occurred. Please try again.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth API Methods
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', data);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', data);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Boards API Methods - UPDATED VERSION (handles both owned and collaborated boards)
  async getBoards(): Promise<Board[]> {
    try {
      const response = await this.api.get('/boards');
      
      // Handle multiple possible response structures
      let boards = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        boards = response.data.data;
      } else if (Array.isArray(response.data)) {
        boards = response.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        boards = [];
      }
      
      console.log(`Fetched ${boards.length} boards`);
      return boards;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  }

  // Updated to fetch board with blocks
  async getBoard(id: string, includeBlocks: boolean = true): Promise<Board> {
    try {
      const queryParam = includeBlocks ? '?includeBlocks=true' : '';
      const response = await this.api.get(`/boards/${id}${queryParam}`);
      const board = response.data.data || response.data;
      console.log('Fetched board with blocks:', board.name, 'Blocks count:', board.blocks?.length || 0);
      return board;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }

  // Specific method to get board with all blocks
  async getBoardWithBlocks(id: string): Promise<Board> {
    try {
      const response = await this.api.get(`/boards/${id}/blocks`);
      const board = response.data.data || response.data;
      console.log('Fetched board with blocks:', board.name, 'Blocks count:', board.blocks?.length || 0);
      return board;
    } catch (error) {
      console.error('Error fetching board with blocks:', error);
      throw error;
    }
  }

  async createBoard(data: CreateBoardData): Promise<Board> {
    try {
      const response = await this.api.post('/boards', data);
      const board = response.data.data || response.data;
      console.log('Created board:', board.name);
      return board;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  }

  async addCollaborator(boardId: string, email: string): Promise<void> {
    try {
      await this.api.post(`/boards/${boardId}/collaborators`, { email });
      console.log('Added collaborator:', email);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  // Blocks API Methods
  // Update just these methods in your existing api.ts file

async updateBlock(blockId: string, data: UpdateBlockData): Promise<Block> {
  try {
    console.log('Frontend sending update data:', JSON.stringify(data, null, 2));
    
    // Clean the data before sending to ensure no unwanted properties
    const cleanData: any = {};
    
    if (data.content !== undefined) {
      cleanData.content = data.content;
    }
    
    if (data.position) {
      cleanData.position = {
        x: Number(data.position.x) || 0,
        y: Number(data.position.y) || 0
        // dropEffect is intentionally omitted
      };
    }
    
    if (data.width !== undefined) {
      cleanData.width = Number(data.width);
    }
    
    if (data.height !== undefined) {
      cleanData.height = Number(data.height);
    }
    
    console.log('Sending cleaned data to backend:', cleanData);
    
    const response = await this.api.patch<Block>(`/blocks/${blockId}`, cleanData);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Frontend update error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

async createBlock(data: CreateBlockData): Promise<Block> {
  try {
    console.log('Creating block with data:', data);
    
    // Clean the data before sending
    const cleanData = {
      type: data.type,
      content: data.content,
      position: {
        x: Number(data.position.x) || 0,
        y: Number(data.position.y) || 0
      },
      boardId: data.boardId,
      ...(data.width && { width: Number(data.width) }),
      ...(data.height && { height: Number(data.height) })
    };
    
    const response = await this.api.post<Block>('/blocks', cleanData);
    console.log('Created block:', response.data._id);
    return response.data;
  } catch (error) {
    console.error('Error creating block:', error);
    throw error;
  }
}


  async deleteBlock(blockId: string): Promise<void> {
    try {
      console.log('Deleting block:', blockId);
      await this.api.delete(`/blocks/${blockId}`);
      console.log('Deleted block successfully');
    } catch (error) {
      console.error('Error deleting block:', error);
      throw error;
    }
  }

  // Get blocks for a specific board
  async getBoardBlocks(boardId: string): Promise<Block[]> {
    try {
      const response = await this.api.get(`/blocks?boardId=${boardId}`);
      const blocks = response.data.data || response.data || [];
      console.log(`Fetched ${blocks.length} blocks for board ${boardId}`);
      return blocks;
    } catch (error) {
      console.error('Error fetching board blocks:', error);
      throw error;
    }
  }

  // Invitations API Methods - UPDATED TO USE POST WITH BODY
  async sendInvitation(boardId: string, email: string): Promise<any> {
    try {
      const response = await this.api.post('/invitations/send', { boardId, email });
      console.log('Invitation sent successfully');
      return response.data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  async getUserInvitations(email: string): Promise<any[]> {
    try {
      // Changed from GET with URL parameter to POST with body
      const response = await this.api.post('/invitations/user/invitations', { email });
      
      // Handle multiple possible response structures
      let invitations = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        invitations = response.data.data;
      } else if (Array.isArray(response.data)) {
        invitations = response.data;
      } else {
        console.warn('Unexpected invitations response structure:', response.data);
        invitations = [];
      }
      
      console.log(`Fetched ${invitations.length} invitations for ${email}`);
      return invitations;
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      
      // If 404, return empty array instead of throwing
      if (error.response?.status === 404) {
        console.log('No invitations endpoint found, returning empty array');
        return [];
      }
      
      throw error;
    }
  }

  async getInvitationByToken(token: string): Promise<any> {
    try {
      const response = await this.api.get(`/invitations/token/${token}`);
      console.log('Fetched invitation by token');
      return response.data;
    } catch (error) {
      console.error('Error fetching invitation by token:', error);
      throw error;
    }
  }

  async acceptInvitation(token: string): Promise<any> {
    try {
      const response = await this.api.post(`/invitations/accept/${token}`);
      console.log('Invitation accepted successfully');
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  async getBoardInvitations(boardId: string): Promise<any> {
    try {
      const response = await this.api.get(`/invitations/board/${boardId}`);
      console.log(`Fetched invitations for board ${boardId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching board invitations:', error);
      throw error;
    }
  }

  // Image Upload API Method
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    try {
      console.log('Uploading image:', file.name, 'Size:', file.size, 'bytes');
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await this.api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file upload
      });

      console.log('Image uploaded successfully:', response.data.data.url);
      return response.data.data;
    } catch (error) {
      console.error('Image upload error:', error);
      if (error.response?.status === 413) {
        throw new Error('File size too large');
      } else if (error.response?.status === 422) {
        throw new Error('Invalid file type');
      }
      throw error;
    }
  }

  // Health Check Method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.api.get('/health');
      console.log('Health check successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Utility Methods
  getApiUrl(): string {
    return this.api.defaults.baseURL || 'http://localhost:5005/api';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Export singleton instance
export default new ApiService();
