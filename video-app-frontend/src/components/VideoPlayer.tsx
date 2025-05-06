// src/components/VideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  TouchableWithoutFeedback, 
  TouchableOpacity,
  Text,
  Animated
} from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../types/video.types';

interface VideoPlayerProps {
  video: Video;
  shouldPlay: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, shouldPlay }) => {
  const [status, setStatus] = useState<any>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<ExpoVideo>(null);
  const doubleTapRef = useRef<NodeJS.Timeout | null>(null);
  const likeAnimationValue = useRef(new Animated.Value(0)).current;
  const progressAnimationValue = useRef(new Animated.Value(0)).current;
  const controlsFadeAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (shouldPlay && isPlaying) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [shouldPlay, isPlaying]);
  // Add cleanup
useEffect(() => {
  return () => {
    if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
  };
}, []);

  useEffect(() => {
    // Hide controls after 3 seconds
    if (showControls) {
      const timer = setTimeout(() => {
        fadeOutControls();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTap = () => {
    if (doubleTapRef.current) {
      // This is a double tap
      clearTimeout(doubleTapRef.current);
      doubleTapRef.current = null;
      handleDoubleTap();
    } else {
      // This might be a single tap
      doubleTapRef.current = setTimeout(() => {
        // This is a single tap
        toggleControls();
        doubleTapRef.current = null;
      }, 300);
    }
  };

  const handleDoubleTap = () => {
    // Show heart animation
    Animated.sequence([
      Animated.timing(likeAnimationValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimationValue, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Here you would also trigger the like API call if implemented
    console.log('Double tap like for video:', video.id);
  };

  const toggleControls = () => {
    if (showControls) {
      fadeOutControls();
    } else {
      setShowControls(true);
      Animated.timing(controlsFadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const fadeOutControls = () => {
    Animated.timing(controlsFadeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };

  // Update progress bar
  useEffect(() => {
    if (status.isLoaded && status.durationMillis) {
      const progress = status.positionMillis / status.durationMillis;
      progressAnimationValue.setValue(progress);
    }
  }, [status]);

  const heartScale = likeAnimationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.5, 0],
  });

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <ExpoVideo
          ref={videoRef}
          style={styles.video}
          source={{ uri: video.url }}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={isMuted}
          shouldPlay={shouldPlay && isPlaying}
          onPlaybackStatusUpdate={(status) => setStatus(status)}
          onError={(e) => console.log('Video Error:', e)}
        />

        {/* Double tap heart animation */}
        <Animated.View style={[
          styles.heartAnimation,
          {
            transform: [{ scale: heartScale }],
            opacity: likeAnimationValue,
          }
        ]}>
          <Ionicons name="heart" size={100} color="#ff4757" />
        </Animated.View>

        {/* Video controls */}
        {showControls && (
          <Animated.View style={[styles.controlsContainer, { opacity: controlsFadeAnimation }]}>
            <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
              <Ionicons 
                name={isMuted ? "volume-mute" : "volume-high"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              {status.isLoaded && (
                <Text style={styles.timeText}>
                  {formatTime(status.positionMillis)} / {formatTime(status.durationMillis)}
                </Text>
              )}
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { width: progressAnimationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }) }
                  ]} 
                />
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width,
    height,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  heartAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff4757',
    borderRadius: 3,
  },
});