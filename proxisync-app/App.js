import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { SessionProvider } from './src/context/SessionContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SessionProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </SessionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
