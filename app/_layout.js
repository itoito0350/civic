import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/authProvider';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

function AuthRedirector() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/index'); 
      } else {
        router.replace('/auth/login');
      }
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

 
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthRedirector />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
}
