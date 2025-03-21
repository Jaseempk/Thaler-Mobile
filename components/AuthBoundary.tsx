import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { usePrivy } from '@privy-io/expo';
import { Redirect } from 'expo-router';

interface AuthBoundaryProps {
  children: React.ReactNode;
}

export const AuthBoundary: React.FC<AuthBoundaryProps> = ({ children }) => {
  const { ready, isAuthenticated } = usePrivy();

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/welcome" />;
  }

  return <>{children}</>;
}; 