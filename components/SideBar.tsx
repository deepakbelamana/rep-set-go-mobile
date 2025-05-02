import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Sidebar() {
  const [visible, setVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0]; // offscreen to right
  const router = useRouter();

  const open = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleLogout = async () => {
 
      await AsyncStorage.clear();
      router.replace('/login');

  };

  return (
    <>
      {/* Hamburger/Profile Button */}
      <TouchableOpacity style={styles.toggle} onPress={open}>
        <FontAwesome5 name="user-circle" size={24} color="#00ff99" />
      </TouchableOpacity>

      {/* Offcanvas Modal */}
      <Modal transparent visible={visible} animationType="none">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={styles.content}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity style={styles.button} onPress={() => { /* nav to profile */ }}>
              <Text style={styles.btnText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.logout]} onPress={handleLogout}>
              <Text style={styles.btnText}>Logout</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toggle: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000077',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 300,
    bottom: 0,
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.5,
    elevation: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#00aa66',
    borderRadius: 6,
    marginBottom: 12,
  },
  logout: {
    backgroundColor: '#cc4444',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
