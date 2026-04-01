export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "pending" | "validated" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidate {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCandidate {
  name?: string;
  email?: string;
  phone?: string;
  status?: "pending" | "validated" | "rejected";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
}

export interface AuthResponse {
  token: string;
}
