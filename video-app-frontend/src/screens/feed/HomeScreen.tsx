// src/screens/feed/HomeScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Dimensions, 
  ActivityIndicator, 
  Text, 
  ViewToken,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ScrollView
} from 'react-native';
import { useVideos } from '../../hooks/useVideos';
import { VideoCard } from '../../components/VideoCard';
import { Video } from '../../types/video.types';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Categories for video filtering
const CATEGORIES = ['For You', 'Following', 'Trending', 'Sports', 'Comedy', 'Food'];

const HomeScreen: React.FC = () => {
  const { state, fetchVideos } = useVideos();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Category indicator animation
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const firstViewableItem = viewableItems[0];
      if (firstViewableItem.index !== null) {
        setActiveVideoIndex(firstViewableItem.index);
        // Reset video load failure status on new video
        setVideoLoadFailed(false);
      }
    }
  }).current;
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchVideos();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchVideos]);

  const handleCategoryChange = (category: string, index: number) => {
    setSelectedCategory(category);
    
    // Animate the indicator
    Animated.spring(indicatorPosition, {
      toValue: index * (Dimensions.get('window').width / CATEGORIES.length),
      friction: 8,
      tension: 100,
      useNativeDriver: false, // Layout animations can't use native driver
    }).start();
    
    // In a real app, you would fetch videos for the selected category
    // For now, we'll just simulate this with a loading state
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleVideoError = () => {
    setVideoLoadFailed(true);
  };

  const renderItem = useCallback(({ item, index }: { item: Video; index: number }) => (
    <VideoCard 
      video={item} 
      isActive={index === activeVideoIndex} 
    />
  ), [activeVideoIndex]);

  const renderCategoryBar = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {CATEGORIES.map((category, index) => (
          <TouchableOpacity
            key={category}
            style={styles.categoryItem}
            onPress={() => handleCategoryChange(category, index)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View 
          style={[
            styles.categoryIndicator,
            { 
              width: Dimensions.get('window').width / CATEGORIES.length,
              transform: [{ translateX: indicatorPosition }]
            }
          ]} 
        />
      </ScrollView>
    </View>
  );

  if (state.isLoading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff4757" />
        <Text style={styles.loadingText}>Loading awesome videos...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline" size={64} color="#ff4757" />
        <Text style={styles.errorText}>Oops! Something went wrong</Text>
        <Text style={styles.errorSubtext}>{state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVideos}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state.videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="videocam-outline" size={64} color="#aaa" />
        <Text style={styles.emptyText}>No videos found</Text>
        <Text style={styles.emptySubtext}>Pull down to refresh</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#ff4757" />
        </TouchableOpacity>
      </View>
    );
  }

  if (videoLoadFailed) {
    return (
      <View style={styles.videoErrorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ff4757" />
        <Text style={styles.videoErrorText}>Failed to load video</Text>
        <Text style={styles.videoErrorSubtext}>Swipe up or down to try another video</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Category bar */}
      {renderCategoryBar()}
      
      <FlatList
        ref={flatListRef}
        data={state.videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
         // Performance optimizations:
        initialNumToRender={3} // Only render 3 items initially
        maxToRenderPerBatch={5} // Render 5 new items per batch
        windowSize={5} // Render 5 items in memory (1 above, 3 below)
        removeClippedSubviews={true} // Unmount offscreen views
        updateCellsBatchingPeriod={100} // Batch updates
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={Dimensions.get('window').height}
        snapToAlignment="start"
        decelerationRate="fast"
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  categoryContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  categoryScrollContent: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  categoryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryTextActive: {
    color: '#fff',
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#ff4757',
    borderRadius: 3,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#ff4757',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorSubtext: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
  refreshButton: {
    marginTop: 20,
    padding: 10,
  },
  videoErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  videoErrorText: {
    color: '#ff4757',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  videoErrorSubtext: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;