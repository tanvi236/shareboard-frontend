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

  // Boards API Methods
  async getBoards(): Promise<Board[]> {
    try {
      const response = await this.api.get<Board[]>('/boards');
      console.log(`Fetched ${response.data.length} boards`);
      return response.data;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  }

  async getBoard(id: string): Promise<Board> {
    try {
      const response = await this.api.get<Board>(`/boards/${id}`);
      console.log('Fetched board:', response.data.name);
      return response.data;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }

  async createBoard(data: CreateBoardData): Promise<Board> {
    try {
      const response = await this.api.post<Board>('/boards', data);
      console.log('Created board:', response.data.name);
      return response.data;
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
  async createBlock(data: CreateBlockData): Promise<Block> {
    try {
      console.log('Creating block:', data);
      const response = await this.api.post<Block>('/blocks', data);
      console.log('Created block:', response.data._id);
      return response.data;
    } catch (error) {
      console.error('Error creating block:', error);
      throw error;
    }
  }

  async updateBlock(blockId: string, data: UpdateBlockData): Promise<Block> {
    try {
      console.log('Updating block:', blockId, data);
      const response = await this.api.patch<Block>(`/blocks/${blockId}`, data);
      console.log('Updated block:', response.data._id);
      return response.data;
    } catch (error) {
      console.error('Error updating block:', error);
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
  // Add these methods to your ApiService class

  // Invitations API
  async sendInvitation(boardId: string, email: string): Promise<any> {
    const response = await this.api.post('/invitations/send', { boardId, email });
    return response.data;
  }

  async getInvitationByToken(token: string): Promise<any> {
    const response = await this.api.get(`/invitations/token/${token}`);
    return response.data;
  }

  async acceptInvitation(token: string): Promise<any> {
    const response = await this.api.post(`/invitations/accept/${token}`);
    return response.data;
  }

  async getUserInvitations(email: string): Promise<any> {
    const response = await this.api.get(`/invitations/user/${email}`);
    return response.data;
  }

  async getBoardInvitations(boardId: string): Promise<any> {
    const response = await this.api.get(`/invitations/board/${boardId}`);
    return response.data;
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
