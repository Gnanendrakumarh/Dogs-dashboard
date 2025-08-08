import { apiRequest } from "./queryClient";
import type { Breed, InsertBreed, UpdateBreed, InsertSubBreed } from "@shared/schema";

export interface BreedsResponse {
  breeds: Breed[];
  total: number;
}

export interface StatsResponse {
  totalBreeds: number;
  totalSubBreeds: number;
}

export const api = {
  // Breeds
  getBreeds: (params?: { search?: string; limit?: number; offset?: number }): Promise<BreedsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    
    const query = searchParams.toString();
    return fetch(`/api/breeds${query ? `?${query}` : ""}`).then(res => res.json());
  },

  getBreed: (id: string): Promise<Breed> =>
    fetch(`/api/breeds/${id}`).then(res => res.json()),

  createBreed: async (breed: InsertBreed): Promise<Breed> => {
    const response = await apiRequest("POST", "/api/breeds", breed);
    return response.json();
  },

  updateBreed: async (id: string, breed: Partial<InsertBreed>): Promise<Breed> => {
    const response = await apiRequest("PUT", `/api/breeds/${id}`, breed);
    return response.json();
  },

  deleteBreed: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/breeds/${id}`);
  },

  // Sub-breeds
  createSubBreed: async (breedId: string, subBreed: Omit<InsertSubBreed, "breedId">): Promise<void> => {
    await apiRequest("POST", `/api/breeds/${breedId}/sub-breeds`, subBreed);
  },

  deleteSubBreed: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/sub-breeds/${id}`);
  },

  // Stats
  getStats: (): Promise<StatsResponse> =>
    fetch("/api/stats").then(res => res.json()),
};
