import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { VideoProvider } from './src/context/VideoContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VideoProvider>
          <AppNavigator />
        </VideoProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}