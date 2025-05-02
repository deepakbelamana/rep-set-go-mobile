import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Button, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pwdHash, setPwdHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !pwdHash) {
      Toast.show({ type: 'error', text1: 'Please enter all fields' });
      return;
    }

    setIsLoading(true);
    try {
     console.log(`${process.env.EXPO_PUBLIC_API_URL}/users/login`);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pwd_hash: pwdHash }),
      });

      if (response.ok) {
        const token = response.headers.get('token');
        const userId:any = response.headers.get('userId');
        console.log(`token ${token},user-id ${userId}`);
        if (token) {
          // For production, consider using expo-secure-store
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('userId', userId);
          Toast.show({
            type: 'success',
            text1: 'Welcome back!',
            onHide: () => router.replace('/'),
          });
        } else {
          Toast.show({ type: 'error', text1: 'Login success but no token received' });
        }
      } else {
        const errorText = await response.text();
        Toast.show({ type: 'error', text1: errorText || 'Login failed' });
      }
    } catch (err) {
      console.error('Login error:', err);
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Toast />
      <Text style={styles.title}>Rep Set Go</Text>

      <View style={styles.card}>
        <Text style={styles.header}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"
          value={pwdHash}
          onChangeText={setPwdHash}
          secureTextEntry
        />

        <Button title={isLoading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={isLoading} />

        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.link}>Dont have an account? Sign up here</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#121212',
      padding: 24,
    },
    title: {
      textAlign: 'center',
      fontSize: 28,
      fontWeight: 'bold',
      color: '#00ff99',
      marginBottom: 24,
    },
    card: {
      backgroundColor: '#1e1e1e',
      padding: 24,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#555',
    },
    header: {
      fontSize: 22,
      color: '#fff',
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#2a2a2a',
      color: '#fff',
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#444',
    },
    link: {
      marginTop: 16,
      color: '#00ff99',
      textAlign: 'center',
    },
  });
  