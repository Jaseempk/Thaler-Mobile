import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { usePrivy } from '@privy-io/expo';
import { Redirect } from 'expo-router';
import { UsePrivy } from '../types/privy';

interface AuthBoundaryProps {
  children: React.ReactNode;
}

export const AuthBoundary: React.FC<AuthBoundaryProps> = ({ children }) => {
  const privyHook = usePrivy();
  const { authenticated, user } = privyHook as unknown as UsePrivy;

  if (!authenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/welcome" />;
  }

  return <>{children}</>;
}; 