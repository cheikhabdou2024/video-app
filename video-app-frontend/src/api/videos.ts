// src/api/videos.ts
import apiClient from './client';
import { Video, CreateVideoData } from '../types/video.types';

export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await apiClient.get<Video[]>('/videos');
    return response.data;
  } catch (error) {
    if (error instanceof Error && (error as any).response?.data) {
      throw (error as any).response.data;
    }
    throw { error: 'Failed to fetch videos' };
  }
};


export const createVideo = async (data: CreateVideoData): Promise<Video> => {
  try {
    const response = await apiClient.post<Video>('/videos', data);
    return response.data;
  } catch (error) {
    if (error instanceof Error && (error as any).response?.data) {
      throw (error as any).response.data;
    }
    throw { error: 'Failed to create video' };
  }
};