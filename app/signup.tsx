import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !pwd || !confirmPwd) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }

    if (pwd !== confirmPwd) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pwd_hash: pwd }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Signup successful. Please log in.' });
        router.replace('/login');
      } else {
        Toast.show({ type: 'error', text1: data.message || 'Signup failed' });
      }
    } catch (err) {
      console.error('Signup error:', err);
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry
        onChangeText={setPwd}
        value={pwd}
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry
        onChangeText={setConfirmPwd}
        value={confirmPwd}
      />

      <Button title={loading ? 'Signing up...' : 'Sign Up'} onPress={handleSignup} disabled={loading} />
      <View style={{ marginTop: 10 }}>
        <Text style={styles.link} onPress={() => router.replace('/login')}>
          Already have an account? Login
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#00ff99',
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  link: {
    color: '#00ff99',
    textAlign: 'center',
    marginTop: 12,
  },
});
