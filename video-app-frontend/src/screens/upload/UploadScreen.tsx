// src/screens/upload/UploadScreen.tsx
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useVideos } from '../../hooks/useVideos';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const UploadScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const { addVideo, state } = useVideos();
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const handleUpload = async () => {
    // Basic validation
    if (!title || !url) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // URL validation (basic)
    if (!url.match(/\.(mp4|mov|avi)$/)) {
      Alert.alert('Error', 'Please enter a valid video URL (.mp4, .mov, or .avi)');
      return;
    }

    try {
      await addVideo({ title, description, url });
      // Clear form on success
      setTitle('');
      setDescription('');
      setUrl('');
      Alert.alert('Success', 'Your video has been uploaded!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Upload Failed', error.message);
      } else {
        Alert.alert('Upload Failed', 'An unknown error occurred');
      }
    }

  };
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled && 'assets' in result && result.assets?.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Video</Text>
      </View>
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView>
          {/* Placeholder for video preview */}
          <View style={styles.previewContainer}>
            <Ionicons name="videocam" size={48} color="#666" />
            <Text style={styles.previewText}>
              Upload your video by providing a URL
            </Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Video Title*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter video title"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
            
            <Text style={styles.label}>Video URL*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter video URL (.mp4, .mov, .avi)"
              placeholderTextColor="#666"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter video description"
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
              disabled={state.isLoading}
            >
              <Text style={styles.uploadButtonText}>Upload Video</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#222',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  previewText: {
    color: '#aaa',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    padding: 16,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#ff4757',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UploadScreen;