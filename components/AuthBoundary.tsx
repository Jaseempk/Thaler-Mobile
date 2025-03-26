import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { usePrivy } from '@privy-io/expo';
import { Redirect } from 'expo-router';
import { UsePrivy } from '../types/privy';

interface AuthBoundaryProps {
  children: React.ReactNode;
}

export const AuthBoundary: React.FC<AuthBoundaryProps> = ({ children }) => {
  const privyHook = usePrivy();
  const { user, isReady } = privyHook as unknown as UsePrivy;
  const [isLoading, setIsLoading] = useState(true);
  
  // Add debugging logs
  useEffect(() => {
    console.log('AuthBoundary - State Update:', {
      isReady,
      hasUser: !!user,
      timestamp: new Date().toISOString(),
    });
    
    // Only set loading to false when we have a definitive authentication state
    if (isReady) {
      setIsLoading(false);
    }
  }, [isReady,  user]);

  // Show loading state while Privy is initializing
  if (isLoading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading authentication...</Text>
      </View>
    );
  }

  // If not authenticated, redirect to welcome
  if (!isReady || !user) {
    console.log('AuthBoundary - Not authenticated, redirecting to welcome');
    return <Redirect href="/auth/welcome" />;
  }

  // User is authenticated and we have user data
  console.log('AuthBoundary - User authenticated, rendering children');
  return <>{children}</>;
}; 