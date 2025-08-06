export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Board {
  _id: string;
  name: string;
  owner: User;
  collaborators: User[];
  blocks?: Block[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  _id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  position: {
    x: number;
    y: number;
  };
  boardId: string;
  lastEdited: Date;
  createdBy: User;
  width?: number;
  height?: number;
}

export interface CreateBlockData {
  type: 'text' | 'image' | 'link';
  content: string;
  position: {
    x: number;
    y: number;
  };
  boardId: string;
}

export interface UpdateBlockData {
  content?: string;
  position?: {
    x: number;
    y: number;
  };
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
