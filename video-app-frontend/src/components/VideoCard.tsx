import React, { useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { VideoPlayer } from './VideoPlayer';
import { ActionButtons } from './ActionButtons';
import { Video } from '../types/video.types';
import { Ionicons } from '@expo/vector-icons';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
}

const { width, height } = Dimensions.get('window');

const VideoCard: React.FC<VideoCardProps> = React.memo(({ video, isActive }) => {
  const [infoVisible, setInfoVisible] = React.useState(true);
  const infoAnimation = React.useRef(new Animated.Value(1)).current;
  const hashtagOpacity = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Memoize hashtags generation
  const hashtags = useMemo(() => {
    const words = video.title.split(' ');
    return words
      .map(word => `#${word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`)
      .slice(0, 2);
  }, [video.title]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    const date = new Date(video.createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, [video.createdAt]);

  // Animation effects
  useEffect(() => {
    if (isActive) {
      Animated.stagger(150, [
        Animated.spring(hashtagOpacity.x, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(hashtagOpacity.y, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      hashtagOpacity.setValue({ x: 0, y: 0 });
    }
  }, [isActive, hashtagOpacity]);

  const toggleInfo = useCallback(() => {
    const newVisibility = !infoVisible;
    setInfoVisible(newVisibility);
    
    Animated.timing(infoAnimation, {
      toValue: newVisibility ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [infoVisible, infoAnimation]);

  // Memoize animated styles
  const infoContainerStyle = useMemo(() => [
    styles.infoContainer, 
    { 
      opacity: infoAnimation,
      transform: [
        { 
          translateY: infoAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }
      ] 
    }
  ], [infoAnimation]);

  // Memoize hashtag animated styles
  const getHashtagStyle = useCallback((index: number) => ({
    opacity: index === 0 ? hashtagOpacity.x : hashtagOpacity.y,
    transform: [{ 
      translateX: (index === 0 ? hashtagOpacity.x : hashtagOpacity.y).interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0]
      })
    }]
  }), [hashtagOpacity]);

  return (
    <View style={styles.container}>
      <VideoPlayer video={video} shouldPlay={isActive} />
      
      <TouchableOpacity 
        style={styles.infoToggle}
        onPress={toggleInfo}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={infoVisible ? "chevron-down-circle" : "chevron-up-circle"} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
      
      <Animated.View style={infoContainerStyle}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {video.author?.username ? video.author.username[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.username}>@{video.author?.username || 'user'}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{video.description}</Text>
        
        <View style={styles.hashtagContainer}>
          {hashtags.map((tag, index) => (
            <Animated.View key={index} style={getHashtagStyle(index)}>
              <TouchableOpacity>
                <Text style={styles.hashtag}>{tag}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
      
      <ActionButtons video={video} />
      
      <View style={styles.musicContainer}>
        <Ionicons name="musical-notes" size={16} color="white" />
        <Text style={styles.musicText}>
          Original Sound - {video.author?.username || 'user'}
        </Text>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if video data or active status changes
  return prevProps.video.id === nextProps.video.id && 
         prevProps.isActive === nextProps.isActive;
});

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#000',
  },
  infoToggle: {
    position: 'absolute',
    right: 10,
    top: 40,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 120,
    left: 10,
    right: 70,
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    color: '#aaa',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  followText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtag: {
    color: '#5df',
    marginRight: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  musicContainer: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
  },
});

export { VideoCard };