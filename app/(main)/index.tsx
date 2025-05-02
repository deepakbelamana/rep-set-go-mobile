import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';


interface Group {
  group_id: number;
  user_id: string;
  group_name: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) return;
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/group/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
        } else {
          Toast.show({ type: 'error', text1: 'Failed to load groups' });
        }
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Error loading groups' });
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const addGroup = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/group`, {
        method: 'POST', headers: {
          'Content-Type': 'application/json', Authorization: `Bearer ${token}`
        }, body: JSON.stringify({ user_id: userId, group_name: newName.trim() })
      });
      if (res.ok) {
        const saved = await res.json();
        setGroups(prev => [...prev, saved]);
        setNewName(''); setShowInput(false);
        Toast.show({ type: 'success', text1: 'Group added' });
      } else {
        Toast.show({ type: 'error', text1: 'Add failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error adding group' });
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editingId) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/group`, {
        method: 'PUT', headers: {
          'Content-Type': 'application/json', Authorization: `Bearer ${token}`
        }, body: JSON.stringify({ group_id: editingId, group_name: editName.trim(), user_id: await AsyncStorage.getItem('userId') })
      });
      if (res.ok) {
        setGroups(prev => prev.map(g => g.group_id === editingId ? { ...g, group_name: editName.trim() } : g));
        setEditingId(null); setEditName('');
        Toast.show({ type: 'success', text1: 'Group updated' });
      } else {
        Toast.show({ type: 'error', text1: 'Update failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error updating group' });
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id) => {
    setLoading(true);
    try {
      await AsyncStorage.clear();
      router.replace('/login');
      const token = await AsyncStorage.getItem('token');
      const group = groups.find(g => g.group_id === id);
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/group`, {
        method: 'DELETE', headers: {
          'Content-Type': 'application/json', Authorization: `Bearer ${token}`
        }, body: JSON.stringify(group)
      });
      if (res.ok) {
        setGroups(prev => prev.filter(g => g.group_id !== id));
        Toast.show({ type: 'success', text1: 'Group deleted' });
      } else {
        Toast.show({ type: 'error', text1: 'Delete failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error deleting group' });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => router.push(`/workout/${item.group_id}`)}>
      {editingId === item.group_id ? (
        <View style={styles.row}> 
          <TextInput style={styles.inputRow} value={editName} onChangeText={setEditName} autoFocus />
          <FontAwesome5 name="check" size={18} color="#4CAF50" onPress={saveEdit} />
          <FontAwesome5 name="times" size={18} color="#ff4444" onPress={() => setEditingId(null)} />
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={styles.text}>{item.group_name}</Text>
          <View style={styles.actions}>
            <FontAwesome5 name="edit" size={18} color="#00ff99" onPress={() => { setEditingId(item.group_id); setEditName(item.group_name); }} />
            <FontAwesome5 name="trash" size={18} color="#ff4444" onPress={() => deleteGroup(item.group_id)} style={{ marginLeft: 12 }} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#00ff99" />;

  return (
    <View style={styles.container}>
      <Toast />
      <Text style={styles.title}>Welcome to Rep-Set-Go!</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowInput(true)}>
        <Text style={styles.addText}>+ Add Workout Group</Text>
      </TouchableOpacity>
      {showInput && (
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Enter group name"
            placeholderTextColor="#888"
            value={newName}
            onChangeText={setNewName}
          />
          <View style={styles.row}>
            <Button title="Cancel" onPress={() => { setShowInput(false); setNewName(''); }} />
            <Button title="Save" onPress={addGroup} />
          </View>
        </View>
      )}
      <FlatList
        data={groups}
        keyExtractor={item => item.group_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 24, color: '#00ff99', marginBottom: 16, textAlign: 'center' },
  addBtn: { backgroundColor: '#00aa66', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  addText: { color: '#fff', fontSize: 16 },
  card: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 6, marginBottom: 16 },
  input: { backgroundColor: '#2a2a2a', color: '#fff', borderRadius: 6, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#444' },
  item: { backgroundColor: '#2d2d2d', padding: 14, borderRadius: 6, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  text: { color: '#fff', fontSize: 16 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  inputRow: { flex: 1, backgroundColor: '#2a2a2a', color: '#fff', borderRadius: 6, padding: 6, marginRight: 8 }
});
