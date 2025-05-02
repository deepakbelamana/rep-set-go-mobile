import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { FontAwesome5 } from '@expo/vector-icons';

interface Workout {
  workout_id: number;
  workout_name: string;
  group_id: number;
}

export default function WorkoutScreen() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/workout/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWorkouts(data);
        } else {
          Toast.show({ type: 'error', text1: 'Failed to load workouts' });
        }
      } catch {
        Toast.show({ type: 'error', text1: 'Error loading workouts' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkouts();
  }, [groupId]);

  const handleAdd = async () => {
    if (!newWorkoutName.trim()) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ group_id: groupId, workout_name: newWorkoutName.trim() })
      });
      if (res.ok) {
        const saved = await res.json();
        setWorkouts(prev => [...prev, saved]);
        setNewWorkoutName('');
        setShowInput(false);
        Toast.show({ type: 'success', text1: 'Workout added' });
      } else {
        Toast.show({ type: 'error', text1: 'Add failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error adding workout' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId || !editName.trim()) return;
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/workout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ workout_id: editingId, group_id:groupId, workout_name: editName.trim() })
      });
      if (res.ok) {
        setWorkouts(prev => prev.map(w =>
          w.workout_id === editingId ? { ...w, workout_name: editName.trim() } : w
        ));
        setEditingId(null);
        setEditName('');
        Toast.show({ type: 'success', text1: 'Workout updated' });
      } else {
        Toast.show({ type: 'error', text1: 'Update failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error updating workout' });
    }
  };

  const handleDelete = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const workoutToDelete = workouts.find(w => w.workout_id === id);
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/workout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workoutToDelete)
      });
      if (res.ok) {
        setWorkouts(prev => prev.filter(w => w.workout_id !== id));
        Toast.show({ type: 'success', text1: 'Workout deleted' });
      } else {
        Toast.show({ type: 'error', text1: 'Delete failed' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error deleting workout' });
    }
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/workout_set/${item.workout_id}`)}
    >
      {editingId === item.workout_id ? (
        <View style={styles.row}>
          <TextInput
            style={styles.inputRow}
            value={editName}
            onChangeText={setEditName}
            autoFocus
          />
          <FontAwesome5 name="check" size={18} color="#4CAF50" onPress={handleEdit} />
          <FontAwesome5 name="times" size={18} color="#ff4444" onPress={() => setEditingId(null)} />
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={styles.text}>{item.workout_name}</Text>
          <View style={styles.actions}>
            <FontAwesome5 name="edit" size={18} color="#00ff99" onPress={() => { setEditingId(item.workout_id); setEditName(item.workout_name); }} style={{marginLeft:80}} />
            <FontAwesome5 name="trash" size={18} color="#ff4444" onPress={() => handleDelete(item.workout_id)} style={{ marginLeft: 40 }} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Toast />
      <Text style={styles.header}>Workouts</Text>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowInput(true)}>
        <Text style={styles.addText}>+ Add Workout</Text>
      </TouchableOpacity>

      {showInput && (
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={newWorkoutName}
            onChangeText={setNewWorkoutName}
            placeholder="Enter workout name"
            placeholderTextColor="#888"
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={() => { setShowInput(false); setNewWorkoutName(''); }}>
              <Text style={{ color: '#ccc' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={{ color: '#00ff99' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#00ff99" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={item => item.workout_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  header: { fontSize: 22, color: '#00ff99', marginBottom: 16 },
  addBtn: {
    backgroundColor: '#00aa66',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  addText: { color: '#fff', fontSize: 16 },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  item: {
    backgroundColor: '#2d2d2d',
    padding: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  text: { color: '#fff', fontSize: 14 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  inputRow: {
    flex: 0.77,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 6,
    padding: 6,
    marginRight: 8,
  },
});
