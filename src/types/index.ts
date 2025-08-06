export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  name: string;
  owner: User | string; // Can be populated User object or just string ID
  collaborators: User[];
  blocks: Block[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  _id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  position: { x: number; y: number };
  boardId: string;
  createdBy: User;
  lastEdited: Date;
  width?: number;
  height?: number;
}

export interface CreateBlockData {
  type: 'text' | 'image' | 'link';
  content: string;
  position: { x: number; y: number };
  boardId: string;
}

export interface UpdateBlockData {
  content?: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface CreateBoardData {
  name: string;
  isPublic?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Invitation {
  _id: string;
  boardId: Board;
  invitedBy: User;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  invitedUser?: User;
}

export interface Block {
  _id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  position: { x: number; y: number };
  boardId: string;
  createdBy: User;
  lastEdited: Date;
  width?: number;
  height?: number;
}

export interface CreateBlockData {
  type: 'text' | 'image' | 'link';
  content: string;
  position: { x: number; y: number };
  boardId: string;
  width?: number;
  height?: number;
}

export interface UpdateBlockData {
  content?: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
}
