// src/components/ActionButtons.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Share } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Video } from '../types/video.types';

interface ActionButtonsProps {
  video: Video;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ video }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 1000));
  const [commentCount, setCommentCount] = useState(Math.floor(Math.random() * 100));
  const [shareCount, setShareCount] = useState(Math.floor(Math.random() * 50));

  // Animation values
  const likeAnimation = new Animated.Value(1);
  const commentAnimation = new Animated.Value(1);
  const shareAnimation = new Animated.Value(1);

  const animateButton = (animationValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = () => {
    animateButton(likeAnimation);
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    // In a real app, you would make an API call here
    console.log('Like video:', video.id, 'New state:', !isLiked);
  };

  const handleComment = () => {
    animateButton(commentAnimation);
    // In a real app, this would open a comment modal
    console.log('Comment on video:', video.id);
    
    // For now, just increment counter for demo
    setCommentCount(commentCount + 1);
  };

  const handleShare = async () => {
    animateButton(shareAnimation);
    
    try {
      const result = await Share.share({
        message: `Check out this awesome video: ${video.title}`,
        // In a real app, you would have a real share URL
        url: `https://yourtiktokclone.com/videos/${video.id}`,
      });
      
      if (result.action === Share.sharedAction) {
        setShareCount(shareCount + 1);
        console.log('Shared video:', video.id);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
        <TouchableOpacity style={styles.button} onPress={handleLike}>
          <FontAwesome 
            name={isLiked ? "heart" : "heart-o"} 
            size={28} 
            color={isLiked ? "#ff4757" : "white"} 
          />
          <Text style={styles.buttonText}>{formatCount(likeCount)}</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View style={{ transform: [{ scale: commentAnimation }] }}>
        <TouchableOpacity style={styles.button} onPress={handleComment}>
          <FontAwesome name="comment" size={28} color="white" />
          <Text style={styles.buttonText}>{formatCount(commentCount)}</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View style={{ transform: [{ scale: shareAnimation }] }}>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Ionicons name="share-social" size={28} color="white" />
          <Text style={styles.buttonText}>{formatCount(shareCount)}</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Profile Image - Small avatar of video creator */}
      <TouchableOpacity style={styles.profileButton}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            {/* In a real app, this would be the user's profile image */}
            <Text style={styles.profileInitial}>
              {video.author?.username ? video.author.username[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.plusIcon}>
            <Ionicons name="add-circle" size={16} color="#ff4757" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 10,
    bottom: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  profileButton: {
    marginTop: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  plusIcon: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
});