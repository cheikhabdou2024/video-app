// src/types/video.types.ts
export interface Video {
    id: number;
    title: string;
    description: string;
    url: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    author?: {
      id: number;
      username: string;
    };
  }
  
  export interface VideoState {
    videos: Video[];
    currentVideo: Video | null;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface CreateVideoData {
    title: string;
    description: string;
    url: string;
  }