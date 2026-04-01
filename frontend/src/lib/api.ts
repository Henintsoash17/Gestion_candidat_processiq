import axios from "axios";
import {
  Candidate,
  CreateCandidate,
  UpdateCandidate,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
} from "./types";

export function extractAuthToken(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const d = body as Record<string, unknown>;
  if (typeof d.token === "string") return d.token;
  if (d.data && typeof d.data === "object") {
    const inner = (d.data as Record<string, unknown>).token;
    if (typeof inner === "string") return inner;
  }
  return undefined;
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: RegisterRequest) => api.post<RegisterResponse>("/auth/register", data),
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),
};

export const candidatesAPI = {
  getAll: (page = 1, limit = 10, filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    return api.get<{ candidates: Candidate[]; total: number }>(`/candidates?${params}`);
  },
  getById: (id: string) => api.get<Candidate>(`/candidates/${id}`),
  create: (data: CreateCandidate) => api.post<Candidate>("/candidates", data),
  update: (id: string, data: UpdateCandidate) => api.put<Candidate>(`/candidates/${id}`, data),
  delete: (id: string) => api.delete(`/candidates/${id}`),
  validate: (id: string) => api.post(`/candidates/${id}/validate`),
  reject: (id: string) => api.post<Candidate>(`/candidates/${id}/reject`),
};
