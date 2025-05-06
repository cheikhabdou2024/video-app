// src/context/VideoContext.tsx
import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { getVideos, createVideo } from '../api/videos';
import { VideoState, Video, CreateVideoData } from '../types/video.types';
import { AuthContext } from './AuthContext';

// Define the shape of the context
interface VideoContextProps {
  state: VideoState;
  fetchVideos: () => Promise<void>;
  addVideo: (data: CreateVideoData) => Promise<void>;
  setCurrentVideo: (video: Video) => void;
}

// Initial state
const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  isLoading: false,
  error: null,
};

// Create the context
export const VideoContext = createContext<VideoContextProps>({
  state: initialState,
  fetchVideos: async () => {},
  addVideo: async () => {},
  setCurrentVideo: () => {},
});

// Actions
type VideoAction =
  | { type: 'FETCH_VIDEOS_REQUEST' }
  | { type: 'FETCH_VIDEOS_SUCCESS'; payload: Video[] }
  | { type: 'FETCH_VIDEOS_FAILURE'; payload: string }
  | { type: 'ADD_VIDEO_REQUEST' }
  | { type: 'ADD_VIDEO_SUCCESS'; payload: Video }
  | { type: 'ADD_VIDEO_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_VIDEO'; payload: Video };

// Reducer
const videoReducer = (state: VideoState, action: VideoAction): VideoState => {
  switch (action.type) {
    case 'FETCH_VIDEOS_REQUEST':
    case 'ADD_VIDEO_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_VIDEOS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        videos: action.payload,
        error: null,
      };
    case 'ADD_VIDEO_SUCCESS':
      return {
        ...state,
        isLoading: false,
        videos: [action.payload, ...state.videos],
        error: null,
      };
    case 'FETCH_VIDEOS_FAILURE':
    case 'ADD_VIDEO_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_CURRENT_VIDEO':
      return {
        ...state,
        currentVideo: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);
  const { state: authState } = useContext(AuthContext);

  // Fetch videos whenever auth state changes (user logs in)
  useEffect(() => {
    if (authState.user) {
      handleFetchVideos();
    }
  }, [authState.user]);

  // Fetch videos handler
  const handleFetchVideos = async () => {
    if (!authState.user) return;
    
    dispatch({ type: 'FETCH_VIDEOS_REQUEST' });
    try {
      const videos = await getVideos();
      dispatch({ type: 'FETCH_VIDEOS_SUCCESS', payload: videos });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_VIDEOS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to fetch videos' 
      });
    }
  };

  // Add video handler
  const handleAddVideo = async (data: CreateVideoData) => {
    if (!authState.user) return;
    
    dispatch({ type: 'ADD_VIDEO_REQUEST' });
    try {
      const video = await createVideo(data);
      dispatch({ type: 'ADD_VIDEO_SUCCESS', payload: video });
    } catch (error) {
      dispatch({ 
        type: 'ADD_VIDEO_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to add video' 
      });
    }
  };

  // Set current video handler
  const handleSetCurrentVideo = (video: Video) => {
    dispatch({ type: 'SET_CURRENT_VIDEO', payload: video });
  };

  const value = {
    state,
    fetchVideos: handleFetchVideos,
    addVideo: handleAddVideo,
    setCurrentVideo: handleSetCurrentVideo,
  };

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
};

